'use client'

import { useCallback, useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDays, LayoutGrid, Calendar, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EventCard, EventCardSkeleton, type EventCardData } from '@/components/events/event-card'
import { EventSearchBar } from '@/components/events/event-search-bar'
import { EventFilterBar } from '@/components/events/event-filter-bar'
import { CalendarView } from '@/components/events/calendar-view'

const LIMIT = 12

type ViewMode = 'grid' | 'calendar'

interface EventsResponse {
  success: boolean
  data: {
    events: EventCardData[]
    total: number
    page: number
    limit: number
  }
}

function EventsPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    category: searchParams.get('category') || '',
    sort: searchParams.get('sort') || 'date',
  })
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [events, setEvents] = useState<EventCardData[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>([])
  const [allEvents, setAllEvents] = useState<EventCardData[]>([])

  const totalPages = Math.ceil(total / LIMIT)

  // Sync URL params
  const updateUrl = useCallback(
    (params: Record<string, string>) => {
      const sp = new URLSearchParams(searchParams.toString())
      Object.entries(params).forEach(([k, v]) => {
        if (v) sp.set(k, v)
        else sp.delete(k)
      })
      router.replace(`/events?${sp.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  // Fetch events
  const fetchEvents = useCallback(
    async (p: number) => {
      setLoading(true)
      try {
        const sp = new URLSearchParams()
        if (query) sp.set('q', query)
        if (filters.type) sp.set('type', filters.type)
        if (filters.category) sp.set('category', filters.category)
        sp.set('page', String(p))
        sp.set('limit', String(LIMIT))
        sp.set('sort', filters.sort)

        const res = await fetch(`/api/events?${sp.toString()}`)
        const json: EventsResponse = await res.json()
        if (json.success) {
          setEvents(json.data.events)
          setTotal(json.data.pagination?.total ?? json.data.events.length)
        }
      } catch {
        setEvents([])
        setTotal(0)
      } finally {
        setLoading(false)
      }
    },
    [query, filters]
  )

  // Fetch categories
  useEffect(() => {
    fetch('/api/events/categories')
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setCategories(json.data || [])
      })
      .catch(() => {})
  }, [])

  // Fetch all events for calendar (lightweight)
  useEffect(() => {
    fetch('/api/events?limit=100&sort=date')
      .then((r) => r.json())
      .then((json: EventsResponse) => {
        if (json.success) setAllEvents(json.data.events)
      })
      .catch(() => {})
  }, [])

  // Fetch on filter/search/page change
  useEffect(() => {
    fetchEvents(page)
    updateUrl({
      q: query,
      type: filters.type,
      category: filters.category,
      sort: filters.sort,
      page: String(page),
    })
  }, [query, filters, page, fetchEvents, updateUrl])

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const handleSearch = (value: string) => {
    setQuery(value)
    setPage(1)
  }

  return (
    <div className="flex flex-col">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-orange-600 via-orange-700 to-amber-900 py-16 sm:py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              Discover Events
            </h1>
            <p className="mt-4 text-lg text-orange-100 max-w-2xl mx-auto">
              Find conferences, seminars, hackathons, and more. Explore what&apos;s happening and join events that inspire you.
            </p>
          </motion.div>

          {/* Search Bar in Hero */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 max-w-xl mx-auto"
          >
            <EventSearchBar
              value={query}
              onChange={handleSearch}
              placeholder="Search events by title, category, or location..."
            />
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Bar + View Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="w-full sm:flex-1">
            <EventFilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              categories={categories}
            />
          </div>
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className={
                viewMode === 'grid'
                  ? 'bg-background shadow-sm text-foreground h-8 px-3'
                  : 'h-8 px-3'
              }
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4 mr-1.5" />
              Grid
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={
                viewMode === 'calendar'
                  ? 'bg-background shadow-sm text-foreground h-8 px-3'
                  : 'h-8 px-3'
              }
              onClick={() => setViewMode('calendar')}
            >
              <Calendar className="h-4 w-4 mr-1.5" />
              Calendar
            </Button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {viewMode === 'calendar' ? (
            <motion.div
              key="calendar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CalendarView events={allEvents} />
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Results count */}
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {loading ? (
                    'Loading events...'
                  ) : (
                    <>
                      Showing {events.length} of {total} event{total !== 1 ? 's' : ''}
                    </>
                  )}
                </p>
              </div>

              {/* Grid */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <EventCardSkeleton key={i} />
                  ))}
                </div>
              ) : events.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                    <SearchX className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">No events found</h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-md text-center">
                    Try adjusting your search or filters to find what you&apos;re looking for.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setQuery('')
                      setFilters({ type: '', category: '', sort: 'date' })
                      setPage(1)
                    }}
                  >
                    Clear all filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <EventCard event={event} />
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!loading && totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => {
                      if (totalPages <= 7) return true
                      if (p === 1 || p === totalPages) return true
                      if (Math.abs(p - page) <= 1) return true
                      return false
                    })
                    .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                      if (idx > 0) {
                        const prev = arr[idx - 1]
                        if (p - prev > 1) acc.push('ellipsis')
                      }
                      acc.push(p)
                      return acc
                    }, [])
                    .map((item, idx) =>
                      item === 'ellipsis' ? (
                        <span key={`e${idx}`} className="px-2 text-muted-foreground">
                          ...
                        </span>
                      ) : (
                        <Button
                          key={item}
                          variant={page === item ? 'default' : 'outline'}
                          size="sm"
                          className={page === item ? 'bg-orange-600 hover:bg-orange-700 text-white' : ''}
                          onClick={() => {
                            setPage(item)
                            window.scrollTo({ top: 300, behavior: 'smooth' })
                          }}
                        >
                          {item}
                        </Button>
                      )
                    )}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  )
}

export default function EventsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <Skeleton className="h-8 w-48 mx-auto mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        </div>
      }
    >
      <EventsPageContent />
    </Suspense>
  )
}
