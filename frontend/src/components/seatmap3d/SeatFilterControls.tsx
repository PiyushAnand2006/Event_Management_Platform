'use client'

import React from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const TIER_OPTIONS = [
  { key: 'vip', label: 'VIP', dotColor: 'bg-yellow-500' },
  { key: 'reserved', label: 'Reserved', dotColor: 'bg-sky-500' },
  { key: 'general', label: 'General', dotColor: 'bg-gray-400' },
] as const

type SeatFilterControlsProps = {
  showUnoccupiedOnly: boolean
  onToggleUnoccupied: () => void
  tierFilters: Record<string, boolean>
  onToggleTier: (tier: string) => void
}

export default function SeatFilterControls({
  showUnoccupiedOnly,
  onToggleUnoccupied,
  tierFilters,
  onToggleTier,
}: SeatFilterControlsProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Unoccupied toggle */}
      <div className="flex items-center gap-1.5">
        <Checkbox
          id="unoccupied-filter"
          checked={showUnoccupiedOnly}
          onCheckedChange={onToggleUnoccupied}
          className="h-3.5 w-3.5"
        />
        <Label htmlFor="unoccupied-filter" className="text-[11px] font-normal cursor-pointer select-none">
          Unoccupied only
        </Label>
      </div>

      <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />

      {/* Tier filters */}
      {TIER_OPTIONS.map((tier) => (
        <div key={tier.key} className="flex items-center gap-1.5">
          <Checkbox
            id={`tier-${tier.key}`}
            checked={tierFilters[tier.key] ?? true}
            onCheckedChange={() => onToggleTier(tier.key)}
            className={cn('h-3.5 w-3.5')}
          />
          <Label htmlFor={`tier-${tier.key}`} className="flex items-center gap-1 text-[11px] font-normal cursor-pointer select-none">
            <span className={cn('h-2 w-2 rounded-full', tier.dotColor)} />
            {tier.label}
          </Label>
        </div>
      ))}
    </div>
  )
}
