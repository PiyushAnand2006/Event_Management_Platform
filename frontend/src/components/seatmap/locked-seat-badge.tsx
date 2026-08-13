'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Lock } from 'lucide-react'

interface LockedSeatBadgeProps {
  isLocked: boolean
}

export default function LockedSeatBadge({ isLocked }: LockedSeatBadgeProps) {
  return (
    <AnimatePresence>
      {isLocked && (
        <motion.div
          className="absolute -top-1.5 -right-1.5 z-10"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        >
          <div className="flex items-center justify-center h-3.5 w-3.5 rounded-full bg-amber-400 dark:bg-amber-500 shadow-sm border border-amber-300 dark:border-amber-400">
            <Lock className="h-2 w-2 text-amber-900 dark:text-amber-950" strokeWidth={3} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
