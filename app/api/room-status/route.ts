import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE: 用户离开房间
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const roomId = searchParams.get('roomId')
  const userId = searchParams.get('userId')

  if (!roomId || !userId) {
    return Response.json(
      { error: 'roomId and userId are required' }, 
      { status: 400 }
    )
  }

  try {
    // 查找房间
    const room = await prisma.room.findUnique({
      where: { roomCode: roomId }
    })

    if (!room) {
      return Response.json({ success: true }) // 房间不存在，直接返回成功
    }

    // 将 lastActiveAt 设置为很久以前，这样查询时会被过滤掉
    await prisma.roomMember.updateMany({
      where: {
        userId,
        roomId: room.id
      },
      data: {
        lastActiveAt: new Date(0), // 设置为 1970-01-01，确保被过滤
        isFocusing: false,
        focusStartTime: null
      }
    })

    return Response.json({ success: true })

  } catch (error) {
    console.error('离开房间失败:', error)
    return Response.json(
      { error: 'Failed to leave room' }, 
      { status: 500 }
    )
  }
}

// GET: 获取房间内所有活跃用户状态
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const roomId = searchParams.get('roomId')

  if (!roomId) {
    return Response.json(
      { error: 'roomId is required' }, 
      { status: 400 }
    )
  }

  try {
    // 查找房间
    const room = await prisma.room.findUnique({
      where: { roomCode: roomId }
    })

    if (!room) {
      return Response.json({ users: [], roomId, timestamp: Date.now() })
    }

    // 获取最近 5 分钟内活跃的用户
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    
    const members = await prisma.roomMember.findMany({
      where: {
        roomId: room.id,
        lastActiveAt: {
          gte: fiveMinutesAgo
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      },
      orderBy: { lastActiveAt: 'desc' }
    })

    // 转换为前端需要的格式
    const users = members.map(member => ({
      id: member.user.id,
      name: member.user.name,
      color: member.user.color,
      planetSize: 1,
      isFocused: member.isFocusing,
      focusStartTime: member.focusStartTime?.getTime() || null,
      totalFocusTime: member.totalFocusTime || 0
    }))

    return Response.json({ 
      users,
      roomId,
      timestamp: Date.now()
    })

  } catch (error) {
    console.error('获取房间状态失败:', error)
    return Response.json(
      { error: 'Failed to fetch room status' }, 
      { status: 500 }
    )
  }
}

// POST: 更新用户在房间中的状态
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      roomId,
      userId, 
      userName, 
      color, 
      isFocusing, 
      focusStartTime, 
      totalFocusTime 
    } = body

    if (!roomId || !userId) {
      return Response.json(
        { error: 'roomId and userId are required' }, 
        { status: 400 }
      )
    }

    // 创建或获取房间
    const room = await prisma.room.upsert({
      where: { roomCode: roomId },
      create: { 
        roomCode: roomId, 
        name: `房间 ${roomId.slice(0, 6)}` 
      },
      update: {}
    })

    // 更新用户状态
    await prisma.roomMember.upsert({
      where: {
        userId_roomId: { 
          userId, 
          roomId: room.id 
        }
      },
      create: {
        userId,
        roomId: room.id,
        isFocusing: isFocusing || false,
        focusStartTime: focusStartTime ? new Date(focusStartTime) : null,
        totalFocusTime: totalFocusTime || 0,
        lastActiveAt: new Date()
      },
      update: {
        isFocusing: isFocusing || false,
        focusStartTime: focusStartTime ? new Date(focusStartTime) : null,
        totalFocusTime: totalFocusTime || 0,
        lastActiveAt: new Date()  // 更新最后活跃时间
      }
    })

    return Response.json({ success: true })

  } catch (error) {
    console.error('更新房间状态失败:', error)
    return Response.json(
      { error: 'Failed to update room status' }, 
      { status: 500 }
    )
  }
}
