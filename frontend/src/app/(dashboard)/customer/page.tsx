'use client'

import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  format,
  isPast,
  isFuture,
  parseISO,
} from 'date-fns'
import {
  CalendarDays,
  LayoutGrid,
  Calendar,
  Ticket,
  Clock,
  Download,
  Bookmark,
  ExternalLink,
  Search,
  MapPin,
  DollarSign,
  X,
  Award,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
  type View,
} from 'react-big-calendar'
import { format as fnsFormat, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale/en-US'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const locales = { 'en-US': enUS }
const localizer = dateFnsLocalizer({
  format: fnsFormat,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
})

type EventItem = {
  id: string
  title: string
  description?: string
  date: string
  endTime?: string
  location?: string
  price: number
  category?: string
  type?: string
  poster?: string
  status: string
  capacity?: number
  registeredCount?: number
  registrationStatus?: string
}

export default function CustomerDashboardPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid')
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null)
  const [calendarView, setCalendarView] = useState<View>('month')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch user's registered events (upcoming + past)
  const {
    data: registeredEvents = [],
    isLoading: loadingRegistered,
  } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: async () => {
      const res = await fetch('/api/events?registered=true')
      if (!res.ok) throw new Error('Failed to fetch registrations')
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

  // Fetch bookmarks
  const {
    data: bookmarkedEvents = [],
    isLoading: loadingBookmarks,
  } = useQuery({
    queryKey: ['my-bookmarks'],
    queryFn: async () => {
      const res = await fetch('/api/users/me/bookmark')
      if (!res.ok) throw new Error('Failed to fetch bookmarks')
      const data = await res.json()
      return data.events || data || []
    },
  })

  // Remove bookmark mutation
  const removeBookmark = useMutation({
    mutationFn: async (eventId: string) => {
      const res = await fetch('/api/users/me/bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      })
      if (!res.ok) throw new Error('Failed to remove bookmark')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookmarks'] })
      toast({ title: 'Bookmark removed' })
    },
  })

  // Browse events
  const {
    data: browseEvents = [],
    isLoading: loadingBrowse,
  } = useQuery({
    queryKey: ['browse-events', searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)
      params.set('status', 'published')
      const res = await fetch(`/api/events?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch events')
      const data = await res.json()
      return data.events || data || []
    },
  })

  // Split into upcoming and past
  const upcomingEvents = useMemo(
    () => registeredEvents.filter((e: EventItem) => !isPast(parseISO(e.date))),
    [registeredEvents]
  )
  const pastEvents = useMemo(
    () => registeredEvents.filter((e: EventItem) => isPast(parseISO(e.date))),
    [registeredEvents]
  )

  // Calendar events
  const calendarEvents = useMemo(
    () =>
      registeredEvents.map((e: EventItem) => ({
        id: e.id,
        title: e.title,
        start: parseISO(e.date),
        end: e.endTime ? parseISO(e.endTime) : parseISO(e.date),
        resource: e,
      })),
    [registeredEvents]
  )

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          My Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your tickets, saved events, and discover new ones.
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="upcoming" className="flex items-center gap-1.5">
              <Ticket className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Upcoming</span>
            </TabsTrigger>
            <TabsTrigger value="past" className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Past</span>
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-1.5">
              <Bookmark className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Saved</span>
            </TabsTrigger>
            <TabsTrigger value="browse" className="flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Browse</span>
            </TabsTrigger>
          </TabsList>

          {/* View toggle for upcoming/past */}
          <div className="flex items-center gap-1 rounded-lg border p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setViewMode('calendar')}
            >
              <Calendar className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Upcoming Tickets */}
        <TabsContent value="upcoming">
          {loadingRegistered ? (
            <EventCardSkeleton count={4} />
          ) : upcomingEvents.length === 0 ? (
            <EmptyState
              icon={Ticket}
              title="No upcoming tickets"
              description="You haven't registered for any upcoming events. Browse events to find something you like!"
            />
          ) : viewMode === 'grid' ? (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {upcomingEvents.map((event: EventItem, i: number) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <EventCard event={event} onClick={() => setSelectedEvent(event)} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <Card className="p-4">
              <BigCalendar
                localizer={localizer}
                events={calendarEvents}
                view={calendarView}
                onView={setCalendarView}
                style={{ height: 500 }}
                popup
                onSelectEvent={(e) => setSelectedEvent(e.resource)}
                eventPropGetter={() => ({
                  style: {
                    backgroundColor: 'rgb(5 150 105)',
                    borderRadius: '6px',
                    border: 'none',
                    color: 'white',
                  },
                })}
              />
            </Card>
          )}
        </TabsContent>

        {/* Past Tickets */}
        <TabsContent value="past">
          {loadingRegistered ? (
            <EventCardSkeleton count={4} />
          ) : pastEvents.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No past events"
              description="Your attended events will appear here."
            />
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {pastEvents.map((event: EventItem, i: number) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <EventCard
                    event={event}
                    onClick={() => setSelectedEvent(event)}
                    showCertificate
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>

        {/* Saved Events */}
        <TabsContent value="saved">
          {loadingBookmarks ? (
            <EventCardSkeleton count={4} />
          ) : bookmarkedEvents.length === 0 ? (
            <EmptyState
              icon={Bookmark}
              title="No saved events"
              description="Bookmark events to save them for later."
            />
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {bookmarkedEvents.map((event: EventItem, i: number) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <EventCard
                    event={event}
                    onClick={() => setSelectedEvent(event)}
                    onRemoveBookmark={() => removeBookmark.mutate(event.id)}
                    removing={removeBookmark.isPending}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>

        {/* Browse Events */}
        <TabsContent value="browse">
          <div className="mb-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          {loadingBrowse ? (
            <EventCardSkeleton count={6} />
          ) : browseEvents.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No events found"
              description={searchQuery ? `No results for "${searchQuery}"` : 'No published events available right now.'}
                />
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {browseEvents.map((event: EventItem, i: number) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <EventCard event={event} onClick={() => setSelectedEvent(event)} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>
      </Tabs>

      {/* Ticket Detail Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {selectedEvent.category && (
                  <Badge variant="secondary">{selectedEvent.category}</Badge>
                )}
                {selectedEvent.type && (
                  <Badge variant="outline" className="capitalize">
                    {selectedEvent.type.replace('_', ' ')}
                  </Badge>
                )}
                <Badge
                  className={
                    selectedEvent.status === 'published'
                      ? 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400'
                      : 'bg-amber-100 text-amber-700 border-amber-200'
                  }
                  variant="outline"
                >
                  {selectedEvent.status}
                </Badge>
              </div>

              {selectedEvent.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedEvent.description}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <span>{format(parseISO(selectedEvent.date), 'MMM d, yyyy')}</span>
                </div>
                {selectedEvent.endTime && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    <span>{format(parseISO(selectedEvent.endTime), 'h:mm a')}</span>
                  </div>
                )}
                {selectedEvent.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    <span className="truncate">{selectedEvent.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <span>{selectedEvent.price === 0 ? 'Free' : `$${selectedEvent.price}`}</span>
                </div>
              </div>

              {selectedEvent.registrationStatus && (
                <div className="flex items-center justify-between rounded-lg bg-orange-50 p-3 dark:bg-orange-950/30">
                  <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                    Registration Status
                  </span>
                  <Badge className="bg-orange-600 text-white">{selectedEvent.registrationStatus}</Badge>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ---------- Sub-components ---------- */

function EventCard({
  event,
  onClick,
  showCertificate,
  onRemoveBookmark,
  removing,
}: {
  event: EventItem
  onClick: () => void
  showCertificate?: boolean
  onRemoveBookmark?: () => void
  removing?: boolean
}) {
  const past = isPast(parseISO(event.date))

  return (
    <Card
      className="group cursor-pointer hover:shadow-md transition-all hover:border-orange-300 dark:hover:border-orange-700 overflow-hidden"
      onClick={onClick}
    >
      {/* Poster placeholder */}
      <div className="relative h-32 bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/40 dark:to-orange-950/20 flex items-center justify-center">
        <CalendarDays className="h-10 w-10 text-orange-300 dark:text-orange-700" />
        {event.registrationStatus && (
          <Badge className="absolute top-2 right-2 bg-orange-600 text-white text-xs">
            {event.registrationStatus}
          </Badge>
        )}
        {past && (
          <Badge className="absolute top-2 left-2 bg-muted text-muted-foreground text-xs">
            Past
          </Badge>
        )}
      </div>

      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
            {event.title}
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
          <span>{format(parseISO(event.date), 'MMM d, yyyy')}</span>
        </div>

        {event.location && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
            {event.price === 0 ? 'Free' : `$${event.price}`}
          </span>
          <div className="flex gap-1">
            {showCertificate && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1"
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                <Award className="h-3 w-3" />
                Certificate
              </Button>
            )}
            {onRemoveBookmark && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemoveBookmark()
                }}
                disabled={removing}
              >
                <X className="h-3 w-3 mr-1" />
                Remove
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-950/30">
        <Icon className="h-8 w-8 text-orange-300 dark:text-orange-700" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
    </motion.div>
  )
}

function EventCardSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="h-32 w-full" />
          <CardContent className="p-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
