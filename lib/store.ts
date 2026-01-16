import { create } from 'zustand'
import useSWR from 'swr'

export interface User {
  id: string
  name: string
  planetSize: number
  isFocused: boolean
  focusStartTime: number | null
  totalFocusTime: number
  color: string
}

interface AppState {
  // 当前用户
  userId: string
  userName: string
  userColor: string
  dbUserId: string | null // 数据库用户 ID
  
  // 房间
  roomId: string | null
  
  // 番茄钟
  focusDuration: number // 默认 25 分钟（毫秒）
  isFocused: boolean
  focusStartTime: number | null
  remainingTime: number
  totalFocusTime: number
  
  // 数据库会话
  currentSessionId: string | null
  
  // 操作
  setUserId: (id: string) => void
  setUserName: (name: string) => void
  setRoomId: (id: string) => void
  setDbUserId: (id: string | null) => void
  setCurrentSessionId: (id: string | null) => void
  joinRoom: (roomId: string, userName: string) => Promise<void>
  leaveRoom: () => Promise<void>
  startFocus: () => Promise<void>
  pauseFocus: () => Promise<void>
  endFocus: () => Promise<void>
  updateRemainingTime: (time: number) => void
}

export const useStore = create<AppState>((set, get) => ({
  userId: '',
  userName: '',
  userColor: generateRandomColor(),
  dbUserId: null,
  roomId: null,
  focusDuration: 25 * 60 * 1000, // 25 分钟
  isFocused: false,
  focusStartTime: null,
  remainingTime: 25 * 60 * 1000,
  totalFocusTime: 0,
  currentSessionId: null,

  setUserId: (id) => set({ userId: id }),
  
  setUserName: (name) => set({ userName: name }),
  
  setRoomId: (id) => set({ roomId: id }),
  
  setDbUserId: (id) => set({ dbUserId: id }),
  
  setCurrentSessionId: (id) => set({ currentSessionId: id }),
  
  // 加入房间 - 使用 API 调用替代 Socket.io
  joinRoom: async (roomId, userName) => {
    const { dbUserId, userColor, totalFocusTime } = get()
    
    if (!dbUserId) {
      console.error('dbUserId is required to join room')
      return
    }
    
    try {
      // 发送初始状态到服务器
      await fetch('/api/room-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          userId: dbUserId,
          userName,
          color: userColor,
          isFocusing: false,
          focusStartTime: null,
          totalFocusTime: Math.floor(totalFocusTime / 1000) // 转换为秒
        })
      })
      
      set({ roomId, userName, userId: dbUserId })
      console.log('✅ 成功加入房间:', roomId)
    } catch (error) {
      console.error('❌ 加入房间失败:', error)
    }
  },
  
  // 离开房间
  leaveRoom: async () => {
    const { roomId, dbUserId } = get()
    
    if (!roomId || !dbUserId) return
    
    try {
      // 调用 DELETE API 标记用户离线
      await fetch(`/api/room-status?roomId=${roomId}&userId=${dbUserId}`, {
        method: 'DELETE'
      })
      
      set({ roomId: null })
      console.log('✅ 已离开房间')
    } catch (error) {
      console.error('❌ 离开房间失败:', error)
    }
  },
  
  // 开始专注
  startFocus: async () => {
    const { focusDuration, dbUserId, roomId, userName, userColor, totalFocusTime } = get()
    const now = Date.now()
    
    set({
      isFocused: true,
      focusStartTime: now,
      remainingTime: focusDuration,
    })
    
    // 开始数据库会话
    if (dbUserId) {
      try {
        const { sessionApi } = await import('./api')
        const session = await sessionApi.startSession(dbUserId, roomId || undefined)
        set({ currentSessionId: session.id })
      } catch (error) {
        console.error('Failed to start session in DB:', error)
      }
    }
    
    // 更新房间状态
    if (roomId && dbUserId) {
      try {
        await fetch('/api/room-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId,
            userId: dbUserId,
            userName,
            color: userColor,
            isFocusing: true,
            focusStartTime: now,
            totalFocusTime: Math.floor(totalFocusTime / 1000)
          })
        })
        console.log('✅ 开始专注状态已同步')
      } catch (error) {
        console.error('❌ 同步专注状态失败:', error)
      }
    }
  },
  
  // 暂停专注
  pauseFocus: async () => {
    const { dbUserId, roomId, userName, userColor, focusStartTime, totalFocusTime, currentSessionId } = get()
    
    // 计算本次专注时间
    let addedTime = 0
    if (focusStartTime) {
      addedTime = Date.now() - focusStartTime
    }
    
    const newTotalTime = totalFocusTime + addedTime
    
    set({
      isFocused: false,
      focusStartTime: null,
      totalFocusTime: newTotalTime,
    })
    
    // 结束数据库会话
    if (currentSessionId) {
      try {
        const { sessionApi } = await import('./api')
        await sessionApi.endSession(currentSessionId)
        set({ currentSessionId: null })
      } catch (error) {
        console.error('Failed to end session in DB:', error)
      }
    }
    
    // 更新房间状态
    if (roomId && dbUserId) {
      try {
        await fetch('/api/room-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId,
            userId: dbUserId,
            userName,
            color: userColor,
            isFocusing: false,
            focusStartTime: null,
            totalFocusTime: Math.floor(newTotalTime / 1000)
          })
        })
        console.log('✅ 暂停专注状态已同步')
      } catch (error) {
        console.error('❌ 同步专注状态失败:', error)
      }
    }
  },
  
  // 结束专注
  endFocus: async () => {
    const { dbUserId, roomId, userName, userColor, focusStartTime, totalFocusTime, currentSessionId } = get()
    
    // 计算本次专注时间
    let addedTime = 0
    if (focusStartTime) {
      addedTime = Date.now() - focusStartTime
    }
    
    const newTotalTime = totalFocusTime + addedTime
    
    set({
      isFocused: false,
      focusStartTime: null,
      remainingTime: get().focusDuration,
      totalFocusTime: newTotalTime,
    })
    
    // 结束数据库会话
    if (currentSessionId) {
      try {
        const { sessionApi } = await import('./api')
        await sessionApi.endSession(currentSessionId)
        set({ currentSessionId: null })
      } catch (error) {
        console.error('Failed to end session in DB:', error)
      }
    }
    
    // 更新房间状态
    if (roomId && dbUserId) {
      try {
        await fetch('/api/room-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId,
            userId: dbUserId,
            userName,
            color: userColor,
            isFocusing: false,
            focusStartTime: null,
            totalFocusTime: Math.floor(newTotalTime / 1000)
          })
        })
        console.log('✅ 结束专注状态已同步')
      } catch (error) {
        console.error('❌ 同步专注状态失败:', error)
      }
    }
  },
  
  updateRemainingTime: (time) => set({ remainingTime: time }),
}))

function generateRandomColor(): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B4D9', '#A8E6CF',
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// 🔥 SWR Hook: 获取房间内的所有用户状态
export function useRoomUsers(roomId: string | null) {
  const { data, error, mutate, isLoading } = useSWR<{ users: User[], roomId: string, timestamp: number }>(
    roomId ? `/api/room-status?roomId=${roomId}` : null,
    async (url: string) => {
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error('Failed to fetch room status')
      }
      return res.json()
    },
    {
      refreshInterval: 3000,        // 每 3 秒自动刷新
      dedupingInterval: 1000,       // 1 秒内去重请求
      revalidateOnFocus: true,      // 窗口聚焦时重新验证
      revalidateOnReconnect: true,  // 网络重连时重新验证
      revalidateOnMount: true,      // 组件挂载时立即获取
      shouldRetryOnError: true,     // 错误时自动重试
      errorRetryCount: 3,           // 最多重试 3 次
      errorRetryInterval: 5000,     // 重试间隔 5 秒
    }
  )

  return {
    users: data?.users || [],
    isLoading,
    isError: error,
    mutate  // 手动触发刷新
  }
}
