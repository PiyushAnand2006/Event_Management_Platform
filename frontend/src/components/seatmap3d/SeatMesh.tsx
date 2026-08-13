'use client'

import React, { useRef, useState, useCallback } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { getSeatColor } from '@/types/venue'
import SeatTooltip from './SeatTooltip'

type SeatMeshProps = {
  seat: {
    id: string
    label: string
    positionX: number
    positionY: number
    positionZ: number
    rotation: number
    tier: string
    status: string
    assignedGuestId?: string | null
    assignedGuest?: { id: string; name: string } | null
  }
  onClick: (seatId: string) => void
  isSelected: boolean
  isVisible: boolean
}

export default function SeatMesh({ seat, onClick, isSelected, isVisible }: SeatMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const outlineRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  const color = getSeatColor(seat.tier, seat.status)
  const isBlocked = seat.status === 'blocked'
  const isVip = seat.tier === 'vip'

  const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHovered(true)
    document.body.style.cursor = 'pointer'
  }, [])

  const handlePointerOut = useCallback(() => {
    setHovered(false)
    document.body.style.cursor = 'auto'
  }, [])

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      onClick(seat.id)
    },
    [onClick, seat.id]
  )

  useFrame(() => {
    if (!meshRef.current) return

    // Hover scale animation
    const targetScale = hovered ? 1.1 : 1
    meshRef.current.scale.lerp(
      new THREE.Vector3(
        targetScale,
        isBlocked ? 0.2 * targetScale : targetScale,
        targetScale
      ),
      0.15
    )

    // Emissive pulse for VIP
    if (isVip && !isBlocked) {
      const pulse = (Math.sin(Date.now() * 0.003) + 1) * 0.5
      const mat = meshRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.1 + pulse * 0.2
    }

    // Outline visibility
    if (outlineRef.current) {
      outlineRef.current.visible = isSelected
      outlineRef.current.scale.copy(meshRef.current.scale).multiplyScalar(1.3)
    }
  })

  // Invisible seats (filtered out) render very transparent
  if (!isVisible) {
    return (
      <group position={[seat.positionX, seat.positionZ, seat.positionY]}>
        <mesh ref={meshRef} rotation={[0, (seat.rotation * Math.PI) / 180, 0]}>
          <boxGeometry args={[0.8, 0.6, 0.8]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={0.06}
            depthWrite={false}
          />
        </mesh>
      </group>
    )
  }

  return (
    <group position={[seat.positionX, seat.positionZ, seat.positionY]}>
      {/* Selection outline */}
      <mesh ref={outlineRef} visible={isSelected} rotation={[0, (seat.rotation * Math.PI) / 180, 0]}>
        <boxGeometry args={[0.8, 0.6, 0.8]} />
        <meshBasicMaterial
          color="#10b981"
          transparent
          opacity={0.25}
          depthWrite={false}
        />
      </mesh>

      {/* Main seat mesh */}
      <mesh
        ref={meshRef}
        rotation={[0, (seat.rotation * Math.PI) / 180, 0]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <boxGeometry args={[0.8, isBlocked ? 0.12 : 0.6, 0.8]} />
        <meshStandardMaterial
          color={color}
          emissive={isVip && !isBlocked ? color : '#000000'}
          emissiveIntensity={isVip && !isBlocked ? 0.15 : 0}
          transparent={isBlocked}
          opacity={isBlocked ? 0.5 : 1}
        />
      </mesh>

      {/* Hover tooltip */}
      {hovered && (
        <SeatTooltip
          seat={{
            id: seat.id,
            label: seat.label,
            tier: seat.tier,
            status: seat.status,
            assignedGuest: seat.assignedGuest,
          }}
          visible={hovered}
        />
      )}
    </group>
  )
}