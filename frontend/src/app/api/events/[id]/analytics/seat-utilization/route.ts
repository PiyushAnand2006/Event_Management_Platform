import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const event = await db.event.findUnique({ where: { id } })
    if (!event) return errorResponse('Event not found', 404)

    if (user.role !== 'admin' && user.id !== event.organizerId) {
      const isCoOrg = await db.coOrganizer.findUnique({
        where: { eventId_userId: { eventId: id, userId: user.id } },
      })
      if (!isCoOrg) return errorResponse('Access denied', 403)
    }

    const venue = await db.venue.findUnique({
      where: { eventId: id },
      include: {
        sections: {
          include: {
            seats: {
              select: { status: true, tier: true },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    if (!venue) {
      return successResponse({
        hasVenue: false,
        totalSeats: 0,
        occupiedSeats: 0,
        utilizationRate: 0,
        sections: [],
        byTier: { vip: { total: 0, occupied: 0 }, reserved: { total: 0, occupied: 0 }, general: { total: 0, occupied: 0 } },
      })
    }

    const allSeats = venue.sections.flatMap((s) => s.seats)
    const totalSeats = allSeats.length
    const occupiedSeats = allSeats.filter((s) => s.status === 'occupied').length
    const utilizationRate = totalSeats > 0 ? Number(((occupiedSeats / totalSeats) * 100).toFixed(1)) : 0

    const sections = venue.sections.map((section) => {
      const total = section.seats.length
      const occupied = section.seats.filter((s) => s.status === 'occupied').length
      return {
        name: section.name,
        total,
        occupied,
        rate: total > 0 ? Number(((occupied / total) * 100).toFixed(1)) : 0,
      }
    })

    const byTier: Record<string, { total: number; occupied: number }> = {
      vip: { total: 0, occupied: 0 },
      reserved: { total: 0, occupied: 0 },
      general: { total: 0, occupied: 0 },
    }
    for (const seat of allSeats) {
      if (byTier[seat.tier]) {
        byTier[seat.tier].total++
        if (seat.status === 'occupied') byTier[seat.tier].occupied++
      }
    }

    return successResponse({
      hasVenue: true,
      totalSeats,
      occupiedSeats,
      utilizationRate,
      sections,
      byTier,
    })
  } catch (error) {
    console.error('GET /api/events/[id]/analytics/seat-utilization error:', error)
    return errorResponse('Failed to fetch seat utilization', 500)
  }
}
