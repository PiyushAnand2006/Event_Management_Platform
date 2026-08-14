'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import {
  PlusCircle,
  Search,
  Edit,
  Users,
  Bell,
  CalendarDays,
  MapPin,
  Filter,
  ListChecks,
  LayoutGrid,
  QrCode,
  MailCheck,
  Store,
  BarChart3,
  Radio,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CSVExportButton } from '@/components/events/csv-export-button'
import { useToast } from '@/hooks/use-toast'

type OrgEvent = {
  id: string
  title: string
  date: string
  category?: string
  status: string
  location?: string
  price: number
  capacity?: number
  registeredCount?: number
  type?: string
}

type Registration = {
  id: string
  user: {
    id: string
    name: string
    email: string
  }
  status: string
  createdAt: string
}

const statusFilterOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'published', label: 'Published' },
  { value: 'pending', label: 'Pending' },
  { value: 'rejected', label: 'Rejected' },
]

const statusBadgeClass: Record<string, string> = {
  published:
    'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
  pending:
    'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
  rejected: '',
}

export default function OrganizerEventsPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [selectedEvent, setSelectedEvent] = useState<OrgEvent | null>(null)
  const pageSize = 10

  const {
    data: allEvents = [],
    isLoading,
  } = useQuery({
    queryKey: ['organized-events'],
    queryFn: async () => {
      const res = await fetch('/api/events?organized=true')
      if (!res.ok) throw new Error('Failed')
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

  const {
    data: registrationsData,
    isLoading: loadingRegs,
  } = useQuery({
    queryKey: ['event-registrations', selectedEvent?.id],
    queryFn: async () => {
      if (!selectedEvent) return { registrations: [], total: 0 }
      const res = await fetch(
        `/api/events/${selectedEvent.id}/registrations?page=1&limit=10`
      )
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    enabled: !!selectedEvent,
  })

  const registrations = registrationsData?.registrations || []

  const filtered = useMemo(() => {
    let list = allEvents
    if (statusFilter !== 'all') {
      list = list.filter((e: OrgEvent) => e.status === statusFilter)
    }
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (e: OrgEvent) =>
          e.title.toLowerCase().includes(q) ||
          (e.category || '').toLowerCase().includes(q) ||
          (e.location || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [allEvents, statusFilter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const remindMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const res = await fetch(`/api/events/${eventId}/remind`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Failed')
    },
    onSuccess: () => {
      toast({ title: 'Reminder sent', description: 'All registrants have been notified.' })
    },
    onError: () => {
      toast({ title: 'Failed', description: 'Could not send reminder.', variant: 'destructive' })
    },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">My Events</h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor all your events.
          </p>
        </div>
        <Button asChild className="bg-orange-600 hover:bg-orange-700 text-white">
          <Link href="/organizer/events/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusFilterOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Events List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-5 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : paginated.length === 0 ? (
        <Card className="border-dashed">
          <div className="py-12 text-center">
            <ListChecks className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-2 text-sm font-medium text-muted-foreground">No events found</p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              {search || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first event to get started'}
            </p>
          </div>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            <AnimatePresence>
              {paginated.map((event: OrgEvent, i: number) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        {/* Icon */}
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-950/30">
                          <CalendarDays className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold truncate">{event.title}</h3>
                            <Badge
                              variant="outline"
                              className={statusBadgeClass[event.status] || ''}
                            >
                              {event.status}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span>{format(parseISO(event.date), 'MMM d, yyyy')}</span>
                            {event.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {event.location}
                              </span>
                            )}
                            <span>
                              {event.registeredCount || 0}/{
                                event.capacity || '∞'
                              }{' '}
                              registered
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/organizer/events/${event.id}/analytics`}>
                              <BarChart3 className="mr-1 h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Analytics</span>
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/organizer/events/${event.id}/seatmap`}>
                              <LayoutGrid className="mr-1 h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Seat Map</span>
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/organizer/events/${event.id}/guests`}>
                              <MailCheck className="mr-1 h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Guests</span>
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/organizer/events/${event.id}/stalls`}>
                              <Store className="mr-1 h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Stalls</span>
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/checkin/${event.id}`}>
                              <QrCode className="mr-1 h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Check-In</span>
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/organizer/events/${event.id}/live`}>
                              <Radio className="mr-1 h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Live</span>
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/organizer/events/${event.id}/edit`}>
                              <Edit className="mr-1 h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Edit</span>
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedEvent(event)}
                          >
                            <Users className="mr-1 h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Registrations</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => remindMutation.mutate(event.id)}
                            disabled={remindMutation.isPending}
                          >
                            <Bell className="mr-1 h-3.5 w-3.5" />
                            Remind
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Registrations Dialog */}
      <Dialog
        open={!!selectedEvent}
        onOpenChange={() => setSelectedEvent(null)}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Registrations — {selectedEvent?.title}</span>
              {selectedEvent && (
                <CSVExportButton
                  eventId={selectedEvent.id}
                  eventName={selectedEvent.title}
                />
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {loadingRegs ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                ))}
              </div>
            ) : registrations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No registrations yet
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((reg: Registration) => (
                    <TableRow key={reg.id}>
                      <TableCell className="font-medium">
                        {reg.user.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {reg.user.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {reg.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(parseISO(reg.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
