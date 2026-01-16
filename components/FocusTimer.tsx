'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/lib/store'
import { Play, Pause, RotateCcw } from 'lucide-react'

export function FocusTimer() {
  const {
    isFocused,
    focusStartTime,
    remainingTime,
    focusDuration,
    startFocus,
    pauseFocus,
    endFocus,
    updateRemainingTime,
  } = useStore()
  
  const [isComplete, setIsComplete] = useState(false)
  
  useEffect(() => {
    if (!isFocused || !focusStartTime) return
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - focusStartTime
      const remaining = focusDuration - elapsed
      
      if (remaining <= 0) {
        setIsComplete(true)
        updateRemainingTime(0)
        endFocus()
        
        // 播放完成音效（可选）
        playCompletionSound()
      } else {
        updateRemainingTime(remaining)
      }
    }, 100)
    
    return () => clearInterval(interval)
  }, [isFocused, focusStartTime, focusDuration, updateRemainingTime, endFocus])
  
  const formatTime = (ms: number) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000))
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  
  const getProgress = () => {
    return ((focusDuration - remainingTime) / focusDuration) * 100
  }
  
  const playCompletionSound = () => {
    // 使用 Web Audio API 创建简单的提示音
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (error) {
      console.log('Audio not supported')
    }
  }
  
  const handleStartPause = () => {
    if (isComplete) {
      setIsComplete(false)
      updateRemainingTime(focusDuration)
    }
    
    if (isFocused) {
      pauseFocus()
    } else {
      startFocus()
    }
  }
  
  const handleReset = () => {
    endFocus()
    setIsComplete(false)
    updateRemainingTime(focusDuration)
  }
  
  return (
    <div className="flex flex-col items-center gap-4 p-4 md:p-6 bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-700">
      {/* 圆形进度条 */}
      <div className="relative w-40 h-40 md:w-48 md:h-48">
        <svg className="w-full h-full transform -rotate-90">
          {/* 背景圆 */}
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-700"
          />
          {/* 进度圆 */}
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 88}`}
            strokeDashoffset={`${2 * Math.PI * 88 * (1 - getProgress() / 100)}`}
            className={`transition-all duration-300 ${
              isComplete ? 'text-green-500' : isFocused ? 'text-blue-500' : 'text-gray-500'
            }`}
            strokeLinecap="round"
          />
        </svg>
        
        {/* 中心时间显示 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`text-4xl font-bold ${
            isComplete ? 'text-green-500' : 'text-white'
          }`}>
            {formatTime(remainingTime)}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            {isComplete ? '完成！' : isFocused ? '专注中' : '准备就绪'}
          </div>
        </div>
      </div>
      
      {/* 控制按钮 */}
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <button
          onClick={handleStartPause}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            isFocused
              ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
              : isComplete
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isFocused ? (
            <>
              <Pause size={20} />
              暂停
            </>
          ) : isComplete ? (
            <>
              <Play size={20} />
              再来一次
            </>
          ) : (
            <>
              <Play size={20} />
              开始专注
            </>
          )}
        </button>
        
        <button
          onClick={handleReset}
          disabled={!isFocused && remainingTime === focusDuration}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw size={20} />
          重置
        </button>
      </div>
      
      {/* 完成动画 */}
      {isComplete && (
        <div className="text-center animate-bounce">
          <div className="text-2xl">🎉</div>
          <div className="text-sm text-green-500 font-medium">
            太棒了！你完成了一个专注周期
          </div>
        </div>
      )}
    </div>
  )
}
