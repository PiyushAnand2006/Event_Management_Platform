'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { UtensilsCrossed, DoorOpen, Music, Armchair, Accessibility, MapPin } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

type POIData = {
  id: string
  type: string
  name: string
  positionX: number
  positionY: number
  icon: string
  refId: string | null
  stall?: {
    id: string
    stallType: string
    ownerName: string
    contractStatus: string
    cuisineType: string | null
  } | null
}

const TYPE_COLORS: Record<string, string> = {
  food_stall: 'bg-orange-500 border-orange-600',
  restroom: 'bg-blue-500 border-blue-600',
  entrance: 'bg-amber-500 border-amber-600',
  stage: 'bg-purple-500 border-purple-600',
  seating_section: 'bg-sky-500 border-sky-600',
  other: 'bg-gray-500 border-gray-600',
}

const TYPE_ICON: Record<string, React.ElementType> = {
  food_stall: UtensilsCrossed,
  restroom: Accessibility,
  entrance: DoorOpen,
  stage: Music,
  seating_section: Armchair,
  other: MapPin,
}

type POIMarkerProps = {
  poi: POIData
  isSelected: boolean
  onClick: (poi: POIData) => void
}

export type { POIData }

export default function POIMarker({ poi, isSelected, onClick }: POIMarkerProps) {
  const IconComp = TYPE_ICON[poi.type] || MapPin
  const colorClass = TYPE_COLORS[poi.type] || TYPE_COLORS.other

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.button
          className={`absolute z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 text-white cursor-pointer transition-shadow ${colorClass}`}
          style={{
            transform: `translate(-50%, -50%)`,
          }}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.95 }}
          animate={isSelected ? { scale: [1, 1.2, 1.15] } : { scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onClick={(e) => {
            e.stopPropagation()
            onClick(poi)
          }}
          aria-label={poi.name}
        >
          {isSelected && (
            <span className="absolute inset-0 rounded-full ring-2 ring-orange-400 ring-offset-1 ring-offset-white" />
          )}
          <IconComp className="w-4 h-4" />
        </motion.button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {poi.name}
      </TooltipContent>
    </Tooltip>
  )
}
