'use client'

import React from 'react'
import {
  Sparkles,
  Code,
  Laptop,
  Users,
  Heart,
  Music,
  Calendar,
  Layers,
  Cpu,
  Globe,
} from 'lucide-react'

interface AbstractAiBannerProps {
  title?: string
  category?: string
  type?: string
  className?: string
}

// Generate a deterministic integer seed from a string
function stringToSeed(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

export function AbstractAiBanner({
  title = '',
  category = '',
  type = '',
  className = '',
}: AbstractAiBannerProps) {
  const seed = stringToSeed(`${title}-${category}-${type}`)

  const catLower = category.toLowerCase()
  const typeLower = type.toLowerCase()

  // Select AI abstract color themes based on category/type
  let gradientClass = 'from-orange-600 via-amber-600 to-rose-900'
  let IconComponent = Sparkles

  if (catLower.includes('tech') || typeLower.includes('hackathon') || typeLower.includes('conference')) {
    gradientClass = 'from-primary via-orange-600 to-slate-900'
    IconComponent = Cpu
  } else if (catLower.includes('education') || typeLower.includes('seminar') || catLower.includes('workshop')) {
    gradientClass = 'from-amber-600 via-orange-500 to-purple-900'
    IconComponent = Code
  } else if (catLower.includes('social') || typeLower.includes('wedding') || typeLower.includes('ceremony')) {
    gradientClass = 'from-rose-600 via-primary to-amber-700'
    IconComponent = Heart
  } else if (catLower.includes('music') || catLower.includes('art')) {
    gradientClass = 'from-purple-700 via-primary to-amber-600'
    IconComponent = Music
  } else if (catLower.includes('outdoor') || catLower.includes('sports')) {
    gradientClass = 'from-emerald-700 via-teal-600 to-slate-900'
    IconComponent = Globe
  }

  // Pre-calculated geometric positions based on seed
  const circle1X = (seed % 60) + 20
  const circle1Y = ((seed * 7) % 50) + 10
  const circle2X = ((seed * 3) % 60) + 30
  const circle2Y = ((seed * 11) % 60) + 30

  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-gradient-to-br ${gradientClass} flex items-center justify-center ${className}`}
    >
      {/* Dynamic AI Isometric Grid Pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-25 mix-blend-overlay pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id={`grid-${seed}`}
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 32 0 L 0 0 0 32"
              fill="none"
              stroke="white"
              strokeWidth="0.75"
              strokeDasharray="2,2"
            />
            <circle cx="0" cy="0" r="1.5" fill="white" opacity="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${seed})`} />
      </svg>

      {/* Glowing AI Mesh Orbs */}
      <div
        className="absolute w-40 h-40 rounded-full bg-white/20 blur-2xl pointer-events-none"
        style={{ left: `${circle1X}%`, top: `${circle1Y}%` }}
      />
      <div
        className="absolute w-32 h-32 rounded-full bg-amber-400/25 blur-2xl pointer-events-none"
        style={{ left: `${circle2X}%`, top: `${circle2Y}%` }}
      />

      {/* Abstract Glowing Polyline / Node graphic */}
      <svg
        className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
        viewBox="0 0 400 200"
        preserveAspectRatio="none"
      >
        <polyline
          points="0,150 80,100 160,130 240,60 320,110 400,40"
          fill="none"
          stroke="white"
          strokeWidth="2"
        />
        <circle cx="80" cy="100" r="4" fill="white" />
        <circle cx="160" cy="130" r="4" fill="white" />
        <circle cx="240" cy="60" r="5" fill="white" />
        <circle cx="320" cy="110" r="4" fill="white" />
      </svg>

      {/* Center AI Category Icon Badge */}
      <div className="relative z-10 flex flex-col items-center justify-center p-3 text-center">
        <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-lg mb-1.5">
          <IconComponent className="h-6 w-6 text-white" />
        </div>
        {category && (
          <span className="text-[11px] font-bold uppercase tracking-widest text-white/90 drop-shadow-xs">
            {category}
          </span>
        )}
      </div>

      {/* AI Watermark Tag */}
      <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-md text-[10px] font-semibold text-white/80">
        <Sparkles className="h-3 w-3 text-amber-300" />
        <span>AI Generated Banner</span>
      </div>
    </div>
  )
}
