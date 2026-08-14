'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Video,
  Share2,
  Heart,
  ArrowRight,
  MapPin,
  Users,
  PlusCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AbstractAiBanner } from '@/components/events/abstract-ai-banner'
import { toast } from 'sonner'

interface EventListItem {
  id: string
  title: string
  description: string
  organizerName: string
  dateStr: string
  timeCategory: 'today' | 'tomorrow' | 'week' | 'weekend' | 'online' | 'all'
  isOnline: boolean
  location: string
  attendeesCount: number
  category: string
  type: string
  price: number
  posterUrl?: string | null
}

type TimeFilter = 'all' | 'today' | 'tomorrow' | 'week' | 'weekend' | 'online'

export function ScheduledEventsSection() {
  const [selectedFilter, setSelectedFilter] = useState<TimeFilter>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [events, setEvents] = useState<EventListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setLoading(true)
    fetch('/api/events?limit=12&sort=date')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data?.events)) {
          const mapped: EventListItem[] = json.data.events.map((e: any, idx: number) => {
            const isOnline =
              e.location?.toLowerCase().includes('online') || e.type === 'seminar'
            return {
              id: e.id,
              title: e.title,
              description: e.description || 'Join this community event and connect with attendees.',
              organizerName: e.organizer?.name ? `by ${e.organizer.name}` : 'by Occasio Community',
              dateStr: new Date(e.date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              }),
              timeCategory: idx === 0 ? 'today' : idx === 1 ? 'tomorrow' : idx % 2 === 0 ? 'week' : 'weekend',
              isOnline,
              location: e.location || (isOnline ? 'Online stream' : 'Venue Location'),
              attendeesCount: e.registeredCount || 0,
              category: e.category || 'Technology',
              type: e.type || 'conference',
              price: e.price || 0,
              posterUrl: e.posterUrl,
            }
          })
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

  const filteredEvents = events.filter((item) => {
    if (selectedFilter === 'online' && !item.isOnline) return false
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false
    return true
  })

  const handleShare = (title: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Event link copied!', { description: title })
    }
  }

  const toggleBookmark = (id: string, title: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setBookmarked((prev) => {
      const next = !prev[id]
      if (next) toast.success('Saved to bookmarks', { description: title })
      else toast.info('Removed from bookmarks')
      return { ...prev, [id]: next }
    })
  }

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border/60">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Explore Schedule
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground mt-1">
            Scheduled events
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Filter upcoming gatherings by format or category.
          </p>
        </div>

        {events.length > 0 && (
          <Link
            href="/events"
            className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
          >
            View all in catalog <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar Navigation / Filter Tabs */}
        <div className="lg:col-span-3 flex flex-col gap-2">
          <div className="bg-card p-3 rounded-2xl border border-border/70 soft-shadow flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedFilter('all')}
              className={`flex items-center justify-between p-3 rounded-xl font-medium text-sm text-left transition-all cursor-pointer ${
                selectedFilter === 'all'
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'text-foreground hover:bg-secondary'
              }`}
            >
              <span>All Events</span>
              <span
                className={`text-xs py-0.5 px-2 rounded-full font-semibold ${
                  selectedFilter === 'all'
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                {events.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedFilter('today')}
              className={`flex items-center justify-between p-3 rounded-xl font-medium text-sm text-left transition-all cursor-pointer ${
                selectedFilter === 'today'
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'text-foreground hover:bg-secondary'
              }`}
            >
              <span>Today</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedFilter('tomorrow')}
              className={`flex items-center justify-between p-3 rounded-xl font-medium text-sm text-left transition-all cursor-pointer ${
                selectedFilter === 'tomorrow'
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'text-foreground hover:bg-secondary'
              }`}
            >
              <span>Tomorrow</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedFilter('week')}
              className={`flex items-center justify-between p-3 rounded-xl font-medium text-sm text-left transition-all cursor-pointer ${
                selectedFilter === 'week'
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'text-foreground hover:bg-secondary'
              }`}
            >
              <span>This week</span>
            </button>

            <div className="h-px bg-border/60 my-1" />

            <button
              type="button"
              onClick={() => setSelectedFilter('online')}
              className={`flex items-center justify-between p-3 rounded-xl font-medium text-sm text-left transition-all cursor-pointer ${
                selectedFilter === 'online'
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'text-foreground hover:bg-secondary'
              }`}
            >
              <span className="flex items-center gap-2">
                <Video className="h-4 w-4 text-primary" />
                Online events
              </span>
              <span
                className={`text-xs py-0.5 px-2 rounded-full font-semibold ${
                  selectedFilter === 'online'
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                {events.filter((e) => e.isOnline).length}
              </span>
            </button>
          </div>

          {/* Category Filter Chips */}
          <div className="bg-card p-4 rounded-2xl border border-border/70 soft-shadow mt-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Categories
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {['All', 'Technology', 'Education', 'Social', 'Hackathon', 'Other'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-amber-500 text-white font-semibold shadow-xs'
                      : 'bg-secondary hover:bg-secondary/80 text-foreground'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Event List Area */}
        <div className="lg:col-span-9 flex flex-col gap-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-card rounded-2xl h-36 border border-border/60 animate-pulse" />
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card rounded-2xl p-10 text-center border border-dashed border-border/80 soft-shadow flex flex-col items-center justify-center"
            >
              <Calendar className="h-10 w-10 text-muted-foreground mb-3 opacity-40" />
              <h3 className="text-lg font-bold text-foreground">No events found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                No published events match your selected criteria. As organizers create events, they will appear here.
              </p>
              <Button
                size="sm"
                className="mt-4 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                asChild
              >
                <Link href="/signup">
                  <PlusCircle className="mr-1.5 h-4 w-4" />
                  <span>Create an Event</span>
                </Link>
              </Button>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredEvents.map((item, index) => {
                const isLiked = bookmarked[item.id]
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.35, delay: index * 0.04 }}
                    className="bg-card rounded-2xl p-4 sm:p-5 border border-border/70 soft-shadow hover:border-primary/40 hover:shadow-lg transition-all duration-300 group"
                  >
                    <Link
                      href={`/events/${item.id}`}
                      className="flex flex-col sm:flex-row gap-5 items-start"
                    >
                      {/* AI Abstract Background Thumbnail */}
                      <div className="w-full sm:w-52 h-40 sm:h-36 rounded-xl overflow-hidden relative shrink-0">
                        <AbstractAiBanner title={item.title} category={item.category} type={item.type} />
                        <div className="absolute top-2.5 left-2.5 bg-background/90 dark:bg-card/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-foreground shadow-xs border border-border/40">
                          {item.isOnline ? (
                            <span className="flex items-center gap-1">
                              <Video className="h-3 w-3 text-primary" /> Online
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> In Person
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right Content */}
                      <div className="flex flex-col flex-1 min-w-0 w-full">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                            {item.dateStr}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary text-foreground">
                            {item.price === 0 ? 'Free' : `$${item.price}`}
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                          {item.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-1">
                          {item.organizerName}
                        </p>

                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>

                        {/* Card Meta & Action Bar */}
                        <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1 font-medium">
                              <Users className="h-3.5 w-3.5 text-primary" />
                              {item.attendeesCount} attendees
                            </span>
                            <span className="hidden sm:flex items-center gap-1 truncate max-w-[180px]">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                              {item.location}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => handleShare(item.title, e)}
                              className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                              aria-label="Share event"
                            >
                              <Share2 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => toggleBookmark(item.id, item.title, e)}
                              className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                              aria-label="Bookmark event"
                            >
                              <Heart
                                className={`h-4 w-4 ${
                                  isLiked ? 'fill-red-500 text-red-500' : ''
                                }`}
                              />
                            </button>
                            <Button
                              size="sm"
                              className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 text-xs ml-1"
                            >
                              RSVP
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          )}

          {/* View More Button */}
          {events.length > 0 && (
            <div className="mt-6 text-center">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full font-semibold px-8 py-5 border-border/80 hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-all cursor-pointer"
                asChild
              >
                <Link href="/events">
                  <span>View all events in catalog</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
