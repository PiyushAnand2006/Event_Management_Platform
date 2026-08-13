import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser, parseJsonField } from '@/lib/api-utils'
import { createNotification } from '@/lib/notification-helper'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)
    if (user.role !== 'admin') return errorResponse('Admin access required', 403)

    const event = await db.event.findUnique({ where: { id } })
    if (!event) return errorResponse('Event not found', 404)

    if (event.status !== 'pending') {
      return errorResponse('Only pending events can be approved', 400)
    }

    const updated = await db.event.update({
      where: { id },
      data: { status: 'published' },
      include: { organizer: { select: { id: true, name: true, email: true, image: true } } },
    })

    // Notify organizer
    await createNotification(
      event.organizerId,
      'event_approved',
      'Event Approved!',
      `Your event "${event.title}" has been approved and is now published.`,
      { eventId: id }
    )

    return successResponse({
      ...updated,
      tags: parseJsonField(updated.tags, []),
      coordinates: updated.coordinates ? parseJsonField(updated.coordinates, null) : null,
    })
  } catch (error) {
    console.error('POST /api/admin/events/[id]/approve error:', error)
    return errorResponse('Failed to approve event', 500)
  }
}
