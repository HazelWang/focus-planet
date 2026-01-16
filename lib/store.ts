import { create } from 'zustand'
import { io, Socket } from 'socket.io-client'

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
  users: Map<string, User>
  
  // 番茄钟
  focusDuration: number // 默认 25 分钟（毫秒）
  isFocused: boolean
  focusStartTime: number | null
  remainingTime: number
  totalFocusTime: number
  
  // 数据库会话
  currentSessionId: string | null
  
  // Socket
  socket: Socket | null
  
  // 操作
  setUserId: (id: string) => void
  setUserName: (name: string) => void
  setRoomId: (id: string) => void
  setDbUserId: (id: string | null) => void
  setCurrentSessionId: (id: string | null) => void
  joinRoom: (roomId: string, userName: string) => void
  startFocus: () => void
  pauseFocus: () => void
  endFocus: () => void
  updateRemainingTime: (time: number) => void
  initSocket: () => void
  updateUsers: (users: User[]) => void
  addUser: (user: User) => void
  removeUser: (userId: string) => void
  updateUser: (user: User) => void
}

export const useStore = create<AppState>((set, get) => ({
  userId: '',
  userName: '',
  userColor: generateRandomColor(),
  dbUserId: null,
  roomId: null,
  users: new Map(),
  focusDuration: 25 * 60 * 1000, // 25 分钟
  isFocused: false,
  focusStartTime: null,
  remainingTime: 25 * 60 * 1000,
  totalFocusTime: 0,
  currentSessionId: null,
  socket: null,

  setUserId: (id) => set({ userId: id }),
  
  setUserName: (name) => set({ userName: name }),
  
  setRoomId: (id) => set({ roomId: id }),
  
  setDbUserId: (id) => set({ dbUserId: id }),
  
  setCurrentSessionId: (id) => set({ currentSessionId: id }),
  
  initSocket: () => {
    const socket = io()
    
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id)
      set({ userId: socket.id })
    })
    
    socket.on('room-users', (users: User[]) => {
      get().updateUsers(users)
    })
    
    socket.on('user-joined', (user: User) => {
      get().addUser(user)
    })
    
    socket.on('user-left', (userId: string) => {
      get().removeUser(userId)
    })
    
    socket.on('user-updated', (user: User) => {
      get().updateUser(user)
    })
    
    set({ socket })
  },
  
  joinRoom: (roomId, userName) => {
    const { socket, userColor, totalFocusTime, dbUserId } = get()
    if (socket) {
      socket.emit('join-room', {
        roomId,
        userName,
        color: userColor,
        totalFocusTime,
        dbUserId, // 传递数据库用户 ID
      })
      set({ roomId, userName })
    }
  },
  
  startFocus: async () => {
    const { socket, focusDuration, userId, userName, userColor, totalFocusTime, dbUserId, roomId } = get()
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
    
    if (socket) {
      socket.emit('update-status', {
        id: userId,
        name: userName,
        isFocused: true,
        focusStartTime: now,
        planetSize: 1,
        totalFocusTime,
        color: userColor,
      })
    }
  },
  
  pauseFocus: async () => {
    const { socket, userId, userName, userColor, focusStartTime, totalFocusTime, currentSessionId } = get()
    
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
    
    if (socket) {
      socket.emit('update-status', {
        id: userId,
        name: userName,
        isFocused: false,
        focusStartTime: null,
        planetSize: 1,
        totalFocusTime: newTotalTime,
        color: userColor,
      })
    }
  },
  
  endFocus: async () => {
    const { socket, userId, userName, userColor, focusStartTime, totalFocusTime, currentSessionId } = get()
    
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
    
    if (socket) {
      socket.emit('update-status', {
        id: userId,
        name: userName,
        isFocused: false,
        focusStartTime: null,
        planetSize: 1,
        totalFocusTime: newTotalTime,
        color: userColor,
      })
    }
  },
  
  updateRemainingTime: (time) => set({ remainingTime: time }),
  
  updateUsers: (users) => {
    const usersMap = new Map()
    users.forEach((user) => {
      usersMap.set(user.id, user)
    })
    set({ users: usersMap })
  },
  
  addUser: (user) => {
    const { users } = get()
    const newUsers = new Map(users)
    newUsers.set(user.id, user)
    set({ users: newUsers })
  },
  
  removeUser: (userId) => {
    const { users } = get()
    const newUsers = new Map(users)
    newUsers.delete(userId)
    set({ users: newUsers })
  },
  
  updateUser: (user) => {
    const { users } = get()
    const newUsers = new Map(users)
    newUsers.set(user.id, user)
    set({ users: newUsers })
  },
}))

function generateRandomColor(): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B4D9', '#A8E6CF',
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}
