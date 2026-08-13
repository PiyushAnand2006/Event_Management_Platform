'use client'

import React, { useState, useMemo } from 'react'
import { Users, Armchair, Search, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

type SeatAssignmentPanelProps = {
  registrations: Array<{
    id: string
    userId: string
    userName: string
    status: string
    seatId?: string
  }>
  seats: Array<{
    id: string
    label: string
    sectionName: string
    tier: string
    status: string
    assignedGuestId?: string
  }>
  onAssign: (registrationId: string, seatId: string) => void
  onUnassign: (seatId: string) => void
  selectedSeatId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function SeatAssignmentPanel({
  registrations,
  seats,
  onAssign,
  onUnassign,
  selectedSeatId,
  open,
  onOpenChange,
}: SeatAssignmentPanelProps) {
  const [guestSearch, setGuestSearch] = useState('')
  const [seatSearch, setSeatSearch] = useState('')
  const [loading, setLoading] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState(selectedSeatId ? 'seats' : 'guests')

  const availableSeats = useMemo(
    () => seats.filter((s) => s.status === 'unoccupied'),
    [seats]
  )

  const unassignedGuests = useMemo(
    () => registrations.filter((r) => !r.seatId && r.status === 'registered'),
    [registrations]
  )

  const filteredGuests = useMemo(() => {
    const q = guestSearch.toLowerCase()
    return registrations.filter(
      (r) =>
        r.userName.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q)
    )
  }, [registrations, guestSearch])

  const filteredSeats = useMemo(() => {
    const q = seatSearch.toLowerCase()
    return seats.filter(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        s.sectionName.toLowerCase().includes(q) ||
        s.tier.toLowerCase().includes(q)
    )
  }, [seats, seatSearch])

  async function handleAssign(registrationId: string, seatId: string) {
    setLoading(registrationId)
    try {
      onAssign(registrationId, seatId)
      toast({ title: 'Seat assigned', description: 'Guest has been assigned to the seat.' })
    } catch {
      toast({ title: 'Error', description: 'Failed to assign seat', variant: 'destructive' })
    } finally {
      setLoading(null)
    }
  }

  async function handleUnassign(seatId: string) {
    setLoading(seatId)
    try {
      onUnassign(seatId)
      toast({ title: 'Seat unassigned', description: 'Guest has been unassigned from the seat.' })
    } catch {
      toast({ title: 'Error', description: 'Failed to unassign seat', variant: 'destructive' })
    } finally {
      setLoading(null)
    }
  }

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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[420px] p-0 flex flex-col">
        <SheetHeader className="px-4 py-3 border-b shrink-0">
          <SheetTitle className="text-base">Seat Assignments</SheetTitle>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <div className="px-4 pt-3 shrink-0">
            <TabsList className="w-full">
              <TabsTrigger value="guests" className="flex-1 gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Guests
                <Badge variant="secondary" className="ml-1 h-5 text-[10px]">
                  {registrations.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="seats" className="flex-1 gap-1.5">
                <Armchair className="h-3.5 w-3.5" />
                Seats
                <Badge variant="secondary" className="ml-1 h-5 text-[10px]">
                  {seats.length}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Guests Tab */}
          <TabsContent value="guests" className="flex-1 min-h-0 mt-0 px-4 pb-4">
            <div className="relative mb-3 mt-3">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                className="h-8 pl-8 text-sm"
                placeholder="Search guests..."
                value={guestSearch}
                onChange={(e) => setGuestSearch(e.target.value)}
              />
            </div>
            <ScrollArea className="h-[calc(100vh-18rem)]">
              <div className="space-y-2">
                {filteredGuests.length === 0 && (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    {guestSearch ? 'No guests match your search.' : 'No unassigned guests.'}
                  </div>
                )}
                {filteredGuests.map((reg) => {
                  const assignedSeat = reg.seatId
                    ? seats.find((s) => s.id === reg.seatId)
                    : null
                  return (
                    <div
                      key={reg.id}
                      className="rounded-lg border p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate mr-2">{reg.userName}</span>
                        {assignedSeat ? (
                          <Badge variant="outline" className="text-[10px] h-5 shrink-0">
                            {assignedSeat.label}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] h-5 shrink-0">
                            Unassigned
                          </Badge>
                        )}
                      </div>
                      {assignedSeat ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {assignedSeat.sectionName} &middot; {assignedSeat.tier}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 text-[11px] ml-auto text-destructive hover:text-destructive"
                            onClick={() => handleUnassign(assignedSeat.id)}
                            disabled={loading === assignedSeat.id}
                          >
                            {loading === assignedSeat.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <X className="h-3 w-3" />
                            )}
                            Unassign
                          </Button>
                        </div>
                      ) : (
                        <Select
                          onValueChange={(val) => handleAssign(reg.id, val)}
                        >
                          <SelectTrigger className="h-7 text-xs">
                            <SelectValue placeholder="Assign to seat..." />
                          </SelectTrigger>
                          <SelectContent>
                            {availableSeats.length === 0 && (
                              <SelectItem value="_none" disabled>
                                No available seats
                              </SelectItem>
                            )}
                            {availableSeats.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.label} ({s.sectionName})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Seats Tab */}
          <TabsContent value="seats" className="flex-1 min-h-0 mt-0 px-4 pb-4">
            <div className="relative mb-3 mt-3">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                className="h-8 pl-8 text-sm"
                placeholder="Search seats..."
                value={seatSearch}
                onChange={(e) => setSeatSearch(e.target.value)}
              />
            </div>
            <ScrollArea className="h-[calc(100vh-18rem)]">
              <div className="space-y-2">
                {filteredSeats.length === 0 && (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    {seatSearch ? 'No seats match your search.' : 'No seats yet.'}
                  </div>
                )}
                {filteredSeats.map((seat) => {
                  const assignedReg = seat.assignedGuestId
                    ? registrations.find((r) => r.id === seat.assignedGuestId)
                    : null
                  return (
                    <div
                      key={seat.id}
                      className={cn(
                        'rounded-lg border p-3 space-y-2 transition-colors',
                        selectedSeatId === seat.id && 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{seat.label}</span>
                        <div className="flex items-center gap-1.5">
                          <Badge className={cn('text-[10px] h-5', tierBadgeColor(seat.tier))}>
                            {seat.tier}
                          </Badge>
                          <Badge
                            variant={seat.status === 'blocked' ? 'destructive' : 'secondary'}
                            className="text-[10px] h-5"
                          >
                            {seat.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">{seat.sectionName}</div>
                      {assignedReg ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">{assignedReg.userName}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 text-[11px] ml-auto text-destructive hover:text-destructive"
                            onClick={() => handleUnassign(seat.id)}
                            disabled={loading === seat.id}
                          >
                            {loading === seat.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <X className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      ) : seat.status !== 'blocked' ? (
                        <Select
                          onValueChange={(val) => handleAssign(val, seat.id)}
                        >
                          <SelectTrigger className="h-7 text-xs">
                            <SelectValue placeholder="Assign guest..." />
                          </SelectTrigger>
                          <SelectContent>
                            {unassignedGuests.length === 0 && (
                              <SelectItem value="_none" disabled>
                                No unassigned guests
                              </SelectItem>
                            )}
                            {unassignedGuests.map((r) => (
                              <SelectItem key={r.id} value={r.id}>
                                {r.userName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
