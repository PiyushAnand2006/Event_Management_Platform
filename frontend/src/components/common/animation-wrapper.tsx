'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AnimationWrapperProps {
  children: React.ReactNode
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  className?: string
}

const directionOffsets = {
  up: { x: 0, y: 40 },
  down: { x: 0, y: -40 },
  left: { x: 40, y: 0 },
  right: { x: -40, y: 0 },
}

export function AnimationWrapper({
  children,
  delay = 0,
  direction = 'up',
  className,
}: AnimationWrapperProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  const offset = directionOffsets[direction]

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        x: offset.x,
        y: offset.y,
      }}
      animate={
        isInView
          ? { opacity: 1, x: 0, y: 0 }
          : { opacity: 0, x: offset.x, y: offset.y }
      }
      transition={{
        duration: 0.5,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}
