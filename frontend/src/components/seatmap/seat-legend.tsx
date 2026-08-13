'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { TIER_COLORS, BLOCKED_COLOR } from '@/types/venue'

type SeatLegendProps = {
  className?: string
}

export default function SeatLegend({ className }: SeatLegendProps) {
  const items = [
    { label: 'VIP', color: TIER_COLORS.vip.unoccupied, sub: 'Occupied', subColor: TIER_COLORS.vip.occupied },
    { label: 'Reserved', color: TIER_COLORS.reserved.unoccupied, sub: 'Occupied', subColor: TIER_COLORS.reserved.occupied },
    { label: 'General', color: TIER_COLORS.general.unoccupied, sub: 'Occupied', subColor: TIER_COLORS.general.occupied },
    { label: 'Blocked', color: BLOCKED_COLOR },
  ]

  return (
    <div className={cn('flex flex-wrap items-center gap-3 rounded-lg border bg-background/90 backdrop-blur px-3 py-2 text-xs', className)}>
      <span className="font-medium text-muted-foreground mr-1">Legend:</span>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-foreground">{item.label}</span>
          {item.sub && item.subColor && (
            <>
              <span className="text-muted-foreground">/</span>
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.subColor }}
              />
              <span className="text-muted-foreground">{item.sub}</span>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
