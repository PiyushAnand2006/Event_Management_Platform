'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Search, Armchair, AlertCircle } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

interface GroupAssignmentViewProps {
  eventId: string
  venueId: string
}

interface SeatData {
  id: string
  label: string
  sectionId: string
  tier: string
  status: string
  assignedGuestId: string | null
  groupId: string | null
  assignedGuest?: {
    id: string
    userId: string
    eventId: string
    status: string
    user?: { id: string; name: string; email: string }
  }
  section?: {
    id: string
    name: string
  }
}

interface VenueData {
  id: string
  name: string
  sections: {
    id: string
    name: string
    seats: SeatData[]
  }[]
  seats: SeatData[]
}

interface GroupMember {
  name: string
  seatLabel: string | null
  sectionName: string | null
  tier: string
  seatId: string | null
  registrationId: string
}

interface GroupInfo {
  groupId: string
  groupName: string
  members: GroupMember[]
  assignedCount: number
  totalCount: number
}

export default function GroupAssignmentView({ eventId, venueId, open, onOpenChange }: GroupAssignmentViewProps & { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [venueData, setVenueData] = useState<VenueData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  async function fetchVenueData() {
    setLoading(true)
    try {
      const res = await fetch(`/api/events/${eventId}/venue`)
      const json = await res.json()
      if (json.success && json.data) {
        setVenueData(json.data as VenueData)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchVenueData()
      setSearchQuery('')
    }
  }, [open, eventId])

  // Build groups from seats that have assigned guests with groupId
  // Also include registrations without seats that have groupId
  const groups = useMemo(() => {
    if (!venueData) return []

    const groupMap = new Map<string, GroupInfo>()

    // From seats with assigned guests
    const allSeats = venueData.seats || []
    for (const seat of allSeats) {
      const guest = seat.assignedGuest
      if (!guest) continue

      const guestName = guest.user?.name || `Guest ${guest.userId.slice(0, 6)}`
      const sectionName = seat.section?.name || ''

      // Check if this seat's guest has a group via the assigned guest's registration
      // We'll also check seat.groupId as a fallback
      const gId = seat.groupId || ''
      if (!gId) continue

      const member: GroupMember = {
        name: guestName,
        seatLabel: seat.label,
        sectionName,
        tier: seat.tier,
        seatId: seat.id,
        registrationId: guest.id,
      }

      const existing = groupMap.get(gId)
      if (existing) {
        existing.members.push(member)
        existing.assignedCount++
      } else {
        groupMap.set(gId, {
          groupId: gId,
          groupName: gId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          members: [member],
          assignedCount: 1,
          totalCount: 1,
        })
      }
    }

    return Array.from(groupMap.values())
  }, [venueData])

  // Filter groups/members by search
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups
    const q = searchQuery.toLowerCase()
    return groups
      .map((g) => {
        const filteredMembers = g.members.filter(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.seatLabel?.toLowerCase().includes(q) ||
            g.groupName.toLowerCase().includes(q)
        )
        if (filteredMembers.length > 0 || g.groupName.toLowerCase().includes(q)) {
          return { ...g, members: g.groupName.toLowerCase().includes(q) ? g.members : filteredMembers }
        }
        return null
      })
      .filter((g): g is GroupInfo => g !== null)
  }, [groups, searchQuery])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[420px] p-0 flex flex-col">
        <SheetHeader className="px-4 py-3 border-b shrink-0">
          <SheetTitle className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            Group Assignments
          </SheetTitle>
        </SheetHeader>

        {/* Search */}
        <div className="px-4 py-2 border-b shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search groups or members..."
              className="h-8 text-sm pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {loading && (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-lg" />
                ))}
              </div>
            )}

            {!loading && filteredGroups.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-3 mb-3">
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">No groups found</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">
                  {searchQuery
                    ? 'No groups or members match your search.'
                    : 'Assign group IDs to registrations to see grouped seating here.'}
                </p>
              </div>
            )}

            <AnimatePresence>
              {filteredGroups.map((group, idx) => (
                <motion.div
                  key={group.groupId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                  className="rounded-lg border p-4 space-y-3"
                >
                  {/* Group header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      <span className="text-sm font-semibold">{group.groupName}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        group.assignedCount === group.totalCount
                          ? 'text-[10px] h-5 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800'
                          : 'text-[10px] h-5 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                      }
                    >
                      {group.assignedCount}/{group.totalCount} seated
                    </Badge>
                  </div>

                  {/* Member list */}
                  <div className="space-y-1.5">
                    {group.members.map((member) => {
                      const isAssigned = !!member.seatId
                      return (
                        <div
                          key={member.registrationId}
                          className={`flex items-center justify-between rounded-md px-2.5 py-1.5 text-sm ${
                            isAssigned
                              ? 'bg-orange-50/50 dark:bg-orange-950/20'
                              : 'bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/50'
                          }`}
                        >
                          <span className="text-sm truncate mr-2">{member.name}</span>
                          {isAssigned ? (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Badge variant="outline" className="text-[10px] h-5 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800 gap-0.5">
                                <Armchair className="h-2.5 w-2.5" />
                                {member.seatLabel}
                              </Badge>
                              {member.sectionName && (
                                <span className="text-[10px] text-muted-foreground hidden sm:inline">
                                  {member.sectionName}
                                </span>
                              )}
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-[10px] h-5 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 shrink-0">
                              Unassigned
                            </Badge>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
