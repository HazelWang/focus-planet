'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'
import { Text } from '@react-three/drei'
import { User } from '@/lib/store'

interface PlanetProps {
  user: User
  position: [number, number, number]
  isCurrentUser: boolean
}

export function Planet({ user, position, isCurrentUser }: PlanetProps) {
  const meshRef = useRef<Mesh>(null)
  const particlesRef = useRef<any>(null)
  
  // 计算星球大小（基于专注时间）
  const size = useMemo(() => {
    // 基础大小 0.5，每分钟增加 0.01
    const minutesFocused = user.totalFocusTime / (1000 * 60)
    const growthSize = 0.5 + (minutesFocused * 0.01)
    
    // 如果正在专注，额外增大 20%
    const focusMultiplier = user.isFocused ? 1.2 : 1
    
    return Math.min(growthSize * focusMultiplier, 2) // 最大 2 单位
  }, [user.totalFocusTime, user.isFocused])
  
  // 星球旋转动画
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005
      
      // 如果正在专注，添加呼吸效果
      if (user.isFocused) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05
        meshRef.current.scale.setScalar(scale)
      } else {
        meshRef.current.scale.setScalar(1)
      }
    }
    
    // 粒子效果旋转
    if (particlesRef.current && user.isFocused) {
      particlesRef.current.rotation.y += 0.01
    }
  })
  
  // 粒子位置（围绕星球）
  const particleCount = user.isFocused ? 30 : 0
  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      const radius = size + 0.5 + Math.random() * 0.5
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)
    }
    return positions
  }, [particleCount, size])
  
  return (
    <group position={position}>
      {/* 星球主体 */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 24, 24]} />
        <meshStandardMaterial
          color={user.color}
          emissive={user.color}
          emissiveIntensity={user.isFocused ? 0.5 : 0.2}
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>
      
      {/* 专注时的粒子效果 */}
      {user.isFocused && (
        <points ref={particlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={particleCount}
              array={particles}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.05}
            color={user.color}
            transparent
            opacity={0.6}
            sizeAttenuation
          />
        </points>
      )}
      
      {/* 用户名标签 */}
      <Text
        position={[0, size + 0.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {user.name}
        {isCurrentUser && ' (你)'}
      </Text>
      
      {/* 专注状态指示 */}
      {user.isFocused && (
        <Text
          position={[0, size + 0.8, 0]}
          fontSize={0.2}
          color="#4ECDC4"
          anchorX="center"
          anchorY="middle"
        >
          专注中
        </Text>
      )}
      
      {/* 发光环（专注时） */}
      {user.isFocused && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[size + 0.3, size + 0.4, 32]} />
          <meshBasicMaterial
            color={user.color}
            transparent
            opacity={0.5}
          />
        </mesh>
      )}
    </group>
  )
}
