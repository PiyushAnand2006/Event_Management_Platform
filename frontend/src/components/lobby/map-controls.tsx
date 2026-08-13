'use client'

import React from 'react'
import { Plus, Minus, Maximize } from 'lucide-react'
import { Button } from '@/components/ui/button'

type MapControlsProps = {
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
  scale: number
}

export default function MapControls({ onZoomIn, onZoomOut, onReset, scale }: MapControlsProps) {
  return (
    <div className="absolute bottom-4 right-4 z-40 flex flex-col gap-1.5">
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-lg bg-white/95 shadow-md border-border/60 hover:bg-orange-50"
        onClick={onZoomIn}
        aria-label="Zoom in"
      >
        <Plus className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-lg bg-white/95 shadow-md border-border/60 hover:bg-orange-50"
        onClick={onZoomOut}
        aria-label="Zoom out"
      >
        <Minus className="w-4 h-4" />
      </Button>
      <div className="text-center text-[10px] text-muted-foreground font-medium -my-0.5">
        {Math.round(scale * 100)}%
      </div>
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-lg bg-white/95 shadow-md border-border/60 hover:bg-orange-50"
        onClick={onReset}
        aria-label="Reset view"
      >
        <Maximize className="w-4 h-4" />
      </Button>
    </div>
  )
}
