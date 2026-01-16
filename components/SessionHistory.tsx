'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { sessionApi } from '@/lib/api'
import { History, Calendar } from 'lucide-react'

interface Session {
  id: string
  startTime: string
  endTime: string | null
  duration: number
  completed: boolean
}

export function SessionHistory() {
  const { dbUserId } = useStore()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    if (!dbUserId) {
      setLoading(false)
      return
    }

    loadSessions()
  }, [dbUserId])

  const loadSessions = async () => {
    if (!dbUserId) return

    try {
      setLoading(true)
      const data = await sessionApi.getUserSessions(dbUserId, 10)
      setSessions(data)
    } catch (error) {
      console.error('Failed to load sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return '今天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    } else if (days === 1) {
      return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    } else if (days < 7) {
      return `${days}天前`
    } else {
      return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  if (!dbUserId || loading) {
    return null
  }

  const displayedSessions = showAll ? sessions : sessions.slice(0, 5)

  return (
    <div className="p-4 bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <History size={20} />
          专注记录
        </h3>
        {sessions.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            {showAll ? '收起' : `查看全部 (${sessions.length})`}
          </button>
        )}
      </div>

      {sessions.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">
          还没有专注记录
        </p>
      ) : (
        <div className="space-y-2">
          {displayedSessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-gray-400" />
                <span className="text-sm text-gray-300">
                  {formatDate(session.startTime)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${
                  session.completed ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {formatDuration(session.duration)}
                </span>
                {session.completed && (
                  <span className="text-xs text-gray-500">✓</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
