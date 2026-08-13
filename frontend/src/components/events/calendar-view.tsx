'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, dayjsLocalizer, type View } from 'react-big-calendar'
import dayjs from 'dayjs'
import { CalendarDays } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer = dayjsLocalizer(dayjs)

const categoryColors: Record<string, string> = {
  technology: '#059669',
  business: '#d97706',
  education: '#dc2626',
  social: '#db2777',
  arts: '#7c3aed',
  health: '#0891b2',
  sports: '#ea580c',
  music: '#4f46e5',
  food: '#65a30d',
  community: '#0d9488',
}

interface CalendarEvent {
  id: string
  title: string
  date: string
  endTime?: string | null
  category: string
  type: string
}

interface CalendarViewProps {
  events: CalendarEvent[]
}

const views: View[] = ['month', 'week', 'agenda'] as View[]

const viewLabels: Record<string, string> = {
  month: 'Month',
  week: 'Week',
  agenda: 'Agenda',
}

export function CalendarView({ events }: CalendarViewProps) {
  const router = useRouter()
  const [currentView, setCurrentView] = useState<View>('month')

  const calendarEvents = useMemo(() => {
    return events.map((evt) => ({
      id: evt.id,
      title: evt.title,
      start: new Date(evt.date),
      end: evt.endTime ? new Date(evt.endTime) : new Date(new Date(evt.date).getTime() + 2 * 60 * 60 * 1000),
      resource: evt,
    }))
  }, [events])

  const eventStyleGetter = (event: { resource: CalendarEvent }) => {
    const color = categoryColors[event.resource.category] || '#059669'
    return {
      style: {
        backgroundColor: color,
        borderRadius: '6px',
        border: 'none',
        color: 'white',
        fontSize: '0.75rem',
        padding: '2px 6px',
      },
    }
  }

  const handleSelectEvent = (event: { id: string }) => {
    router.push(`/events/${event.id}`)
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <CalendarDays className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">No events to display</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Events will appear on the calendar once they are published.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-4">
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-orange-600" />
          Calendar View
        </CardTitle>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {views.map((view) => (
            <Button
              key={view}
              variant="ghost"
              size="sm"
              className={cn(
                'h-8 px-3 text-xs font-medium',
                currentView === view &&
                  'bg-background shadow-sm text-foreground'
              )}
              onClick={() => setCurrentView(view)}
            >
              {viewLabels[view]}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="min-h-[500px]" style={{ height: 600 }}>
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            views={views}
            view={currentView}
            onView={setCurrentView}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={handleSelectEvent}
            popup
            selectable={false}
            style={{ height: '100%' }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
