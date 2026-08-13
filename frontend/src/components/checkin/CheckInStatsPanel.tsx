'use client'

import { motion } from 'framer-motion'
import { Users, UserCheck, Clock, ShieldOff } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

type CheckInStats = {
  totalInvited: number
  sent: number
  checkedIn: number
  pending: number
  revoked: number
}

type CheckInStatsPanelProps = {
  stats: CheckInStats | null
}

function AnimatedNumber({ value }: { value: number }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="tabular-nums"
    >
      {value}
    </motion.span>
  )
}

type StatItemProps = {
  icon: React.ReactNode
  label: string
  value: number
  colorClass: string
  iconBg: string
}

function StatItem({ icon, label, value, colorClass, iconBg }: StatItemProps) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', iconBg)}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground leading-none">{label}</p>
        <p className={cn('text-lg font-bold leading-tight mt-0.5', colorClass)}>
          <AnimatedNumber value={value} />
        </p>
      </div>
    </div>
  )
}

export default function CheckInStatsPanel({ stats }: CheckInStatsPanelProps) {
  if (!stats) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground text-center">
            Loading stats...
          </p>
        </CardContent>
      </Card>
    )
  }

  const checkInRate =
    stats.totalInvited > 0
      ? Math.round((stats.checkedIn / stats.totalInvited) * 100)
      : 0

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatItem
            icon={<Users className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
            label="Invited"
            value={stats.totalInvited}
            colorClass="text-gray-900 dark:text-gray-100"
            iconBg="bg-gray-100 dark:bg-gray-800"
          />
          <StatItem
            icon={
              <UserCheck className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            }
            label="Checked In"
            value={stats.checkedIn}
            colorClass="text-orange-700 dark:text-orange-300"
            iconBg="bg-orange-100 dark:bg-orange-900/40"
          />
          <StatItem
            icon={
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            }
            label="Pending"
            value={stats.pending}
            colorClass="text-amber-700 dark:text-amber-300"
            iconBg="bg-amber-100 dark:bg-amber-900/40"
          />
          <StatItem
            icon={
              <ShieldOff className="h-4 w-4 text-red-600 dark:text-red-400" />
            }
            label="Revoked"
            value={stats.revoked}
            colorClass="text-red-700 dark:text-red-300"
            iconBg="bg-red-100 dark:bg-red-900/40"
          />
        </div>

        {/* Check-in rate progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Check-in rate</span>
            <span className="font-semibold text-orange-700 dark:text-orange-400 tabular-nums">
              {checkInRate}%
            </span>
          </div>
          <Progress
            value={checkInRate}
            className="h-2 [&>div]:bg-orange-500"
          />
        </div>
      </CardContent>
    </Card>
  )
}
