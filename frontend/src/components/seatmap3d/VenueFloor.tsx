'use client'

import React, { useMemo } from 'react'
import * as THREE from 'three'
import type { VenueSection } from '@/types/venue'

type VenueFloorProps = {
  width: number
  height: number
  sections: VenueSection[]
}

export default function VenueFloor({ width, height, sections }: VenueFloorProps) {
  // Grid helper dimensions - slightly larger than floor
  const gridDivisions = useMemo(() => {
    const maxDim = Math.max(width, height)
    return Math.max(4, Math.floor(maxDim / 5))
  }, [width, height])

  return (
    <group>
      {/* Floor plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[width / 2, -0.1, height / 2]} receiveShadow>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>

      {/* Grid overlay */}
      <gridHelper
        args={[Math.max(width, height) + 4, gridDivisions, '#d4d4d4', '#e5e5e5']}
        position={[width / 2, -0.05, height / 2]}
      />

      {/* Section boundary outlines */}
      {sections.map((section) => {
        const points = [
          new THREE.Vector3(section.positionX, 0.01, section.positionY),
          new THREE.Vector3(section.positionX + section.width, 0.01, section.positionY),
          new THREE.Vector3(section.positionX + section.width, 0.01, section.positionY + section.height),
          new THREE.Vector3(section.positionX, 0.01, section.positionY + section.height),
          new THREE.Vector3(section.positionX, 0.01, section.positionY),
        ]
        const geometry = new THREE.BufferGeometry().setFromPoints(points)
        const material = new THREE.LineBasicMaterial({ color: '#9ca3af' })
        const lineObj = new THREE.Line(geometry, material)
        return <primitive key={section.id} object={lineObj} />
      })}
    </group>
  )
}
