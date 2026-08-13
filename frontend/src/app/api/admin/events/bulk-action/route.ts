import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'
import { createNotification } from '@/lib/notification-helper'
import { sendEventRejectionEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)
    if (user.role !== 'admin') return errorResponse('Admin access required', 403)

    const body = await request.json()
    const { eventIds, action, reason } = body

    if (!Array.isArray(eventIds) || eventIds.length === 0) {
      return errorResponse('eventIds must be a non-empty array', 400)
    }
    if (action !== 'approve' && action !== 'reject') {
      return errorResponse('action must be "approve" or "reject"', 400)
    }

    const results: { id: string; success: boolean; error?: string }[] = []

    for (const eventId of eventIds) {
      try {
        const event = await db.event.findUnique({
          where: { id: eventId },
          include: { organizer: { select: { id: true, name: true, email: true } } },
        })

        if (!event) {
          results.push({ id: eventId, success: false, error: 'Event not found' })
          continue
        }

        if (event.status !== 'pending') {
          results.push({ id: eventId, success: false, error: 'Event is not in pending status' })
          continue
        }

        if (action === 'approve') {
          await db.event.update({
            where: { id: eventId },
            data: { status: 'published' },
          })
          await createNotification(
            event.organizerId,
            'event_approved',
            'Event Approved!',
            `Your event "${event.title}" has been approved and is now published.`,
            { eventId }
          )
        } else {
          await db.event.update({
            where: { id: eventId },
            data: { status: 'rejected' },
          })
          await sendEventRejectionEmail(event.organizer.email, event.organizer.name, event.title, reason)
          await createNotification(
            event.organizerId,
            'event_rejected',
            'Event Rejected',
            `Your event "${event.title}" has been rejected.${reason ? ` Reason: ${reason}` : ''}`,
            { eventId }
          )
        }

        results.push({ id: eventId, success: true })
      } catch (err) {
        results.push({ id: eventId, success: false, error: 'Unexpected error' })
      }
    }

    const succeeded = results.filter((r) => r.success).length
    const failed = results.filter((r) => !r.success).length

    return successResponse({
      processed: eventIds.length,
      succeeded,
      failed,
      results,
    })
  } catch (error) {
    console.error('POST /api/admin/events/bulk-action error:', error)
    return errorResponse('Failed to process bulk action', 500)
  }
}
