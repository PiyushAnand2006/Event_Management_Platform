'use client'

import React from 'react'

type DirectionArrowProps = {
  fromX: number
  fromY: number
  toX: number
  toY: number
  scale: number
}

export default function DirectionArrow({ fromX, fromY, toX, toY, scale }: DirectionArrowProps) {
  const length = Math.sqrt((toX - fromX) ** 2 + (toY - fromY) ** 2)
  if (length < 0.5) return null

  const angle = (Math.atan2(toY - fromY, toX - fromX) * 180) / Math.PI
  const headLen = 10
  const dashLen = Math.max(length * scale, 20)

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-20"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <filter id="arrow-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <line
        x1={fromX * scale}
        y1={fromY * scale}
        x2={toX * scale}
        y2={toY * scale}
        stroke="rgba(16, 185, 129, 0.7)"
        strokeWidth={2}
        strokeDasharray="8 4"
        filter="url(#arrow-glow)"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="0"
          to="-24"
          dur="1s"
          repeatCount="indefinite"
        />
      </line>
      {/* Arrowhead */}
      <polygon
        points={`
          ${toX * scale},${toY * scale}
          ${toX * scale - headLen * Math.cos(((angle - 20) * Math.PI) / 180)},${toY * scale - headLen * Math.sin(((angle - 20) * Math.PI) / 180)}
          ${toX * scale - headLen * Math.cos(((angle + 20) * Math.PI) / 180)},${toY * scale - headLen * Math.sin(((angle + 20) * Math.PI) / 180)}
        `}
        fill="rgba(16, 185, 129, 0.8)"
        filter="url(#arrow-glow)"
      />
    </svg>
  )
}
