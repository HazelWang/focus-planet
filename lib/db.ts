import prisma from './prisma'

// 用户相关操作
export const userDb = {
  // 创建或获取用户
  async createOrGetUser(data: { name: string; color: string; email?: string }) {
    return await prisma.user.upsert({
      where: { email: data.email || `guest_${Date.now()}` },
      update: {
        name: data.name,
        color: data.color,
      },
      create: {
        name: data.name,
        color: data.color,
        email: data.email,
      },
    })
  },

  // 根据 ID 获取用户
  async getUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        focusSessions: {
          orderBy: { startTime: 'desc' },
          take: 10,
        },
      },
    })
  },

  // 获取用户统计
  async getUserStats(userId: string) {
    const sessions = await prisma.focusSession.findMany({
      where: { userId, completed: true },
    })

    const totalFocusTime = sessions.reduce((sum, session) => sum + session.duration, 0)
    const totalSessions = sessions.length

    return {
      totalFocusTime,
      totalSessions,
      averageSessionTime: totalSessions > 0 ? totalFocusTime / totalSessions : 0,
    }
  },
}

// 房间相关操作
export const roomDb = {
  // 创建房间
  async createRoom(roomCode: string, name?: string) {
    return await prisma.room.upsert({
      where: { roomCode },
      update: {},
      create: {
        roomCode,
        name,
      },
    })
  },

  // 获取房间信息
  async getRoom(roomCode: string) {
    return await prisma.room.findUnique({
      where: { roomCode },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    })
  },

  // 用户加入房间
  async joinRoom(userId: string, roomCode: string) {
    const room = await this.createRoom(roomCode)
    
    return await prisma.roomMember.upsert({
      where: {
        userId_roomId: {
          userId,
          roomId: room.id,
        },
      },
      update: {},
      create: {
        userId,
        roomId: room.id,
      },
    })
  },

  // 用户离开房间
  async leaveRoom(userId: string, roomCode: string) {
    const room = await prisma.room.findUnique({
      where: { roomCode },
    })

    if (!room) return null

    return await prisma.roomMember.deleteMany({
      where: {
        userId,
        roomId: room.id,
      },
    })
  },
}

// 专注记录相关操作
export const sessionDb = {
  // 开始专注
  async startSession(userId: string, roomId?: string) {
    return await prisma.focusSession.create({
      data: {
        userId,
        roomId,
        startTime: new Date(),
      },
    })
  },

  // 结束专注
  async endSession(sessionId: string) {
    const session = await prisma.focusSession.findUnique({
      where: { id: sessionId },
    })

    if (!session) return null

    const endTime = new Date()
    const duration = Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000)

    return await prisma.focusSession.update({
      where: { id: sessionId },
      data: {
        endTime,
        duration,
        completed: true,
      },
    })
  },

  // 获取用户的专注记录
  async getUserSessions(userId: string, limit = 20) {
    return await prisma.focusSession.findMany({
      where: { userId },
      orderBy: { startTime: 'desc' },
      take: limit,
    })
  },

  // 获取房间的专注记录
  async getRoomSessions(roomId: string, limit = 20) {
    return await prisma.focusSession.findMany({
      where: { roomId },
      orderBy: { startTime: 'desc' },
      take: limit,
      include: {
        user: true,
      },
    })
  },
}

export default prisma
