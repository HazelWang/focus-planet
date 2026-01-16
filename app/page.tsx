'use client'

import { useState, useEffect } from 'react'
import { Universe } from '@/components/Universe'
import { FocusTimer } from '@/components/FocusTimer'
import { RoomPanel } from '@/components/RoomPanel'
import { ShareCard } from '@/components/ShareCard'
import { LoadingScreen } from '@/components/LoadingScreen'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { UserStats } from '@/components/UserStats'
import { SessionHistory } from '@/components/SessionHistory'
import { useStore } from '@/lib/store'

export default function Home() {
  const roomId = useStore((state) => state.roomId)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // 模拟加载时间
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])
  
  if (isLoading) {
    return <LoadingScreen />
  }
  
  return (
    <ErrorBoundary>
      <div className="w-screen h-screen bg-black overflow-hidden relative">
        {/* 3D 宇宙场景 - 始终显示 */}
        <div className="absolute inset-0 z-0">
          <Universe />
        </div>
      
        {/* UI 覆盖层 */}
        {roomId ? (
          <>
            {/* 左侧控制面板 - 响应式 */}
            <div className="absolute left-0 top-0 bottom-0 w-full md:w-96 p-4 md:p-6 space-y-4 overflow-y-auto bg-gradient-to-r from-black/80 to-transparent md:bg-none pointer-events-none z-10">
              <div className="pointer-events-auto space-y-4">
                <div className="text-center mb-6">
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    专注星球 🪐
                  </h1>
                  <p className="text-gray-400 text-sm">
                    一起专注，共同成长
                  </p>
                </div>
              
              <FocusTimer />
              <RoomPanel />
              <UserStats />
              <SessionHistory />
              
              <div className="flex justify-center">
                <ShareCard />
              </div>
              </div>
            </div>
            
            {/* 帮助提示 - 桌面端显示 */}
            <div className="hidden lg:block absolute right-6 bottom-6 bg-gray-900/80 backdrop-blur-sm rounded-lg p-4 max-w-xs border border-gray-700 z-10">
              <h4 className="text-white font-medium mb-2">💡 使用提示</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• 点击开始专注，你的星球会发光并成长</li>
                <li>• 使用鼠标拖动旋转视角，滚轮缩放</li>
                <li>• 分享房间链接邀请朋友一起专注</li>
                <li>• 完成专注后可生成分享卡片</li>
              </ul>
            </div>
          </>
        ) : (
          /* 房间加入界面 */
          <RoomPanel />
        )}
      </div>
    </ErrorBoundary>
  )
}
