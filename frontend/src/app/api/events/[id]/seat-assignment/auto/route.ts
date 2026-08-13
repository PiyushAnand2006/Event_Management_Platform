import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'

const TIER_PRIORITY: Record<string, number> = {
  vip: 0,
  reserved: 1,
  general: 2,
}

/**
 * POST /api/events/[id]/seat-assignment/auto
 * Smart auto-assignment algorithm with group-aware seating.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)

    // Verify event exists and user is organizer/co-organizer/admin
    const event = await db.event.findUnique({ where: { id } })
    if (!event) return errorResponse('Event not found', 404)

    if (user.role !== 'admin' && user.id !== event.organizerId) {
      const isCoOrganizer = await db.coOrganizer.count({
        where: { eventId: id, userId: user.id },
      })
      if (!isCoOrganizer) return errorResponse('Forbidden', 403)
    }

    // Fetch venue with sections and all seats
    const venue = await db.venue.findUnique({
      where: { eventId: id },
      include: {
        sections: {
          include: {
            seats: {
              orderBy: [{ positionY: 'asc' }],
            },
          },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        },
        seats: {
          orderBy: [{ positionY: 'asc' }],
        },
      },
    })

    if (!venue) return errorResponse('Venue not found for this event', 404)

    // Fetch unassigned registrations (registered or attended, no seat yet)
    const registrations = await db.registration.findMany({
      where: {
        eventId: id,
        status: { in: ['registered', 'attended'] },
        seatId: null,
      },
    })

    if (registrations.length === 0) {
      return successResponse({ assigned: 0, unassigned: 0, totalGuests: 0 })
    }

    // Sort registrations by tier priority
    const sortedRegistrations = [...registrations].sort(
      (a, b) => (TIER_PRIORITY[a.tier] ?? 2) - (TIER_PRIORITY[b.tier] ?? 2)
    )

    // Collect all available seats from sections
    const allSeats = venue.sections.flatMap((section) => section.seats)

    // Filter to available (unoccupied + not locked) and sort by tier then positionY
    const availableSeats = allSeats
      .filter(
        (seat) => seat.status === 'unoccupied' && seat.isLocked === false && !seat.assignedGuestId
      )
      .sort((a, b) => {
        const tierDiff = (TIER_PRIORITY[a.tier] ?? 2) - (TIER_PRIORITY[b.tier] ?? 2)
        if (tierDiff !== 0) return tierDiff
        return a.positionY - b.positionY
      })

    // Build a seat lookup by sectionId for group handling
    const seatsBySection = new Map<string, typeof availableSeats>()
    for (const seat of availableSeats) {
      const sectionSeats = seatsBySection.get(seat.sectionId) || []
      sectionSeats.push(seat)
      seatsBySection.set(seat.sectionId, sectionSeats)
    }

    // Track assigned seat IDs and used registration IDs
    const assignedSeatIds = new Set<string>()
    const assignmentPairs: { registrationId: string; seatId: string }[] = []

    // Separate group and individual registrations
    const groupRegistrations = sortedRegistrations.filter((r) => r.groupId)
    const individualRegistrations = sortedRegistrations.filter((r) => !r.groupId)

    // --- Group handling ---
    // Group registrations by groupId, process each group
    const groupedByGroupId = new Map<string, typeof groupRegistrations>()
    for (const reg of groupRegistrations) {
      const list = groupedByGroupId.get(reg.groupId!) || []
      list.push(reg)
      groupedByGroupId.set(reg.groupId!, list)
    }

    // Sort groups by their highest-priority tier member
    const groupEntries = [...groupedByGroupId.entries()].sort((a, b) => {
      const aMinTier = Math.min(...a[1].map((r) => TIER_PRIORITY[r.tier] ?? 2))
      const bMinTier = Math.min(...b[1].map((r) => TIER_PRIORITY[r.tier] ?? 2))
      return aMinTier - bMinTier
    })

    for (const [, groupRegs] of groupEntries) {
      const groupSize = groupRegs.length

      // Try to find a section with enough consecutive available seats
      // Sort sections by their best matching tier availability
      const sectionCandidates = [...seatsBySection.entries()].sort(
        (a, b) => {
          const aBest = Math.min(
            ...a[1]
              .filter((s) => !assignedSeatIds.has(s.id))
              .map((s) => TIER_PRIORITY[s.tier] ?? 2)
          )
          const bBest = Math.min(
            ...b[1]
              .filter((s) => !assignedSeatIds.has(s.id))
              .map((s) => TIER_PRIORITY[s.tier] ?? 2)
          )
          return aBest - bBest
        }
      )

      let groupAssigned = false
      for (const [, sectionSeats] of sectionCandidates) {
        const freeInSection = sectionSeats.filter((s) => !assignedSeatIds.has(s.id))
        if (freeInSection.length < groupSize) continue

        // Sort group regs by tier priority, then match with available seats in section
        const sortedGroup = [...groupRegs].sort(
          (a, b) => (TIER_PRIORITY[a.tier] ?? 2) - (TIER_PRIORITY[b.tier] ?? 2)
        )
        const sortedSectionSeats = [...freeInSection].sort((a, b) => {
          const tierDiff = (TIER_PRIORITY[a.tier] ?? 2) - (TIER_PRIORITY[b.tier] ?? 2)
          if (tierDiff !== 0) return tierDiff
          return a.positionY - b.positionY
        })

        let allMatched = true
        const tempPairs: { registrationId: string; seatId: string }[] = []
        const tempUsedSeats = new Set<string>()

        for (const reg of sortedGroup) {
          const regTier = TIER_PRIORITY[reg.tier] ?? 2
          // Try to find same-tier seat first, then fallback
          let matchedSeat = sortedSectionSeats.find(
            (s) =>
              !assignedSeatIds.has(s.id) &&
              !tempUsedSeats.has(s.id) &&
              TIER_PRIORITY[s.tier] === regTier
          )
          if (!matchedSeat) {
            // Fallback: next available tier
            matchedSeat = sortedSectionSeats.find(
              (s) =>
                !assignedSeatIds.has(s.id) && !tempUsedSeats.has(s.id)
            )
          }
          if (matchedSeat) {
            tempPairs.push({ registrationId: reg.id, seatId: matchedSeat.id })
            tempUsedSeats.add(matchedSeat.id)
          } else {
            allMatched = false
            break
          }
        }

        if (allMatched) {
          for (const pair of tempPairs) {
            assignmentPairs.push(pair)
            assignedSeatIds.add(pair.seatId)
          }
          groupAssigned = true
          break
        }
      }

      // If group couldn't be seated together, fall through to individual handling
      if (!groupAssigned) {
        // Mark remaining unseated group members for individual assignment
        for (const reg of groupRegs) {
          individualRegistrations.push(reg)
        }
      }
    }

    // --- Individual handling ---
    for (const reg of individualRegistrations) {
      if (assignedSeatIds.size >= availableSeats.length) break

      const regTier = TIER_PRIORITY[reg.tier] ?? 2

      // Try to find same-tier seat first
      let matchedSeat = availableSeats.find(
        (s) => !assignedSeatIds.has(s.id) && TIER_PRIORITY[s.tier] === regTier
      )
      // Fallback: next available tier
      if (!matchedSeat) {
        matchedSeat = availableSeats.find((s) => !assignedSeatIds.has(s.id))
      }

      if (matchedSeat) {
        assignmentPairs.push({ registrationId: reg.id, seatId: matchedSeat.id })
        assignedSeatIds.add(matchedSeat.id)
      }
    }

    // Execute all assignments in a transaction (individual updates for SQLite compat)
    if (assignmentPairs.length > 0) {
      await db.$transaction(
        assignmentPairs.map(({ registrationId, seatId }) =>
          db.seat.update({
            where: { id: seatId },
            data: {
              status: 'occupied',
              assignedGuestId: registrationId,
            },
          })
        )
          .concat(
            assignmentPairs.map(({ registrationId, seatId }) =>
              db.registration.update({
                where: { id: registrationId },
                data: { seatId },
              })
            )
          )
      )
    }

    const totalGuests = registrations.length
    const assigned = assignmentPairs.length
    const unassigned = totalGuests - assigned

    return successResponse({ assigned, unassigned, totalGuests })
  } catch (error) {
    console.error('POST /api/events/[id]/seat-assignment/auto error:', error)
    return errorResponse('Failed to auto-assign seats', 500)
  }
}
