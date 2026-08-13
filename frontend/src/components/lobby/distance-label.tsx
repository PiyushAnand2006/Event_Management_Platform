'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Navigation } from 'lucide-react'

type DistanceLabelProps = {
  distance: number
  direction: string
  sectionName?: string
}

export default function DistanceLabel({ distance, direction, sectionName }: DistanceLabelProps) {
  return (
    <Card className="bg-white/95 border-orange-200 shadow-lg px-3 py-1.5 pointer-events-none">
      <CardContent className="p-0 flex items-center gap-1.5 text-xs">
        <Navigation className="w-3 h-3 text-orange-600 shrink-0" />
        <span className="font-semibold text-orange-700">
          ~{Math.round(distance)}m away
        </span>
        <span className="text-muted-foreground">{direction}</span>
        {sectionName && (
          <span className="text-muted-foreground">
            &middot; near <span className="font-medium text-foreground">{sectionName}</span>
          </span>
        )}
      </CardContent>
    </Card>
  )
}
