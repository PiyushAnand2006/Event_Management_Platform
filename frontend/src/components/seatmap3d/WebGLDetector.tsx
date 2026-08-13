'use client'

import React, { useEffect, useState } from 'react'
import { Map } from 'lucide-react'

export function hasWebGLSupport(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

type WebGLDetectorProps = {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function WebGLDetector({ children, fallback }: WebGLDetectorProps) {
  const [supported, setSupported] = useState<boolean | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser capability detection requires client-side effect
    setSupported(hasWebGLSupport())
  }, [])

  if (supported === null) {
    return null
  }

  if (!supported) {
    if (fallback) return <>{fallback}</>
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4 text-muted-foreground">
        <Map className="h-12 w-12 opacity-40" />
        <div className="text-center">
          <p className="text-sm font-medium">WebGL Not Supported</p>
          <p className="text-xs mt-1 max-w-xs">
            Your browser or device does not support WebGL, which is required for the 3D seat map viewer.
            Please try a different browser or enable hardware acceleration.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}