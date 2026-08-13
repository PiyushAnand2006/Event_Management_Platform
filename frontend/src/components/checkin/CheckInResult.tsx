'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type CheckInResultData = {
  success: boolean
  guestName?: string
  tier?: string
  seatLabel?: string
  reason?: string
}

type CheckInResultProps = {
  result: CheckInResultData | null
}

export default function CheckInResult({ result }: CheckInResultProps) {
  if (!result) return null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={result.success ? 'success' : 'failure'}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <Card
          className={cn(
            'border-2',
            result.success
              ? 'border-orange-500/40 bg-orange-50 dark:bg-orange-950/30'
              : 'border-red-500/40 bg-red-50 dark:bg-red-950/30'
          )}
        >
          <CardContent className="p-4 flex items-start gap-3">
            {result.success ? (
              <div className="flex-shrink-0 mt-0.5">
                <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            ) : (
              <div className="flex-shrink-0 mt-0.5">
                <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            )}

            <div className="flex-1 min-w-0">
              {result.success ? (
                <>
                  <p className="text-sm font-semibold text-orange-800 dark:text-orange-200">
                    Checked In!
                  </p>
                  {result.guestName && (
                    <p className="text-base font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                      {result.guestName}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5">
                    {result.tier && (
                      <Badge
                        variant="secondary"
                        className="bg-orange-200/60 text-orange-800 dark:bg-orange-800/40 dark:text-orange-200 text-xs"
                      >
                        {result.tier}
                      </Badge>
                    )}
                    {result.seatLabel && (
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Seat: {result.seatLabel}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                    Check-In Failed
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-0.5">
                    {result.reason || 'Invalid invitation'}
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
