'use client'

import React from 'react'
import { Html } from '@react-three/drei'
import { cn } from '@/lib/utils'

type SeatTooltipProps = {
  seat: {
    id: string
    label: string
    tier: string
    status: string
    assignedGuest?: { id: string; name: string } | null
  }
  visible: boolean
}

const TIER_BADGE_CLASSES: Record<string, string> = {
  vip: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  reserved: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
  general: 'bg-gray-100 text-gray-800 dark:bg-gray-800/40 dark:text-gray-300',
}

export default function SeatTooltip({ seat, visible }: SeatTooltipProps) {
  if (!visible) return null

  return (
    <Html position={[0, 1.2, 0]} center distanceFactor={12} style={{ pointerEvents: 'none' }}>
      <div className="px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg min-w-[140px] select-none">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{seat.label}</span>
          <span
            className={cn(
              'text-[9px] font-medium px-1.5 py-0.5 rounded-full uppercase',
              TIER_BADGE_CLASSES[seat.tier] || TIER_BADGE_CLASSES.general
            )}
          >
            {seat.tier}
          </span>
        </div>
        <div className="mt-1 text-[10px] text-gray-500 dark:text-gray-400 capitalize">
          {seat.status}
        </div>
        {seat.assignedGuest && (
          <div className="mt-1 text-[10px] text-orange-600 dark:text-orange-400 font-medium truncate">
            {seat.assignedGuest.name}
          </div>
        )}
      </div>
    </Html>
  )
}
