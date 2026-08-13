'use client'

import React, { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import {
  Users,
  CalendarDays,
  UserCheck,
  TrendingUp,
  Activity,
  AlertTriangle,
  PieChartIcon,
  BarChart3,
  Star,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { StatsCards } from '@/components/stats/stats-cards'
import { Leaderboard } from '@/components/stats/leaderboard'

const STATUS_COLORS: Record<string, string> = {
  published: '#10b981',
  pending: '#f59e0b',
  approved: '#10b981',
  rejected: '#ef4444',
}

const CONTACT_STATUS_VARIANT: Record<string, string> = {
  unverified: 'secondary',
  contacted: 'outline',
  confirmed: 'default',
}

export default function AdminStatsPage() {
  // Fetch platform stats (old endpoint for backward compat)
  const { data: statsData, isLoading: loadingStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/admin/stats')
        if (!res.ok) throw new Error()
        return res.json()
      } catch {
        return null
      }
    },
  })

  // Fetch analytics (new endpoint with charts data)
  const { data: analyticsData, isLoading: loadingAnalytics } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/admin/analytics')
        if (!res.ok) throw new Error()
        const data = await res.json()
        return data.data || data
      } catch {
        return null
      }
    },
  })

  // Fetch leaderboard
  const { data: leaderboardData, isLoading: loadingLeaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/stats/leaderboard?sortBy=rating&limit=10')
        if (!res.ok) throw new Error()
        const data = await res.json()
        return data.events || data || []
      } catch {
        return []
      }
    },
  })

  // Fetch recent registrations
  const { data: recentRegsData, isLoading: loadingRegs } = useQuery({
    queryKey: ['admin-recent-registrations'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/admin/stats/recent-registrations')
        if (!res.ok) throw new Error()
        return res.json()
      } catch {
        return { registrations: [] }
      }
    },
  })

  // Fetch vendor incidents
  const { data: incidentsData, isLoading: loadingIncidents } = useQuery({
    queryKey: ['admin-incidents'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/admin/incidents')
        if (!res.ok) throw new Error()
        const data = await res.json()
        return data.data || data
      } catch {
        return { incidents: [] }
      }
    },
  })

  // Use analytics data if available, otherwise fall back to statsData
  const combined = analyticsData || statsData

  const stats = combined
    ? [
        {
          label: 'Total Users',
          value: combined.totalUsers ?? 0,
          icon: Users,
          color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400',
        },
        {
          label: 'Total Events',
          value: combined.totalEvents ?? 0,
          icon: CalendarDays,
          color: 'bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400',
        },
        {
          label: 'Total Registrations',
          value: combined.totalRegistrations ?? 0,
          icon: UserCheck,
          color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400',
        },
        {
          label: 'Avg Rating',
          value: combined.averageRating ?? 0,
          icon: Star,
          color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400',
        },
      ]
    : [
        { label: 'Total Users', value: 0, icon: Users, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400' },
        { label: 'Total Events', value: 0, icon: CalendarDays, color: 'bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400' },
        { label: 'Total Registrations', value: 0, icon: UserCheck, color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400' },
        { label: 'Avg Rating', value: 0, icon: Star, color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400' },
      ]

  const categoryDistribution = useMemo(() => {
    const cats = combined?.categoryDistribution || combined?.topCategories || []
    return (cats as { category: string; count: number }[])
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [combined])

  const eventsByStatusData = useMemo(() => {
    const map = combined?.eventsByStatus || {}
    return Object.entries(map as Record<string, number>)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }))
  }, [combined])

  const recentRegistrations = recentRegsData?.registrations || []
  const incidents = incidentsData?.incidents || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Platform Statistics
        </h1>
        <p className="text-muted-foreground mt-1">
          Overview of platform-wide metrics and performance.
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} loading={loadingStats && loadingAnalytics} />

      {/* Charts Row 1: Events by Status + Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events by Status PieChart */}
        {loadingAnalytics ? (
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full rounded-lg" />
            </CardContent>
          </Card>
        ) : eventsByStatusData.length === 0 ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <PieChartIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                Events by Status
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64">
              <p className="text-sm text-muted-foreground">No data available</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <PieChartIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                Events by Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={eventsByStatusData}
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
                    {eventsByStatusData.map((entry) => (
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

        {/* Top Categories BarChart */}
        {loadingAnalytics ? (
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full rounded-lg" />
            </CardContent>
          </Card>
        ) : categoryDistribution.length === 0 ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                Top Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64">
              <p className="text-sm text-muted-foreground">No data available</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                Top Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={categoryDistribution}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="category"
                    width={90}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid hsl(var(--border))',
                      backgroundColor: 'hsl(var(--popover))',
                      color: 'hsl(var(--popover-foreground))',
                    }}
                  />
                  <Bar dataKey="count" name="Events" radius={[0, 6, 6, 0]}>
                    {categoryDistribution.map((_, index) => (
                      <Cell
                        key={index}
                        fill={['#10b981', '#34d399', '#6ee7b7', '#059669', '#047857', '#10b981', '#34d399', '#6ee7b7'][index]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Leaderboard */}
      <Leaderboard events={leaderboardData} loading={loadingLeaderboard} />

      {/* Vendor Incidents Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Vendor Incidents
          </CardTitle>
          <CardDescription>Backup vendor triggers and status across all events.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingIncidents ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                </div>
              ))}
            </div>
          ) : incidents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No vendor incidents recorded
            </p>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead className="hidden sm:table-cell">Event</TableHead>
                    <TableHead className="hidden md:table-cell">Stall</TableHead>
                    <TableHead className="hidden md:table-cell">Distance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incidents.map((inc: {
                    id: string
                    vendorName: string
                    distanceKm: number
                    source: string
                    contactStatus: string
                    createdAt: string
                    event: { title: string } | null
                    stall: { ownerName: string; stallType: string } | null
                  }) => (
                    <TableRow key={inc.id}>
                      <TableCell className="font-medium">{inc.vendorName}</TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {inc.event?.title || 'N/A'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {inc.stall?.ownerName || 'N/A'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {inc.distanceKm.toFixed(1)} km
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={(CONTACT_STATUS_VARIANT[inc.contactStatus] || 'secondary') as 'default' | 'secondary' | 'outline'}
                          className="capitalize"
                        >
                          {inc.contactStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">
                        {format(parseISO(inc.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Registrations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            Recent Registrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingRegs ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentRegistrations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No recent registrations
            </p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentRegistrations.map((reg: { id: string; userName: string; eventTitle: string; createdAt: string }, i: number) => (
                <motion.div
                  key={reg.id}
                  className="flex items-center gap-3 rounded-lg border p-3"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 text-xs font-semibold">
                    {reg.userName?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{reg.userName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      Registered for <span className="font-medium text-foreground">{reg.eventTitle}</span>
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {format(parseISO(reg.createdAt), 'MMM d')}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
