'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { statsApi } from '@/lib/api'
import { Clock, TrendingUp, Target } from 'lucide-react'

export function UserStats() {
  const { dbUserId } = useStore()
  const [stats, setStats] = useState<{
    totalFocusTime: number
    totalSessions: number
    averageSessionTime: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!dbUserId) {
      setLoading(false)
      return
    }

    loadStats()
  }, [dbUserId])

  const loadStats = async () => {
    if (!dbUserId) return

    try {
      setLoading(true)
      const data = await statsApi.getUserStats(dbUserId)
      setStats(data)
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}小时${minutes}分钟`
    }
    return `${minutes}分钟`
  }

  if (!dbUserId || loading) {
    return null
  }

  if (!stats) {
    return (
      <div className="p-4 bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-700">
        <p className="text-gray-400 text-sm text-center">加载统计数据失败</p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <TrendingUp size={20} />
        我的统计
      </h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-300">
            <Clock size={16} />
            <span className="text-sm">总专注时间</span>
          </div>
          <span className="text-white font-semibold">
            {formatTime(stats.totalFocusTime)}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-300">
            <Target size={16} />
            <span className="text-sm">完成次数</span>
          </div>
          <span className="text-white font-semibold">
            {stats.totalSessions} 次
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-300">
            <Clock size={16} />
            <span className="text-sm">平均时长</span>
          </div>
          <span className="text-white font-semibold">
            {formatTime(stats.averageSessionTime)}
          </span>
        </div>
      </div>
      
      {stats.totalSessions === 0 && (
        <p className="text-gray-400 text-xs text-center mt-4">
          开始你的第一次专注吧！
        </p>
      )}
    </div>
  )
}
