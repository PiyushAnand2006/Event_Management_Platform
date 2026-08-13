'use client'

import React from 'react'
import { Html } from '@react-three/drei'
import type { VenueSection } from '@/types/venue'

type SectionLabelProps = {
  section: VenueSection
}

export default function SectionLabel({ section }: SectionLabelProps) {
  return (
    <Html
      position={[
        section.positionX + section.width / 2,
        1.5,
        section.positionY + section.height / 2,
      ]}
      center
      distanceFactor={15}
      style={{ pointerEvents: 'none' }}
    >
      <div className="px-2.5 py-1 rounded-full bg-black/50 text-white text-[10px] font-semibold tracking-wide whitespace-nowrap backdrop-blur-sm select-none">
        {section.name}
      </div>
    </Html>
  )
}
