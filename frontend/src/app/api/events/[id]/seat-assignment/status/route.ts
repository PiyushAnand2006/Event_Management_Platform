import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'

/**
 * GET /api/events/[id]/seat-assignment/status
 * Returns assignment progress: assigned/total counts with tier breakdown.
 */
export async function GET(
  _request: Request,
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

    // Fetch registrations that are registered or attended
    const registrations = await db.registration.findMany({
      where: {
        eventId: id,
        status: { in: ['registered', 'attended'] },
      },
      select: {
        id: true,
        tier: true,
        seatId: true,
      },
    })

    const totalRegistrations = registrations.length
    const assignedCount = registrations.filter((r) => r.seatId !== null).length
    const unassignedCount = totalRegistrations - assignedCount

    // Tier breakdown
    const tierMap = new Map<string, { total: number; assigned: number }>()
    for (const reg of registrations) {
      const tier = reg.tier || 'general'
      const entry = tierMap.get(tier) || { total: 0, assigned: 0 }
      entry.total++
      if (reg.seatId) entry.assigned++
      tierMap.set(tier, entry)
    }

    const tierBreakdown = Array.from(tierMap.entries()).map(([tier, counts]) => ({
      tier,
      total: counts.total,
      assigned: counts.assigned,
    }))

    return successResponse({
      totalRegistrations,
      assignedCount,
      unassignedCount,
      tierBreakdown,
    })
  } catch (error) {
    console.error('GET /api/events/[id]/seat-assignment/status error:', error)
    return errorResponse('Failed to fetch assignment status', 500)
  }
}
