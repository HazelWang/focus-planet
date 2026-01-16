// API 工具函数 - 调用数据库接口

// 用户相关
export const userApi = {
  // 创建或获取用户
  async createOrGetUser(data: { name: string; color: string; email?: string }) {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create user')
    return response.json()
  },

  // 获取用户信息
  async getUser(userId: string) {
    const response = await fetch(`/api/users?id=${userId}`)
    if (!response.ok) throw new Error('Failed to get user')
    return response.json()
  },
}

// 统计相关
export const statsApi = {
  // 获取用户统计
  async getUserStats(userId: string) {
    const response = await fetch(`/api/stats?userId=${userId}`)
    if (!response.ok) throw new Error('Failed to get stats')
    return response.json()
  },
}

// 专注会话相关
export const sessionApi = {
  // 开始专注
  async startSession(userId: string, roomId?: string) {
    const response = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, roomId }),
    })
    if (!response.ok) throw new Error('Failed to start session')
    return response.json()
  },

  // 结束专注
  async endSession(sessionId: string) {
    const response = await fetch('/api/sessions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
    if (!response.ok) throw new Error('Failed to end session')
    return response.json()
  },

  // 获取用户的专注记录
  async getUserSessions(userId: string, limit = 20) {
    const response = await fetch(`/api/sessions?userId=${userId}&limit=${limit}`)
    if (!response.ok) throw new Error('Failed to get sessions')
    return response.json()
  },

  // 获取房间的专注记录
  async getRoomSessions(roomId: string, limit = 20) {
    const response = await fetch(`/api/sessions?roomId=${roomId}&limit=${limit}`)
    if (!response.ok) throw new Error('Failed to get room sessions')
    return response.json()
  },
}
