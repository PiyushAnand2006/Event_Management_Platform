'use client'

import { useEffect, useImperativeHandle, useState } from 'react'
import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Users, UserCheck, UserX } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export interface AssignmentStatusRef {
  refresh: () => void
}

interface TierBreakdown {
  tier: string
  total: number
  assigned: number
}

interface StatusData {
  totalRegistrations: number
  assignedCount: number
  unassignedCount: number
  tierBreakdown: TierBreakdown[]
}

interface AssignmentStatusProps {
  eventId: string
}

const AssignmentStatus = forwardRef<AssignmentStatusRef, AssignmentStatusProps>(
  function AssignmentStatus({ eventId }, ref) {
    const [data, setData] = useState<StatusData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    async function fetchStatus() {
      setLoading(true)
      setError(false)
      try {
        const res = await fetch(`/api/events/${eventId}/seat-assignment/status`)
        const json = await res.json()
        if (json.success) {
          setData(json.data as StatusData)
        } else {
          setError(true)
        }
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    useImperativeHandle(ref, () => ({ refresh: fetchStatus }), [])

    useEffect(() => {
      fetchStatus()
    }, [eventId])

    if (loading && !data) {
      return (
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-2 w-32" />
        </div>
      )
    }

    if (error || !data) {
      return null
    }

    const pct = data.totalRegistrations > 0
      ? Math.round((data.assignedCount / data.totalRegistrations) * 100)
      : 0

    return (
      <motion.div
        className="flex items-center gap-3 flex-wrap"
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <span className="text-muted-foreground">
            <span className="font-semibold text-foreground">{data.assignedCount}</span>
            {' of '}
            <span className="font-semibold text-foreground">{data.totalRegistrations}</span>
            {' guests assigned'}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 w-40">
          <Progress value={pct} className="h-2 flex-1 [&>div]:bg-orange-500" />
          <span className="text-xs font-medium text-muted-foreground tabular-nums w-8 text-right">{pct}%</span>
        </div>

        <div className="flex items-center gap-1.5">
          {data.tierBreakdown.map((t) => {
            const isAssigned = t.assigned > 0
            const isUnassigned = t.assigned < t.total
            const tierLabel = t.tier.charAt(0).toUpperCase() + t.tier.slice(1)
            return (
              <span key={t.tier} className="flex items-center gap-1">
                {isAssigned && (
                  <Badge variant="outline" className="text-[10px] h-5 px-1.5 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30 gap-0.5">
                    <UserCheck className="h-2.5 w-2.5" />
                    {tierLabel}: {t.assigned}
                  </Badge>
                )}
                {isUnassigned && (
                  <Badge variant="outline" className="text-[10px] h-5 px-1.5 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 gap-0.5">
                    <UserX className="h-2.5 w-2.5" />
                    {t.total - t.assigned}
                  </Badge>
                )}
              </span>
            )
          })}
        </div>
      </motion.div>
    )
  }
)

AssignmentStatus.displayName = 'AssignmentStatus'

export default AssignmentStatus
