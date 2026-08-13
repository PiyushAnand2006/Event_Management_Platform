'use client'

import React from 'react'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { getSeatColor } from '@/types/venue'

type SeatDotProps = {
  seat: {
    id: string
    label: string
    tier: string
    status: string
    x: number
    y: number
    assignedGuestName?: string
  }
  isSelected: boolean
  onClick: (id: string) => void
  showTooltip: boolean
}

const SeatDotInner = React.memo(function SeatDotInner({
  seat,
  isSelected,
  onClick,
  showTooltip,
}: SeatDotProps) {
  const color = getSeatColor(seat.tier, seat.status)

  const dot = (
    <button
      type="button"
      aria-label={`Seat ${seat.label}, ${seat.tier} tier, ${seat.status}${seat.assignedGuestName ? `, assigned to ${seat.assignedGuestName}` : ''}`}
      onClick={(e) => {
        e.stopPropagation()
        onClick(seat.id)
      }}
      className={cn(
        'rounded-full transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-1',
        isSelected
          ? 'ring-2 ring-orange-400 ring-offset-1 ring-offset-transparent scale-125 z-10'
          : 'hover:scale-125 hover:z-10'
      )}
      style={{
        width: 10,
        height: 10,
        backgroundColor: color,
        position: 'absolute',
        left: seat.x,
        top: seat.y,
        transform: 'translate(-50%, -50%)',
      }}
    />
  )

  if (!showTooltip) return dot

  return (
    <Tooltip>
      <TooltipTrigger asChild>{dot}</TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold">{seat.label}</span>
          <span className="text-muted-foreground capitalize">{seat.tier} &middot; {seat.status}</span>
          {seat.assignedGuestName && (
            <span className="text-orange-600 dark:text-orange-400">
              {seat.assignedGuestName}
            </span>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  )
})

export { SeatDotInner }
export type { SeatDotProps }
