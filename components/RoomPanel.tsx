'use client'

import { useState, useEffect } from 'react'
import { useStore, useRoomUsers } from '@/lib/store'
import { Copy, Users, Check } from 'lucide-react'
import { nanoid } from 'nanoid'

export function RoomPanel() {
  const { roomId, joinRoom, userName, setUserName, userColor, setDbUserId } = useStore()
  const [inputName, setInputName] = useState('')
  const [inputRoom, setInputRoom] = useState('')
  const [copied, setCopied] = useState(false)
  const [isJoining, setIsJoining] = useState(!roomId)
  
  // 🔥 使用 SWR 获取房间用户
  const { users } = useRoomUsers(roomId)
  
  useEffect(() => {
    // 检查 URL 中是否有房间 ID
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const roomIdFromUrl = urlParams.get('room')
      if (roomIdFromUrl) {
        setInputRoom(roomIdFromUrl)
      }
    }
  }, [])
  
  const handleJoinRoom = async () => {
    if (!inputName.trim()) {
      alert('请输入你的名字')
      return
    }
    
    const room = inputRoom.trim() || nanoid(10)
    const name = inputName.trim()
    
    // 创建数据库用户
    try {
      const { userApi } = await import('@/lib/api')
      const dbUser = await userApi.createOrGetUser({
        name,
        color: userColor,
      })
      setDbUserId(dbUser.id)
      console.log('数据库用户已创建:', dbUser)
    } catch (error) {
      console.error('创建数据库用户失败:', error)
      // 即使数据库失败也允许继续使用应用
    }
    
    joinRoom(room, name)
    setIsJoining(false)
    
    // 更新 URL
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', `?room=${room}`)
    }
  }
  
  const handleCopyLink = () => {
    if (roomId && typeof window !== 'undefined') {
      const link = `${window.location.origin}?room=${roomId}`
      navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  
  const getTotalFocusTime = () => {
    // users 现在是数组
    const total = users.reduce((sum, user) => sum + user.totalFocusTime, 0)
    return Math.floor(total / 60) // totalFocusTime 已经是秒，转换为分钟
  }
  
  if (isJoining) {
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-20">
        <div className="bg-gray-900/90 rounded-xl p-8 max-w-md w-full mx-4 border border-gray-700 shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            欢迎来到专注星球 🪐
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                你的名字
              </label>
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="输入你的名字"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                房间 ID（可选）
              </label>
              <input
                type="text"
                value={inputRoom}
                onChange={(e) => setInputRoom(e.target.value)}
                placeholder="留空创建新房间"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
              />
              <p className="text-xs text-gray-500 mt-1">
                留空将自动创建新房间，或输入朋友分享的房间 ID
              </p>
            </div>
            
            <button
              onClick={handleJoinRoom}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
            >
              进入宇宙
            </button>
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-400">
            <p>💫 和朋友一起专注，让星球共同成长</p>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-4 p-4 md:p-6 bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-700">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Users size={24} />
          房间信息
        </h3>
        <span className="text-sm text-gray-400">
          {users.length} 人在线
        </span>
      </div>
      
      {/* 房间 ID 和分享 */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 px-4 py-2 bg-gray-800 rounded-lg text-white font-mono text-xs sm:text-sm break-all">
          {roomId}
        </div>
        <button
          onClick={handleCopyLink}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
        >
          {copied ? (
            <>
              <Check size={16} />
              已复制
            </>
          ) : (
            <>
              <Copy size={16} />
              分享
            </>
          )}
        </button>
      </div>
      
      {/* 统计信息 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-500">
            {getTotalFocusTime()}
          </div>
          <div className="text-sm text-gray-400">总专注时间（分钟）</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-500">
            {users.filter(u => u.isFocused).length}
          </div>
          <div className="text-sm text-gray-400">正在专注</div>
        </div>
      </div>
      
      {/* 在线用户列表 */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-400">在线成员</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg"
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: user.color }}
              />
              <div className="flex-1">
                <div className="text-white font-medium">{user.name}</div>
                <div className="text-xs text-gray-400">
                  {Math.floor(user.totalFocusTime / 60)} 分钟专注
                </div>
              </div>
              {user.isFocused && (
                <span className="text-xs text-blue-400 font-medium">
                  专注中
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
