'use client'

import React from 'react'
import { cn } from '@/lib/utils'

type SeatStatusOverlayProps = {
  stats: {
    total: number
    unoccupied: number
    occupied: number
    blocked: number
    byTier: Record<string, number>
  }
}

const STATUS_ITEMS = [
  { key: 'total', label: 'Total', color: 'bg-gray-400' },
  { key: 'unoccupied', label: 'Available', color: 'bg-orange-500' },
  { key: 'occupied', label: 'Occupied', color: 'bg-sky-700' },
  { key: 'blocked', label: 'Blocked', color: 'bg-red-500' },
] as const

const TIER_BAR_COLORS: Record<string, string> = {
  vip: 'bg-yellow-500',
  reserved: 'bg-sky-500',
  general: 'bg-gray-400',
}

export default function SeatStatusOverlay({ stats }: SeatStatusOverlayProps) {
  const tierEntries = Object.entries(stats.byTier).filter(([, count]) => count > 0)
  const maxTierCount = Math.max(...tierEntries.map(([, c]) => c), 1)

  return (
    <div className="absolute bottom-4 left-4 z-10 rounded-lg border bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg p-3 min-w-[160px] select-none">
      {/* Status counts */}
      <div className="flex flex-col gap-1.5">
        {STATUS_ITEMS.map((item) => (
          <div key={item.key} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <span className={cn('h-2 w-2 rounded-full', item.color)} />
              <span className="text-[11px] text-gray-600 dark:text-gray-400">{item.label}</span>
            </div>
            <span className="text-[11px] font-semibold text-gray-900 dark:text-gray-100">
              {stats[item.key]}
            </span>
          </div>
        ))}
      </div>

      {/* Tier distribution mini bar chart */}
      {tierEntries.length > 0 && (
        <div className="mt-2.5 pt-2.5 border-t border-gray-200 dark:border-gray-700">
          <div className="text-[9px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
            Tier Distribution
          </div>
          <div className="flex flex-col gap-1">
            {tierEntries.map(([tier, count]) => (
              <div key={tier} className="flex items-center gap-2">
                <span className="text-[10px] capitalize text-gray-500 dark:text-gray-400 w-14">
                  {tier}
                </span>
                <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', TIER_BAR_COLORS[tier] || 'bg-gray-400')}
                    style={{ width: `${(count / maxTierCount) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300 w-6 text-right">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
