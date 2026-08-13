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

    const invitations = await db.invitation.findMany({
      where: { eventId: id },
      select: { status: true },
    })

    const issued = invitations.length
    const sent = invitations.filter((inv) => inv.status === 'sent' || inv.status === 'opened' || inv.status === 'checked_in').length
    const opened = invitations.filter((inv) => inv.status === 'opened' || inv.status === 'checked_in').length
    const checkedIn = invitations.filter((inv) => inv.status === 'checked_in').length

    return successResponse({
      funnel: [
        { stage: 'Invited', count: issued },
        { stage: 'Sent', count: sent },
        { stage: 'Opened', count: opened },
        { stage: 'Checked In', count: checkedIn },
      ],
    })
  } catch (error) {
    console.error('GET /api/events/[id]/analytics/rsvp-funnel error:', error)
    return errorResponse('Failed to fetch RSVP funnel', 500)
  }
}
