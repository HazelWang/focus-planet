'use client'

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative w-32 h-32 mx-auto mb-8">
          {/* 旋转的星球 */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 animate-pulse"></div>
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 animate-spin"></div>
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-300 to-purple-400"></div>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">
          正在进入宇宙...
        </h2>
        <p className="text-gray-400">
          加载 3D 场景
        </p>
      </div>
    </div>
  )
}
