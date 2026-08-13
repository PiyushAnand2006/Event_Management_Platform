'use client'

import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface EventSearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function EventSearchBar({
  value,
  onChange,
  placeholder = 'Search events...',
}: EventSearchBarProps) {
  const [internal, setInternal] = useState(value)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    setInternal(value)
  }, [value])

  const handleChange = (val: string) => {
    setInternal(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onChange(val)
    }, 300)
  }

  const handleClear = () => {
    setInternal('')
    onChange('')
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        value={internal}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10 h-11 w-full bg-background"
      />
      {internal && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
