import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const event = await db.event.findUnique({
      where: { id },
      include: {
        venue: {
          include: {
            sections: {
              include: { _count: { select: { seats: true } } },
            },
            seats: true,
            pois: true,
          },
        },
      },
    })

    if (!event) return errorResponse('Event not found', 404)
    if (user.role !== 'admin' && user.id !== event.organizerId) {
      return errorResponse('Forbidden', 403)
    }
    if (!event.venue) return errorResponse('Venue not found for this event', 404)

    const venue = event.venue
    const seats = venue.seats

    const seatsByTier: Record<string, number> = {}
    const seatsByStatus: Record<string, number> = {}

    for (const seat of seats) {
      seatsByTier[seat.tier] = (seatsByTier[seat.tier] || 0) + 1
      seatsByStatus[seat.status] = (seatsByStatus[seat.status] || 0) + 1
    }

    const summary = {
      venueId: venue.id,
      name: venue.name,
      width: venue.width,
      height: venue.height,
      totalSeats: seats.length,
      seatsByTier,
      seatsByStatus,
      sections: venue.sections.map((s) => ({
        id: s.id,
        name: s.name,
        seatCount: s._count.seats,
      })),
      pois: venue.pois.map((p) => ({
        id: p.id,
        type: p.type,
        name: p.name,
      })),
    }

    return successResponse(summary)
  } catch (error) {
    console.error('GET /api/events/[id]/venue/summary error:', error)
    return errorResponse('Failed to fetch venue summary', 500)
  }
}
