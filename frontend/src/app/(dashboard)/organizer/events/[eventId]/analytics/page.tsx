'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Users,
  UserCheck,
  Star,
  BarChart3,
  PieChartIcon,
  TrendingUp,
  Vote,
  Armchair,
  Ticket,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts'

const EMERALD_COLORS = ['#10b981', '#34d399', '#6ee7b7']
const STATUS_COLORS: Record<string, string> = {
  registered: '#10b981',
  attended: '#059669',
  waitlisted: '#f59e0b',
  cancelled: '#ef4444',
}
const FUNNEL_COLORS = ['#6ee7b7', '#34d399', '#10b981', '#059669']

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  loading,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  color: string
  loading?: boolean
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="h-6 w-16 mt-1" />
          ) : (
            <p className="text-xl font-bold truncate">{value}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-64 w-full rounded-lg" />
      </CardContent>
    </Card>
  )
}

export default function EventAnalyticsPage() {
  const params = useParams()
  const eventId = params.eventId as string

  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ['event-analytics', eventId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/analytics`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      return data.data || data
    },
  })

  const { data: checkinData, isLoading: loadingCheckin } = useQuery({
    queryKey: ['event-analytics-checkin', eventId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/analytics/checkin`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      return data.data || data
    },
  })

  const { data: pollsData, isLoading: loadingPolls } = useQuery({
    queryKey: ['event-analytics-polls', eventId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/analytics/polls`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      return data.data || data
    },
  })

  const { data: funnelData, isLoading: loadingFunnel } = useQuery({
    queryKey: ['event-analytics-funnel', eventId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/analytics/rsvp-funnel`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      return data.data || data
    },
  })

  const { data: seatData, isLoading: loadingSeat } = useQuery({
    queryKey: ['event-analytics-seat', eventId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/analytics/seat-utilization`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      return data.data || data
    },
  })

  // Derived data
  const tierData = overview?.registrationsByTier
    ? Object.entries(overview.registrationsByTier).map(([name, value]) => ({ name, value: value as number }))
    : []

  const statusData = overview?.registrationsByStatus
    ? Object.entries(overview.registrationsByStatus)
        .filter(([, v]) => v > 0)
        .map(([name, value]) => ({ name, value: value as number }))
    : []

  const timeline = checkinData?.timeline || []
  const funnel = funnelData?.funnel || []
  const polls = pollsData?.polls || []

  const maxFunnel = funnel.length > 0 ? Math.max(...funnel.map((f: { count: number }) => f.count), 1) : 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl flex items-center gap-2">
          <BarChart3 className="h-7 w-7 text-orange-600 dark:text-orange-400" />
          Event Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          Detailed performance metrics for this event.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Registrations"
          value={overview?.totalRegistrations ?? 0}
          color="bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400"
          loading={loadingOverview}
        />
        <StatCard
          icon={UserCheck}
          label="Check-In Rate"
          value={overview?.checkInRate ?? '0%'}
          color="bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400"
          loading={loadingOverview}
        />
        <StatCard
          icon={Star}
          label="Average Rating"
          value={overview?.averageRating ?? 0}
          color="bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400"
          loading={loadingOverview}
        />
        <StatCard
          icon={Vote}
          label="Poll Votes"
          value={overview?.pollParticipation?.totalVotes ?? 0}
          color="bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400"
          loading={loadingOverview}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registrations by Tier - BarChart */}
        {loadingOverview ? (
          <ChartSkeleton />
        ) : (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Ticket className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                Registrations by Tier
              </CardTitle>
              <CardDescription>Distribution across VIP, reserved, and general tiers.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={tierData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid hsl(var(--border))',
                      backgroundColor: 'hsl(var(--popover))',
                      color: 'hsl(var(--popover-foreground))',
                    }}
                  />
                  <Bar dataKey="value" name="Registrations" radius={[6, 6, 0, 0]}>
                    {tierData.map((_, index) => (
                      <Cell key={index} fill={EMERALD_COLORS[index % EMERALD_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Registrations by Status - PieChart */}
        {loadingOverview ? (
          <ChartSkeleton />
        ) : statusData.length === 0 ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <PieChartIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                Registrations by Status
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64">
              <p className="text-sm text-muted-foreground">No registration data</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <PieChartIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                Registrations by Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                  >
                    {statusData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={STATUS_COLORS[entry.name] || '#94a3b8'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid hsl(var(--border))',
                      backgroundColor: 'hsl(var(--popover))',
                      color: 'hsl(var(--popover-foreground))',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Check-In Timeline - AreaChart */}
        {loadingCheckin ? (
          <ChartSkeleton />
        ) : timeline.length === 0 ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                Check-In Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64">
              <p className="text-sm text-muted-foreground">No check-in data yet</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                Check-In Timeline
              </CardTitle>
              <CardDescription>
                {checkinData.checkedIn} of {checkinData.total} checked in ({checkinData.rate}%)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={timeline} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid hsl(var(--border))',
                      backgroundColor: 'hsl(var(--popover))',
                      color: 'hsl(var(--popover-foreground))',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    name="Cumulative Check-Ins"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCumulative)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* RSVP Funnel */}
        {loadingFunnel ? (
          <ChartSkeleton />
        ) : funnel.length === 0 || funnel.every((f: { count: number }) => f.count === 0) ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                RSVP Funnel
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64">
              <p className="text-sm text-muted-foreground">No invitation data</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                RSVP Funnel
              </CardTitle>
              <CardDescription>Invitation journey from issued to checked in.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 pt-2">
                {funnel.map((step: { stage: string; count: number }, idx: number) => {
                  const pct = (step.count / maxFunnel) * 100
                  return (
                    <motion.div
                      key={step.stage}
                      className="space-y-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{step.stage}</span>
                        <span className="font-semibold text-orange-600 dark:text-orange-400">
                          {step.count}
                        </span>
                      </div>
                      <div className="h-7 rounded-md bg-muted overflow-hidden">
                        <motion.div
                          className="h-full rounded-md flex items-center px-2 text-xs font-medium text-white"
                          style={{ backgroundColor: FUNNEL_COLORS[idx % FUNNEL_COLORS.length] }}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(pct, 8)}%` }}
                          transition={{ duration: 0.6, delay: idx * 0.1 + 0.2 }}
                        >
                          {pct > 15 && `${step.count}`}
                        </motion.div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts Row 3: Polls + Seat Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Poll Participation Summary */}
        {loadingPolls ? (
          <ChartSkeleton />
        ) : polls.length === 0 ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Vote className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                Poll Participation
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64">
              <p className="text-sm text-muted-foreground">No polls created</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Vote className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                Poll Participation
              </CardTitle>
              <CardDescription>{polls.length} poll{polls.length !== 1 ? 's' : ''} created</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-5 max-h-72 overflow-y-auto pr-1">
                {polls.map((poll: {
                  id: string
                  question: string
                  responseCount: number
                  isLive: boolean
                  options: { text: string; votes: number; percentage: number }[]
                }) => (
                  <div key={poll.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate flex-1">{poll.question}</p>
                      <Badge variant={poll.isLive ? 'default' : 'secondary'} className="shrink-0 text-xs">
                        {poll.isLive ? 'Live' : 'Closed'}
                      </Badge>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {poll.responseCount} votes
                      </span>
                    </div>
                    <div className="space-y-1.5 pl-1">
                      {poll.options.map((opt, i) => (
                        <div key={i} className="space-y-0.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="truncate max-w-[180px]">{opt.text}</span>
                            <span className="text-muted-foreground font-medium">{opt.percentage}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-orange-500 transition-all duration-500"
                              style={{ width: `${opt.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Seat Utilization */}
        {loadingSeat ? (
          <ChartSkeleton />
        ) : !seatData?.hasVenue ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Armchair className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                Seat Utilization
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64">
              <p className="text-sm text-muted-foreground">No venue configured</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Armchair className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                Seat Utilization
              </CardTitle>
              <CardDescription>
                {seatData.occupiedSeats} of {seatData.totalSeats} seats occupied ({seatData.utilizationRate}%)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {/* By Tier */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">By Tier</p>
                  {Object.entries(seatData.byTier || {}).map(([tier, info]: [string, { total: number; occupied: number }]) => (
                    <div key={tier} className="flex items-center gap-3">
                      <span className="text-sm w-20 capitalize">{tier}</span>
                      <div className="flex-1 h-5 rounded-md bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-md bg-orange-500 transition-all duration-500 flex items-center px-2 text-xs text-white font-medium"
                          style={{ width: `${info.total > 0 ? (info.occupied / info.total) * 100 : 0}%`, minWidth: info.occupied > 0 ? '24px' : '0' }}
                        >
                          {info.occupied > 0 && `${info.occupied}/${info.total}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* By Section */}
                {(seatData.sections || []).length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-3">By Section</p>
                    {(seatData.sections as { name: string; total: number; occupied: number; rate: number }[]).map((sec) => (
                      <div key={sec.name} className="flex items-center gap-3">
                        <span className="text-sm w-28 truncate">{sec.name}</span>
                        <div className="flex-1 h-5 rounded-md bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-md bg-orange-400 transition-all duration-500 flex items-center px-2 text-xs text-white font-medium"
                            style={{ width: `${sec.rate}%`, minWidth: sec.occupied > 0 ? '24px' : '0' }}
                          >
                            {sec.occupied > 0 && `${sec.occupied}/${sec.total}`}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground w-12 text-right">{sec.rate}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
