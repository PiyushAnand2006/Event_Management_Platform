'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Search, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type SearchGuestFlyToProps = {
  registrations: Array<{
    userId: string
    userName: string
    seatId?: string
    seat?: { id: string; label: string; positionX: number; positionY: number; positionZ: number }
  }>
  onFlyTo: (seatId: string) => void
}

export default function SearchGuestFlyTo({ registrations, onFlyTo }: SearchGuestFlyToProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered = React.useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return registrations.filter(
      (r) =>
        r.userName.toLowerCase().includes(q) &&
        r.seatId
    )
  }, [query, registrations])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(seatId: string) {
    onFlyTo(seatId)
    setIsOpen(false)
    setQuery('')
  }

  return (
    <div ref={containerRef} className="relative w-64">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
      <Input
        placeholder="Search guest..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        className="pl-8 h-8 text-xs"
      />

      {isOpen && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-md border bg-white dark:bg-gray-900 shadow-lg max-h-48 overflow-y-auto">
          {filtered.map((r) => (
            <button
              key={r.userId}
              type="button"
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
              )}
              onClick={() => handleSelect(r.seatId!)}
            >
              <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="truncate font-medium">{r.userName}</span>
              {r.seat && (
                <span className="ml-auto text-muted-foreground shrink-0">{r.seat.label}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {isOpen && query.trim() && filtered.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-md border bg-white dark:bg-gray-900 shadow-lg px-3 py-2 text-xs text-muted-foreground">
          No guests found
        </div>
      )}
    </div>
  )
}
