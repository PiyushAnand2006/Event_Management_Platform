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

    const [registrations, invitations, polls, pollResponses] = await Promise.all([
      db.registration.findMany({
        where: { eventId: id },
        select: { status: true, tier: true },
      }),
      db.invitation.findMany({
        where: { eventId: id },
        select: { status: true },
      }),
      db.poll.findMany({
        where: { eventId: id },
        select: { id: true },
      }),
      db.pollResponse.count({
        where: { poll: { eventId: id } },
      }),
    ])

    const totalRegistrations = registrations.length
    const checkedInCount = invitations.filter(
      (inv) => inv.status === 'checked_in'
    ).length
    const checkInRate =
      totalRegistrations > 0
        ? ((checkedInCount / totalRegistrations) * 100).toFixed(1) + '%'
        : '0%'

    const reviews = await db.review.findMany({
      where: { eventId: id },
      select: { rating: true },
    })
    const averageRating =
      reviews.length > 0
        ? Number(
            (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
          )
        : 0

    const registrationsByStatus: Record<string, number> = {
      registered: 0,
      waitlisted: 0,
      attended: 0,
      cancelled: 0,
    }
    for (const reg of registrations) {
      if (registrationsByStatus[reg.status] !== undefined) {
        registrationsByStatus[reg.status]++
      }
    }

    const registrationsByTier: Record<string, number> = {
      vip: 0,
      reserved: 0,
      general: 0,
    }
    for (const reg of registrations) {
      if (registrationsByTier[reg.tier] !== undefined) {
        registrationsByTier[reg.tier]++
      }
    }

    const pollParticipation = {
      totalPolls: polls.length,
      totalVotes: pollResponses,
    }

    return successResponse({
      totalRegistrations,
      checkInRate,
      averageRating,
      registrationsByStatus,
      registrationsByTier,
      pollParticipation,
    })
  } catch (error) {
    console.error('GET /api/events/[id]/analytics error:', error)
    return errorResponse('Failed to fetch analytics', 500)
  }
}
