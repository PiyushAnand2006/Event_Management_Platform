'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, UserCheck, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type GuestResult = {
  userId: string
  name: string
  email: string
  status: string
  seatLabel?: string
  tier?: string
}

type ManualSearchPanelProps = {
  eventId: string
  onCheckIn: (userId: string) => void
}

const STATUS_VARIANT: Record<string, string> = {
  issued: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  opened:
    'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  checked_in:
    'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  revoked: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
}

export default function ManualSearchPanel({
  eventId,
  onCheckIn,
}: ManualSearchPanelProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GuestResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const searchGuests = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setResults([])
        setShowDropdown(false)
        return
      }

      setLoading(true)
      try {
        const params = new URLSearchParams({
          eventId,
          query: searchQuery,
        })
        const res = await fetch(`/api/checkin/search?${params}`)
        if (res.ok) {
          const data = await res.json()
          setResults(Array.isArray(data) ? data : data.guests ?? [])
          setShowDropdown(true)
        } else {
          setResults([])
          setShowDropdown(false)
        }
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    },
    [eventId]
  )

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      searchGuests(query)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, searchGuests])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleCheckIn(userId: string) {
    onCheckIn(userId)
    setShowDropdown(false)
  }

  return (
    <div ref={panelRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 pr-4"
          onFocus={() => {
            if (results.length > 0) setShowDropdown(true)
          }}
        />
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-lg border bg-popover shadow-md p-3 space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-3/4" />
        </div>
      )}

      {/* Results dropdown */}
      {showDropdown && !loading && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-lg border bg-popover shadow-md overflow-hidden">
          <ScrollArea className="max-h-72">
            {results.map((guest) => (
              <div
                key={guest.userId}
                className="flex items-center justify-between gap-2 px-3 py-2.5 hover:bg-accent/50 transition-colors border-b last:border-b-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {guest.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {guest.email}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Badge
                      variant="secondary"
                      className={cn(
                        'text-[10px] px-1.5 py-0 h-5',
                        STATUS_VARIANT[guest.status] || STATUS_VARIANT.issued
                      )}
                    >
                      {guest.status.replace(/_/g, ' ')}
                    </Badge>
                    {guest.seatLabel && (
                      <span className="text-[10px] text-muted-foreground">
                        {guest.seatLabel}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-shrink-0 h-8 text-xs gap-1.5 text-orange-700 border-orange-300 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-800 dark:hover:bg-orange-950/40"
                  onClick={() => handleCheckIn(guest.userId)}
                  disabled={guest.status === 'checked_in'}
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  {guest.status === 'checked_in' ? 'Done' : 'Check In'}
                </Button>
              </div>
            ))}
          </ScrollArea>
        </div>
      )}

      {/* No results */}
      {showDropdown && !loading && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-lg border bg-popover shadow-md p-4 text-center">
          <p className="text-sm text-muted-foreground">No guests found</p>
        </div>
      )}
    </div>
  )
}
