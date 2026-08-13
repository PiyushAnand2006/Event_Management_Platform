import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'

// GET: Get seat with assigned guest info
export async function GET(
  request: Request,
  { params }: { params: Promise<{ seatId: string }> }
) {
  try {
    const { seatId } = await params
    const user = await getServerUser()

    const seat = await db.seat.findUnique({
      where: { id: seatId },
      include: {
        section: {
          select: { id: true, name: true },
        },
        assignedGuest: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
            event: {
              select: { id: true, title: true },
            },
          },
        },
      },
    })

    if (!seat) return errorResponse('Seat not found', 404)

    // Access control: owner/admin/co-organizer can see seat details
    if (user) {
      const venue = await db.venue.findUnique({
        where: { id: seat.venueId },
        include: { event: { select: { organizerId: true } } },
      })
      if (venue) {
        const isOwner = user.id === venue.event.organizerId
        const isCoOrganizer = await db.coOrganizer.count({
          where: { eventId: venue.event.id, userId: user.id },
        })
        if (user.role === 'admin' || isOwner || isCoOrganizer) {
          return successResponse(seat)
        }
      }
    }

    // For non-owners, return limited seat info (no assigned guest details)
    return successResponse({
      id: seat.id,
      label: seat.label,
      positionX: seat.positionX,
      positionY: seat.positionY,
      tier: seat.tier,
      status: seat.status,
      section: seat.section,
    })
  } catch (error) {
    console.error('GET /api/venues/seats/[seatId] error:', error)
    return errorResponse('Failed to fetch seat', 500)
  }
}

// PATCH: Update seat properties
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ seatId: string }> }
) {
  try {
    const { seatId } = await params
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const seat = await db.seat.findUnique({
      where: { id: seatId },
      include: {
        venue: { include: { event: { select: { organizerId: true } } } },
      },
    })
    if (!seat) return errorResponse('Seat not found', 404)

    if (user.role !== 'admin' && user.id !== seat.venue.event.organizerId) {
      return errorResponse('Only the event organizer can update seats', 403)
    }

    const body = await request.json()
    const { label, tier, status, positionX, positionY, positionZ, rotation, groupId } = body

    const updateData: Record<string, unknown> = {}

    if (label !== undefined) {
      if (typeof label !== 'string' || !label.trim()) {
        return errorResponse('Seat label must be a non-empty string', 400)
      }
      // Check label uniqueness within venue
      const existing = await db.seat.findFirst({
        where: { venueId: seat.venueId, label: label.trim(), id: { not: seatId } },
      })
      if (existing) return errorResponse('A seat with this label already exists in this venue', 409)
      updateData.label = label.trim()
    }

    const validTiers = ['vip', 'reserved', 'general']
    if (tier !== undefined) {
      if (!validTiers.includes(tier)) return errorResponse('Invalid tier', 400)
      updateData.tier = tier
    }

    const validStatuses = ['unoccupied', 'occupied', 'blocked']
    if (status !== undefined) {
      if (!validStatuses.includes(status)) return errorResponse('Invalid status', 400)
      updateData.status = status
    }

    if (positionX !== undefined) updateData.positionX = parseFloat(positionX) || 0
    if (positionY !== undefined) updateData.positionY = parseFloat(positionY) || 0
    if (positionZ !== undefined) updateData.positionZ = parseFloat(positionZ) || 0
    if (rotation !== undefined) updateData.rotation = parseFloat(rotation) || 0
    if (groupId !== undefined) updateData.groupId = groupId || null

    const updated = await db.seat.update({
      where: { id: seatId },
      data: updateData,
      include: {
        section: { select: { id: true, name: true } },
        assignedGuest: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
        },
      },
    })

    return successResponse(updated)
  } catch (error) {
    console.error('PATCH /api/venues/seats/[seatId] error:', error)
    return errorResponse('Failed to update seat', 500)
  }
}
