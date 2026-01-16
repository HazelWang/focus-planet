'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { Planet } from './Planet'
import { useStore, useRoomUsers } from '@/lib/store'
import { useRef } from 'react'
import { Mesh } from 'three'

// 装饰性星球组件
function DecorativePlanet() {
  const meshRef = useRef<Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005
      // 呼吸效果
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05
      meshRef.current.scale.setScalar(scale)
    }
  })
  
  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[1.5, 24, 24]} />
      <meshStandardMaterial
        color="#4ECDC4"
        emissive="#4ECDC4"
        emissiveIntensity={0.3}
        roughness={0.7}
        metalness={0.3}
      />
    </mesh>
  )
}

// Scene 组件 - 将场景内容分离出来
function Scene() {
  const roomId = useStore((state) => state.roomId)
  const userId = useStore((state) => state.userId)
  
  // 🔥 使用 SWR 获取房间用户状态
  const { users } = useRoomUsers(roomId)
  
  // users 已经是数组格式
  const usersArray = users
  
  return (
    <>
      {/* 环境光 */}
      <ambientLight intensity={0.5} />
      {/* 点光源 */}
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      {/* 星空背景 - 始终显示 */}
      <Stars 
        radius={100} 
        depth={50} 
        count={2000} 
        factor={4} 
        saturation={0} 
        fade 
        speed={1}
      />
      
      {/* 渲染所有用户的星球 */}
      {usersArray.length > 0 ? (
        usersArray.map((user, index) => {
          // 计算星球位置（圆形分布）
          const angle = (index / usersArray.length) * Math.PI * 2
          const radius = usersArray.length > 1 ? 5 : 0
          const x = Math.cos(angle) * radius
          const z = Math.sin(angle) * radius
          
          return (
            <Planet
              key={user.id}
              user={user}
              position={[x, 0, z]}
              isCurrentUser={user.id === userId}
            />
          )
        })
      ) : (
        /* 未加入房间时显示装饰性星球 */
        <DecorativePlanet />
      )}
      
      {/* 轨道控制 */}
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={20}
      />
    </>
  )
}

export function Universe() {
  return (
    <div className="w-full h-full">
      <Canvas 
        camera={{ position: [0, 0, 10], fov: 75 }}
        gl={{ 
          preserveDrawingBuffer: true,
          powerPreference: 'high-performance',
          antialias: false,
          alpha: false,
          stencil: false,
          depth: true
        }}
        dpr={[1, 2]}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (event) => {
            event.preventDefault()
          }, false)
        }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
