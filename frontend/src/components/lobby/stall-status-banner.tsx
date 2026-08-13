'use client'

import React from 'react'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

type StallData = {
  id: string
  stallType: string
  ownerName: string
  contractStatus: string
  cuisineType: string | null
  locationX: number | null
  locationY: number | null
}

type StallStatusBannerProps = {
  stall: StallData
}

export default function StallStatusBanner({ stall }: StallStatusBannerProps) {
  if (stall.contractStatus === 'declined') {
    return (
      <Alert className="border-amber-300 bg-amber-50 text-amber-900">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-sm">
          <span className="font-semibold">{stall.cuisineType || stall.stallType}</span> stall is unavailable. A replacement may be arranged.
        </AlertDescription>
      </Alert>
    )
  }

  if (stall.contractStatus === 'confirmed') {
    // Show backup-confirmed message (promoted stall)
    return (
      <Alert className="border-orange-300 bg-orange-50 text-orange-900">
        <CheckCircle2 className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-sm">
          <span className="font-semibold">{stall.cuisineType || stall.stallType}</span> — new vendor confirmed and ready.
        </AlertDescription>
      </Alert>
    )
  }

  return null
}
