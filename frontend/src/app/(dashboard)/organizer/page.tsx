'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import {
  PlusCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  Users,
  ArrowRight,
  Tag,
  ListChecks,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { StatsCards } from '@/components/stats/stats-cards'

type OrganizerEvent = {
  id: string
  title: string
  date: string
  category?: string
  status: string
  registeredCount?: number
  capacity?: number
  createdAt?: string
}

type CategoryStat = {
  category: string
  count: number
}

const statusConfig: Record<string, { badge: string; icon: React.ElementType }> = {
  published: {
    badge: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
    icon: CheckCircle2,
  },
  pending: {
    badge: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    icon: Clock,
  },
  rejected: {
    badge: '',
    icon: Clock,
  },
}

export default function OrganizerDashboardPage() {
  const {
    data: events = [],
    isLoading,
  } = useQuery({
    queryKey: ['organized-events'],
    queryFn: async () => {
      const res = await fetch('/api/events?organized=true')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      return Array.isArray(data.data?.events)
        ? data.data.events
        : Array.isArray(data.events)
        ? data.events
        : Array.isArray(data)
        ? data
        : []
    },
  })

  const stats = useMemo(() => {
    const published = events.filter((e: OrganizerEvent) => e.status === 'published').length
    const pending = events.filter((e: OrganizerEvent) => e.status === 'pending').length
    const totalRegistrations = events.reduce(
      (sum: number, e: OrganizerEvent) => sum + (e.registeredCount || 0),
      0
    )
    return [
      {
        label: 'Total Events',
        value: events.length,
        icon: CalendarDays,
        color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400',
      },
      {
        label: 'Published',
        value: published,
        icon: CheckCircle2,
        color: 'bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400',
      },
      {
        label: 'Pending Review',
        value: pending,
        icon: Clock,
        color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400',
      },
      {
        label: 'Total Registrations',
        value: totalRegistrations,
        icon: Users,
        color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400',
      },
    ]
  }, [events])

  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {}
    events.forEach((e: OrganizerEvent) => {
      const cat = e.category || 'Other'
      map[cat] = (map[cat] || 0) + 1
    })
    return Object.entries(map)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
  }, [events])

  const recentEvents = useMemo(
    () =>
      [...events]
        .sort(
          (a: OrganizerEvent, b: OrganizerEvent) =>
            new Date(b.createdAt || b.date).getTime() -
            new Date(a.createdAt || a.date).getTime()
        )
        .slice(0, 5),
    [events]
  )

  return (
    <div className="space-y-6">
      {/* Page Title + Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Organizer Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Overview of your events and performance.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="bg-orange-600 hover:bg-orange-700 text-white">
            <Link href="/organizer/events/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Event
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/organizer/events">
              View All Events
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} loading={isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Tag className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-2 flex-1 rounded-full" />
                    <Skeleton className="h-4 w-6" />
                  </div>
                ))}
              </div>
            ) : categoryBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No events yet
              </p>
            ) : (
              <div className="space-y-3">
                {categoryBreakdown.map((cat) => {
                  const maxCount = Math.max(
                    ...categoryBreakdown.map((c) => c.count)
                  )
                  const pct = maxCount > 0 ? (cat.count / maxCount) * 100 : 0
                  return (
                    <div key={cat.category} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="truncate max-w-[140px]">
                          {cat.category}
                        </span>
                        <span className="font-semibold text-orange-600 dark:text-orange-400">
                          {cat.count}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-orange-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, delay: 0.2 }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              Recent Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </div>
            ) : recentEvents.length === 0 ? (
              <div className="py-8 text-center">
                <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No events created yet
                </p>
                <Button
                  asChild
                  className="mt-3 bg-orange-600 hover:bg-orange-700 text-white"
                  size="sm"
                >
                  <Link href="/organizer/events/create">
                    <PlusCircle className="mr-1 h-4 w-4" />
                    Create Your First Event
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {recentEvents.map((event: OrganizerEvent, i: number) => {
                  const config = statusConfig[event.status] || statusConfig.pending
                  const StatusIcon = config.icon
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        href={`/organizer/events/${event.id}/edit`}
                        className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-950/30">
                          <CalendarDays className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {event.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(parseISO(event.date), 'MMM d, yyyy')}
                            {event.registeredCount !== undefined && (
                              <span className="ml-2">
                                {event.registeredCount} registered
                              </span>
                            )}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`shrink-0 ${config.badge}`}
                        >
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {event.status}
                        </Badge>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
