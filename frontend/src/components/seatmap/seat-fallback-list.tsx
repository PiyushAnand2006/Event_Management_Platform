'use client'

import { useState, useMemo, useCallback } from 'react'
import { ArrowUpDown, Armchair } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

type SeatRow = {
  id: string
  label: string
  sectionName: string
  tier: string
  status: string
  positionX: number
  positionY: number
  assignedGuestName?: string
}

type SeatFallbackListProps = {
  seats: SeatRow[]
  onSeatClick: (seatId: string) => void
  onStatusChange: (seatId: string, status: string) => void
  selectedSeatId?: string | null
}

type SortKey = 'label' | 'sectionName' | 'tier' | 'status' | 'positionX' | 'positionY'
type SortDir = 'asc' | 'desc'

/* ─── Sortable Table Head (defined outside component) ─── */
function SortableHead({
  label,
  field,
  sortKey,
  sortDir,
  onSort,
}: {
  label: string
  field: SortKey
  sortKey: SortKey
  sortDir: SortDir
  onSort: (key: SortKey) => void
}) {
  const isActive = sortKey === field
   return (
    <TableHead
      className="cursor-pointer select-none hover:bg-muted/50"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown className={cn('h-3 w-3', isActive ? 'opacity-100' : 'opacity-40')} />
      </div>
    </TableHead>
  )
}

export default function SeatFallbackList({
  seats,
  onSeatClick,
  onStatusChange,
  selectedSeatId,
}: SeatFallbackListProps) {
  const [sortKey, setSortKey] = useState<SortKey>('label')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [search, setSearch] = useState('')

  const toggleSort = useCallback((key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }, [sortKey])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    let list = seats.filter(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        s.sectionName.toLowerCase().includes(q) ||
        s.tier.toLowerCase().includes(q) ||
        s.status.toLowerCase().includes(q) ||
        (s.assignedGuestName && s.assignedGuestName.toLowerCase().includes(q))
    )
    list.sort((a, b) => {
      const aVal = a[sortKey] ?? ''
      const bVal = b[sortKey] ?? ''
      const cmp = typeof aVal === 'number' && typeof bVal === 'number'
        ? aVal - bVal
        : String(aVal).localeCompare(String(bVal))
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [seats, search, sortKey, sortDir])

  const summary = useMemo(() => {
    const total = seats.length
    const occupied = seats.filter((s) => s.status === 'occupied').length
    const blocked = seats.filter((s) => s.status === 'blocked').length
    const unassigned = total - occupied - blocked
    return { total, occupied, blocked, unassigned }
  }, [seats])

  const tierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'vip':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
      case 'reserved':
        return 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const statusBadgeColor = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'
      case 'blocked':
        return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border p-3 text-center">
          <div className="text-2xl font-bold">{summary.total}</div>
          <div className="text-xs text-muted-foreground">Total Seats</div>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{summary.occupied}</div>
          <div className="text-xs text-muted-foreground">Occupied</div>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <div className="text-2xl font-bold text-gray-500">{summary.unassigned}</div>
          <div className="text-xs text-muted-foreground">Available</div>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <div className="text-2xl font-bold text-red-500">{summary.blocked}</div>
          <div className="text-xs text-muted-foreground">Blocked</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Armchair className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          className="h-9 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-orange-400"
          placeholder="Search seats by label, section, tier, or guest name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <ScrollArea className="max-h-[480px]">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHead label="Label" field="label" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortableHead label="Section" field="sectionName" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortableHead label="Tier" field="tier" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortableHead label="Status" field="status" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <TableHead>Position</TableHead>
              <TableHead>Assigned Guest</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No seats found.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((seat) => (
              <TableRow
                key={seat.id}
                className={cn(
                  'cursor-pointer',
                  selectedSeatId === seat.id && 'bg-orange-50 dark:bg-orange-950/20'
                )}
                onClick={() => onSeatClick(seat.id)}
              >
                <TableCell className="font-medium">{seat.label}</TableCell>
                <TableCell>{seat.sectionName}</TableCell>
                <TableCell>
                  <Badge className={cn('text-[10px] h-5', tierBadgeColor(seat.tier))}>
                    {seat.tier}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={seat.status}
                      onValueChange={(val) => onStatusChange(seat.id, val)}
                    >
                      <SelectTrigger className={cn('h-6 w-[100px] text-[11px]', statusBadgeColor(seat.status), 'border-0')}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unoccupied">Unoccupied</SelectItem>
                        <SelectItem value="blocked">Blocked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  ({Math.round(seat.positionX)}, {Math.round(seat.positionY)})
                </TableCell>
                <TableCell className="text-sm">
                  {seat.assignedGuestName || <span className="text-muted-foreground">—</span>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}
