import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'

/**
 * POST /api/events/[id]/seat-assignment/clear
 * Clear all seat assignments for an event.
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

    // Find venue for the event
    const venue = await db.venue.findUnique({ where: { eventId: id } })
    if (!venue) return errorResponse('Venue not found for this event', 404)

    // Fetch all occupied seats and registrations with seat assignments
    const occupiedSeats = await db.seat.findMany({
      where: {
        venueId: venue.id,
        status: 'occupied',
        assignedGuestId: { not: null },
      },
      select: { id: true, assignedGuestId: true },
    })

    const assignedRegistrations = await db.registration.findMany({
      where: {
        eventId: id,
        seatId: { not: null },
      },
      select: { id: true, seatId: true },
    })

    // Build transaction operations (individual updates for SQLite compat)
    const seatUpdates = occupiedSeats.map((seat) =>
      db.seat.update({
        where: { id: seat.id },
        data: { status: 'unoccupied', assignedGuestId: null },
      })
    )

    const regUpdates = assignedRegistrations.map((reg) =>
      db.registration.update({
        where: { id: reg.id },
        data: { seatId: null },
      })
    )

    await db.$transaction([...seatUpdates, ...regUpdates])

    return successResponse({ cleared: true })
  } catch (error) {
    console.error('POST /api/events/[id]/seat-assignment/clear error:', error)
    return errorResponse('Failed to clear seat assignments', 500)
  }
}
