'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Heart,
  Video,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  PlusCircle,
  CalendarDays,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AbstractAiBanner } from '@/components/events/abstract-ai-banner'
import { toast } from 'sonner'

interface EventItem {
  id: string
  title: string
  organizerName: string
  dateStr: string
  isOnline: boolean
  attendeesCount: number
  category: string
  type: string
  location?: string
  price?: number
  posterUrl?: string | null
}

export function ScheduledForYouSection() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({})
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoading(true)
    fetch('/api/events?limit=8&sort=date')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data?.events)) {
          const mapped: EventItem[] = json.data.events.map((e: any, idx: number) => ({
            id: e.id,
            title: e.title,
            organizerName: e.organizer?.name ? `by ${e.organizer.name}` : 'by Occasio Community',
            dateStr: new Date(e.date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            }),
            isOnline: e.location?.toLowerCase().includes('online') || e.type === 'seminar',
            attendeesCount: e.registeredCount || 0,
            category: e.category || 'Technology',
            type: e.type || 'conference',
            location: e.location,
            price: e.price,
            posterUrl: e.posterUrl,
          }))
          setEvents(mapped)
        }
      })
      .catch(() => {
        setEvents([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const toggleBookmark = (id: string, title: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setBookmarked((prev) => {
      const next = !prev[id]
      if (next) {
        toast.success('Saved to bookmarks', { description: title })
      } else {
        toast.info('Removed from bookmarks')
      }
      return { ...prev, [id]: next }
    })
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary mb-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Community Events</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
            Scheduled for you
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Browse published events created by organizers on Occasio.
          </p>
        </div>

        {events.length > 0 && (
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="hidden sm:flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll('left')}
                className="h-9 w-9 rounded-full border-border/80 text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll('right')}
                className="h-9 w-9 rounded-full border-border/80 text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Link
              href="/events"
              className="flex items-center text-sm font-semibold text-primary hover:text-primary/80 transition-colors group ml-2"
            >
              <span>Browse all</span>
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-2xl h-80 border border-border/60 animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        /* Empty State: No Published Events */
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl p-10 sm:p-14 text-center border border-dashed border-border/80 soft-shadow max-w-3xl mx-auto flex flex-col items-center justify-center"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
            <CalendarDays className="h-8 w-8" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
            No Published Events Yet
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed">
            As an organizer logs in and creates events, they will appear here with dynamic AI generated abstract banners. Be the first to publish an event!
          </p>
          <Button
            size="lg"
            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 shadow-sm transition-transform active:scale-95"
            asChild
          >
            <Link href="/signup">
              <PlusCircle className="mr-2 h-5 w-5" />
              <span>Create an Event</span>
            </Link>
          </Button>
        </motion.div>
      ) : (
        /* Snap-Scrollable Horizontal Carousel */
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-6 pb-6 pt-2 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory"
        >
          {events.map((event, idx) => {
            const isLiked = bookmarked[event.id]
            const avatarLetters = ['A', 'J', 'M', 'S', 'R', 'T']
            const avatarColors = [
              'bg-orange-500',
              'bg-amber-500',
              'bg-purple-600',
              'bg-rose-500',
              'bg-emerald-600',
            ]

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="min-w-[280px] sm:min-w-[340px] md:min-w-[370px] max-w-[370px] bg-card rounded-2xl overflow-hidden soft-shadow border border-border/70 group flex flex-col shrink-0 snap-start transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-primary/30"
              >
                <Link href={`/events/${event.id}`} className="flex flex-col h-full">
                  {/* AI Generated Abstract Background Banner */}
                  <div className="h-48 sm:h-52 relative overflow-hidden">
                    <AbstractAiBanner title={event.title} category={event.category} type={event.type} />

                    {/* Badges Overlay */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-background/90 dark:bg-card/90 backdrop-blur-md px-3 py-1 rounded-full shadow-xs border border-border/40">
                      {event.isOnline ? (
                        <>
                          <Video className="h-3.5 w-3.5 text-primary" />
                          <span className="text-xs font-semibold text-foreground">Online</span>
                        </>
                      ) : (
                        <>
                          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                          <span className="text-xs font-semibold text-foreground">In Person</span>
                        </>
                      )}
                    </div>

                    {/* Bookmark Button */}
                    <button
                      type="button"
                      onClick={(e) => toggleBookmark(event.id, event.title, e)}
                      className="absolute top-3 right-3 p-2 bg-background/90 dark:bg-card/90 hover:bg-background rounded-full text-muted-foreground hover:text-red-500 transition-all backdrop-blur-md shadow-xs border border-border/40 cursor-pointer"
                      aria-label="Bookmark event"
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          isLiked ? 'fill-red-500 text-red-500' : 'text-foreground'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Event Details */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        {event.dateStr}
                      </span>
                      {event.price !== undefined && (
                        <span className="text-xs font-semibold text-muted-foreground">
                          {event.price === 0 ? 'Free' : `$${event.price}`}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-foreground mb-1.5 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {event.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-muted-foreground mb-4 line-clamp-1">
                      {event.organizerName}
                    </p>

                    <div className="mt-auto pt-3 border-t border-border/40 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {avatarLetters.slice(0, 3).map((letter, i) => (
                            <div
                              key={i}
                              className={`w-6 h-6 rounded-full ${avatarColors[i]} border-2 border-card flex items-center justify-center text-[10px] font-bold text-white shadow-xs`}
                            >
                              {letter}
                            </div>
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">
                          {event.attendeesCount} attendees
                        </span>
                      </div>

                      <div className="flex items-center text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>View</span>
                        <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}
    </section>
  )
}
