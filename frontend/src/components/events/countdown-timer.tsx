'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CountdownTimerProps {
  targetDate: Date
  endDate?: Date | null
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calcTimeLeft(target: Date): TimeLeft {
  const diff = target.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

function isHappeningNow(start: Date, end?: Date | null): boolean {
  const now = Date.now()
  const oneHour = 60 * 60 * 1000
  const startWithinHour = start.getTime() - now <= oneHour && now <= start.getTime()
  if (startWithinHour) return true
  if (end && now >= start.getTime() && now <= end.getTime()) return true
  if (!end && now >= start.getTime() && now <= start.getTime() + 24 * 60 * 60 * 1000) return true
  return false
}

function hasEnded(start: Date, end?: Date | null): boolean {
  const now = Date.now()
  if (end && now > end.getTime()) return true
  if (!end && now > start.getTime() + 24 * 60 * 60 * 1000) return true
  return false
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
      <div className="bg-card border border-border/60 rounded-lg w-full h-14 sm:h-16 flex items-center justify-center shadow-sm">
        <span className="text-xl sm:text-2xl font-bold tabular-nums text-foreground">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">
        {label}
      </span>
    </div>
  )
}

export function CountdownTimer({ targetDate, endDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calcTimeLeft(targetDate))
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setTimeLeft(calcTimeLeft(targetDate))
    }, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  if (!mounted) {
    return (
      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
        <Clock className="h-5 w-5 text-muted-foreground animate-pulse" />
        <span className="text-sm text-muted-foreground">Loading countdown...</span>
      </div>
    )
  }

  const happening = isHappeningNow(targetDate, endDate)
  const ended = hasEnded(targetDate, endDate)

  if (ended) {
    return (
      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
        <Clock className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Event Ended</span>
      </div>
    )
  }

  if (happening) {
    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-3 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="h-3 w-3 rounded-full bg-orange-500"
        />
        <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
          Happening Now
        </span>
      </motion.div>
    )
  }

  const totalDiff = targetDate.getTime() - Date.now()
  if (totalDiff <= 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span className="font-medium">Event starts in</span>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <TimeUnit value={timeLeft.days} label="Days" />
        <span className={cn('text-xl font-bold text-muted-foreground/40 pb-6')}>:</span>
        <TimeUnit value={timeLeft.hours} label="Hours" />
        <span className={cn('text-xl font-bold text-muted-foreground/40 pb-6')}>:</span>
        <TimeUnit value={timeLeft.minutes} label="Min" />
      </div>
    </div>
  )
}
