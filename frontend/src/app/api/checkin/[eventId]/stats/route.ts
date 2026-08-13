import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const event = await db.event.findUnique({ where: { id: eventId } })
    if (!event) return errorResponse('Event not found', 404)

    if (user.role !== 'admin' && event.organizerId !== user.id) {
      return errorResponse('Forbidden', 403)
    }

    const [totalInvited, sent, opened, checkedIn, revoked] = await Promise.all([
      db.invitation.count({ where: { eventId } }),
      db.invitation.count({ where: { eventId, status: 'sent' } }),
      db.invitation.count({ where: { eventId, status: 'opened' } }),
      db.invitation.count({ where: { eventId, status: 'checked_in' } }),
      db.invitation.count({ where: { eventId, status: 'revoked' } }),
    ])

    const pending = totalInvited - sent - checkedIn - revoked - opened

    return successResponse({
      totalInvited,
      sent: sent + opened, // both sent and opened count as "sent"
      checkedIn,
      pending: Math.max(0, pending),
      revoked,
    })
  } catch (error) {
    console.error('GET /api/checkin/[eventId]/stats error:', error)
    return errorResponse('Failed to fetch check-in stats', 500)
  }
}
