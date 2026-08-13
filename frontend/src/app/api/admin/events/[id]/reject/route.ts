import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser, parseJsonField } from '@/lib/api-utils'
import { createNotification } from '@/lib/notification-helper'
import { sendEventRejectionEmail } from '@/lib/email'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)
    if (user.role !== 'admin') return errorResponse('Admin access required', 403)

    const event = await db.event.findUnique({
      where: { id },
      include: { organizer: { select: { id: true, name: true, email: true } } },
    })
    if (!event) return errorResponse('Event not found', 404)

    if (event.status !== 'pending') {
      return errorResponse('Only pending events can be rejected', 400)
    }

    const body = await request.json()
    const { reason } = body

    const updated = await db.event.update({
      where: { id },
      data: { status: 'rejected' },
    })

    // Send rejection email
    await sendEventRejectionEmail(
      event.organizer.email,
      event.organizer.name,
      event.title,
      reason
    )

    // Notify organizer
    await createNotification(
      event.organizerId,
      'event_rejected',
      'Event Rejected',
      `Your event "${event.title}" has been rejected.${reason ? ` Reason: ${reason}` : ''}`,
      { eventId: id }
    )

    return successResponse({
      ...updated,
      tags: parseJsonField(updated.tags, []),
      coordinates: updated.coordinates ? parseJsonField(updated.coordinates, null) : null,
    })
  } catch (error) {
    console.error('POST /api/admin/events/[id]/reject error:', error)
    return errorResponse('Failed to reject event', 500)
  }
}
