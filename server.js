/* eslint-disable @typescript-eslint/no-require-imports */
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')
const { PrismaClient } = require('@prisma/client')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// 初始化 Prisma
const prisma = new PrismaClient()

// 存储房间数据（内存中，用于实时状态）
const rooms = new Map()

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // 初始化 Socket.IO
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    socket.on('join-room', async ({ roomId, userName, color, totalFocusTime, dbUserId }) => {
      console.log(`User ${userName} joining room ${roomId}`)
      
      socket.join(roomId)
      
      // 创建用户对象
      const user = {
        id: socket.id,
        name: userName,
        planetSize: 1,
        isFocused: false,
        focusStartTime: null,
        totalFocusTime: totalFocusTime || 0,
        color: color || '#4ECDC4',
      }
      
      // 获取或创建房间（内存）
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Map())
      }
      const room = rooms.get(roomId)
      room.set(socket.id, user)
      
      // 数据库操作：创建房间和房间成员关系
      if (dbUserId) {
        try {
          // 创建或获取房间
          const dbRoom = await prisma.room.upsert({
            where: { roomCode: roomId },
            update: {},
            create: {
              roomCode: roomId,
              name: `房间 ${roomId.slice(0, 6)}`,
            },
          })
          
          // 创建房间成员关系
          await prisma.roomMember.upsert({
            where: {
              userId_roomId: {
                userId: dbUserId,
                roomId: dbRoom.id,
              },
            },
            update: {
              joinedAt: new Date(),
            },
            create: {
              userId: dbUserId,
              roomId: dbRoom.id,
            },
          })
        } catch (error) {
          console.error('数据库操作失败:', error)
        }
      }
      
      // 通知房间内所有用户
      const roomUsers = Array.from(room.values())
      io.to(roomId).emit('room-users', roomUsers)
      
      // 通知其他用户新用户加入
      socket.to(roomId).emit('user-joined', user)
    })

    socket.on('update-status', (userData) => {
      // 找到用户所在的房间
      let userRoom = null
      for (const [roomId, users] of rooms.entries()) {
        if (users.has(socket.id)) {
          userRoom = roomId
          break
        }
      }
      
      if (userRoom) {
        const room = rooms.get(userRoom)
        room.set(socket.id, userData)
        
        // 广播更新到房间内的其他用户
        socket.to(userRoom).emit('user-updated', userData)
      }
    })

    socket.on('disconnect', async () => {
      console.log('Client disconnected:', socket.id)
      
      // 找到用户所在的房间并移除
      for (const [roomId, users] of rooms.entries()) {
        if (users.has(socket.id)) {
          users.delete(socket.id)
          
          // 通知房间内其他用户
          socket.to(roomId).emit('user-left', socket.id)
          
          // 如果房间为空，删除房间（仅内存）
          if (users.size === 0) {
            rooms.delete(roomId)
          }
          break
        }
      }
      
      // 注意：不删除数据库中的房间成员记录，保留历史
    })
  })

  server
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })

  // 优雅关闭
  process.on('SIGINT', async () => {
    console.log('正在关闭服务器...')
    await prisma.$disconnect()
    process.exit(0)
  })
})
