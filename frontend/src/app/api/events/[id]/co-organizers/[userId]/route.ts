import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id, userId } = await params
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const event = await db.event.findUnique({ where: { id } })
    if (!event) return errorResponse('Event not found', 404)

    if (user.role !== 'admin' && user.id !== event.organizerId) {
      return errorResponse('Only the event organizer can remove co-organizers', 403)
    }

    const coOrg = await db.coOrganizer.findUnique({
      where: { eventId_userId: { eventId: id, userId } },
    })
    if (!coOrg) return errorResponse('Co-organizer not found', 404)

    await db.coOrganizer.delete({
      where: { eventId_userId: { eventId: id, userId } },
    })

    return successResponse({ removed: true })
  } catch (error) {
    console.error('DELETE /api/events/[id]/co-organizers/[userId] error:', error)
    return errorResponse('Failed to remove co-organizer', 500)
  }
}
