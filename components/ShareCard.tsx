'use client'

import { useRef, useState } from 'react'
import { useStore } from '@/lib/store'
import { toPng } from 'html-to-image'
import { Download, Share2 } from 'lucide-react'

export function ShareCard() {
  const users = useStore((state) => state.users)
  const userName = useStore((state) => state.userName)
  const cardRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showCard, setShowCard] = useState(false)
  
  const getTotalFocusMinutes = () => {
    let total = 0
    users.forEach((user) => {
      total += user.totalFocusTime
    })
    return Math.floor(total / (1000 * 60))
  }
  
  const getCurrentUserFocusMinutes = () => {
    const currentUser = Array.from(users.values()).find(u => u.name === userName)
    if (!currentUser) return 0
    return Math.floor(currentUser.totalFocusTime / (1000 * 60))
  }
  
  const handleGenerateImage = async () => {
    if (!cardRef.current) return
    
    setIsGenerating(true)
    
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#000000',
      })
      
      // 下载图片
      const link = document.createElement('a')
      link.download = `专注星球-${new Date().toLocaleDateString()}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('Failed to generate image:', error)
    } finally {
      setIsGenerating(false)
    }
  }
  
  if (!showCard) {
    return (
      <button
        onClick={() => setShowCard(true)}
        className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors w-full sm:w-auto"
      >
        <Share2 size={20} />
        生成分享卡片
      </button>
    )
  }
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">分享你的成就</h3>
          <button
            onClick={() => setShowCard(false)}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        
        {/* 卡片预览 */}
        <div
          ref={cardRef}
          className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-xl p-8 mb-4"
        >
          <div className="text-center space-y-4">
            <div className="text-4xl">🪐</div>
            <h2 className="text-2xl font-bold text-white">
              今日专注星系
            </h2>
            
            <div className="bg-black/30 rounded-lg p-6 space-y-3">
              <div>
                <div className="text-4xl font-bold text-blue-400">
                  {getCurrentUserFocusMinutes()}
                </div>
                <div className="text-sm text-gray-300">分钟专注时间</div>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-gray-300">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div className="text-sm">
                  与 {users.size - 1} 位伙伴共同成长
                </div>
              </div>
              
              <div className="text-xs text-gray-400">
                累计专注 {getTotalFocusMinutes()} 分钟
              </div>
            </div>
            
            <div className="text-sm text-gray-300">
              {userName} • 专注星球
            </div>
            
            <div className="text-xs text-gray-500">
              {new Date().toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>
        
        {/* 操作按钮 */}
        <div className="flex gap-3">
          <button
            onClick={handleGenerateImage}
            disabled={isGenerating}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <Download size={20} />
            {isGenerating ? '生成中...' : '下载图片'}
          </button>
          
          <button
            onClick={() => setShowCard(false)}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}
