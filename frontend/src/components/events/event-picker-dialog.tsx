'use client'

import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { format, parseISO, isValid } from 'date-fns'
import { ArrowRight, CalendarDays, ListX } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export type EventFeature = 'participants' | 'guests' | 'checkin' | 'live'

const FEATURES: Record<
  EventFeature,
  { label: string; description: string; route: (id: string) => string }
> = {
  participants: {
    label: 'Participants',
    description: 'Pick an event to see its participants, registrations and analytics.',
    route: (id) => `/organizer/events/${id}/analytics`,
  },
  guests: {
    label: 'Guests & Invites',
    description: 'Pick an event to manage its guest list and invitations.',
    route: (id) => `/organizer/events/${id}/guests`,
  },
  checkin: {
    label: 'Check-In',
    description: 'Pick an event to open its check-in scanner.',
    route: (id) => `/checkin/${id}`,
  },
  live: {
    label: 'Live Console',
    description: 'Pick an event to open its live console.',
    route: (id) => `/organizer/events/${id}/live`,
  },
}

type EventOption = {
  id: string
  title: string
  date?: string | null
  status?: string
  registeredCount?: number
  capacity?: number
}

function formatEventDate(date?: string | null) {
  if (!date) return 'No date set'
  const parsed = parseISO(date)
  return isValid(parsed) ? format(parsed, 'MMM d, yyyy') : 'No date set'
}

export function EventPickerDialog({
  feature,
  open,
  onOpenChange,
}: {
  feature: EventFeature | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const meta = feature ? FEATURES[feature] : null

  // Same query key as the My Events page, so the list is fetched once and shared.
  const { data: events = [], isLoading, isError } = useQuery<EventOption[]>({
    queryKey: ['organized-events'],
    enabled: open && !!feature,
    queryFn: async () => {
      const res = await fetch('/api/events?organized=true')
      if (!res.ok) throw new Error('Failed to load events')
      const payload = await res.json()
      const list = payload?.data?.events ?? payload?.events ?? payload
      return Array.isArray(list) ? list : []
    },
  })

  const handleSelect = (id: string) => {
    onOpenChange(false)
    router.push(`${meta?.route(id)}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Choose an event</DialogTitle>
          <DialogDescription>
            {meta?.description ?? 'Select an event to continue.'}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-80 space-y-1.5 overflow-y-auto -mx-1 px-1">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
                <Skeleton className="h-9 w-9 rounded-md" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))
          ) : isError ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Could not load your events. Please try again.
            </p>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <ListX className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">You have no events yet</p>
              <p className="text-xs text-muted-foreground">
                Create an event first, then come back here.
              </p>
            </div>
          ) : (
            events.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => handleSelect(event.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg border border-border/60 p-3 text-left',
                  'transition-colors hover:border-orange-400/60 hover:bg-orange-50/60 dark:hover:bg-orange-950/30'
                )}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-orange-50 dark:bg-orange-950/40">
                  <CalendarDays className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatEventDate(event.date)}
                    {typeof event.registeredCount === 'number' &&
                      ` · ${event.registeredCount}${event.capacity ? `/${event.capacity}` : ''} registered`}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
