'use client'

import React from 'react'

export default function MySeatIndicator({ positionX, positionY, label }: { positionX: number; positionY: number; label: string }) {
  return (
    <div
      className="absolute z-30 pointer-events-none"
      style={{
        transform: `translate(-50%, -50%)`,
      }}
    >
      {/* Pulse ring */}
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="absolute w-8 h-8 rounded-full bg-orange-400/30 animate-ping" />
      </span>
      {/* Dot */}
      <span className="relative flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 border-2 border-white shadow-md">
        <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-orange-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow">
          You
        </span>
      </span>
      {/* Seat label */}
      <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
        {label}
      </span>
    </div>
  )
}
