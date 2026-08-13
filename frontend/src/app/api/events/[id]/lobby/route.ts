import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const event = await db.event.findUnique({
      where: { id },
      select: { id: true, title: true, status: true, date: true, venueId: true },
    })

    if (!event) {
      return errorResponse('Event not found', 404)
    }

    if (event.status !== 'published') {
      return errorResponse('Event is not published', 403)
    }

    if (!event.venueId) {
      return errorResponse('No venue configured for this event', 404)
    }

    const [venue, sections, pois, stalls, seatStats] = await Promise.all([
      db.venue.findUnique({
        where: { id: event.venueId },
        select: { id: true, name: true, width: true, height: true },
      }),
      db.venueSection.findMany({
        where: { venueId: event.venueId },
        select: { id: true, name: true, positionX: true, positionY: true, width: true, height: true },
        orderBy: { sortOrder: 'asc' },
      }),
      db.pOI.findMany({
        where: { venueId: event.venueId },
        select: { id: true, type: true, name: true, positionX: true, positionY: true, icon: true, refId: true },
        orderBy: { sortOrder: 'asc' },
      }),
      db.foodStall.findMany({
        where: { eventId: id },
        select: {
          id: true, stallType: true, ownerName: true, contractStatus: true,
          cuisineType: true, locationX: true, locationY: true,
        },
      }),
      db.seat.groupBy({
        by: ['status'],
        where: { venueId: event.venueId },
        _count: { status: true },
      }),
    ])

    if (!venue) {
      return errorResponse('Venue not found', 404)
    }

    const total = seatStats.reduce((sum, s) => sum + s._count.status, 0)
    const occupied = seatStats.find((s) => s.status === 'occupied')?._count.status ?? 0
    const unoccupied = total - occupied

    return successResponse({
      event: { id: event.id, title: event.title, status: event.status, date: event.date.toISOString() },
      venue: { id: venue.id, name: venue.name, width: venue.width, height: venue.height },
      sections,
      pois,
      stalls,
      seatStats: { total, occupied, unoccupied },
    })
  } catch (error) {
    console.error('[Lobby] GET error:', error)
    return errorResponse('Failed to load lobby data')
  }
}
