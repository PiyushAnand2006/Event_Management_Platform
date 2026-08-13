'use client'

import { RotateCcw, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface EventFilterBarProps {
  filters: {
    type: string
    category: string
    sort: string
  }
  onFilterChange: (key: string, value: string) => void
  categories: string[]
}

const eventTypes = [
  { value: 'conference', label: 'Conference' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'private_ceremony', label: 'Private Ceremony' },
  { value: 'other', label: 'Other' },
]

const sortOptions = [
  { value: 'date', label: 'Nearest First' },
  { value: 'registered', label: 'Most Registered' },
  { value: 'rating', label: 'Highest Rated' },
]

export function EventFilterBar({
  filters,
  onFilterChange,
  categories,
}: EventFilterBarProps) {
  const hasActiveFilters = filters.type !== '' || filters.category !== '' || filters.sort !== 'date'

  const handleReset = () => {
    onFilterChange('type', '')
    onFilterChange('category', '')
    onFilterChange('sort', 'date')
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
        <SlidersHorizontal className="h-4 w-4" />
        <span className="font-medium hidden sm:inline">Filters:</span>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 w-full sm:w-auto">
        {/* Type Filter */}
        <Select
          value={filters.type || undefined}
          onValueChange={(v) => onFilterChange('type', v)}
        >
          <SelectTrigger className="w-full sm:w-[170px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            {eventTypes.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select
          value={filters.category || undefined}
          onValueChange={(v) => onFilterChange('category', v)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select
          value={filters.sort}
          onValueChange={(v) => onFilterChange('sort', v)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Nearest First" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reset */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="shrink-0 text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset
        </Button>
      )}
    </div>
  )
}
