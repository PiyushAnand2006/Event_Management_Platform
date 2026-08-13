import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'

// POST: Bulk create/update seats. Deletes existing seats per section, then creates new batch.
export async function POST(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const body = await request.json()
    const { seats } = body

    if (!Array.isArray(seats) || seats.length === 0) {
      return errorResponse('Seats array is required and must not be empty', 400)
    }

    if (seats.length > 500) {
      return errorResponse('Maximum 500 seats per bulk operation', 400)
    }

    // Validate seat data structure
    for (const seat of seats) {
      if (!seat.label || typeof seat.label !== 'string') {
        return errorResponse('Each seat must have a valid label', 400)
      }
      if (!seat.sectionId || typeof seat.sectionId !== 'string') {
        return errorResponse('Each seat must have a sectionId', 400)
      }
      if (seat.positionX === undefined || seat.positionY === undefined) {
        return errorResponse('Each seat must have positionX and positionY', 400)
      }
      const validTiers = ['vip', 'reserved', 'general']
      if (!validTiers.includes(seat.tier || 'general')) {
        return errorResponse(`Invalid tier: ${seat.tier}`, 400)
      }
    }

    // Determine venue from the first seat's section
    const firstSection = await db.venueSection.findUnique({
      where: { id: seats[0].sectionId },
      include: { venue: { include: { event: { select: { organizerId: true } } } } },
    })
    if (!firstSection) return errorResponse('Section not found', 404)

    if (user.role !== 'admin' && user.id !== firstSection.venue.event.organizerId) {
      return errorResponse('Only the event organizer can update seats', 403)
    }

    const venueId = firstSection.venueId

    // Transaction: delete existing seats per section, then create new batch
    const result = await db.$transaction(async (tx) => {
      // Group seats by sectionId
      const sectionIds = new Set(seats.map((s: { sectionId: string }) => s.sectionId))

      // Verify all sections belong to the same venue
      const sections = await tx.venueSection.findMany({
        where: { id: { in: Array.from(sectionIds) }, venueId },
      })
      if (sections.length !== sectionIds.size) {
        throw new Error('Some sections do not belong to this venue')
      }

      // Delete existing seats for each section
      for (const secId of sectionIds) {
        await tx.seat.deleteMany({
          where: { sectionId: secId, venueId },
        })
      }

      // Check for label uniqueness within the venue
      const existingLabels = await tx.seat.findMany({
        where: { venueId },
        select: { label: true },
      })
      const existingLabelSet = new Set(existingLabels.map((s) => s.label))

      // Create new seats
      const createdSeats: Array<unknown> = []
      for (const seatData of seats) {
        // Ensure unique labels within venue - skip duplicates
        if (existingLabelSet.has(seatData.label)) {
          continue
        }
        existingLabelSet.add(seatData.label)

        const seat = await tx.seat.create({
          data: {
            venueId,
            sectionId: seatData.sectionId,
            label: seatData.label,
            positionX: parseFloat(seatData.positionX) || 0,
            positionY: parseFloat(seatData.positionY) || 0,
            positionZ: seatData.positionZ !== undefined ? parseFloat(seatData.positionZ) : 0,
            rotation: seatData.rotation !== undefined ? parseFloat(seatData.rotation) : 0,
            tier: seatData.tier || 'general',
            status: seatData.status || 'unoccupied',
            groupId: seatData.groupId || null,
          },
        })
        createdSeats.push(seat)
      }

      return { count: createdSeats.length }
    })

    return successResponse(result)
  } catch (error) {
    console.error('POST /api/venues/seats error:', error)
    return errorResponse('Failed to update seats', 500)
  }
}
