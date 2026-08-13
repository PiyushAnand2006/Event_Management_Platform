import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'
import { createNotification } from '@/lib/notification-helper'
import { sendEmail } from '@/lib/email'

export async function POST(
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

    // Get all registered (not cancelled/waitlisted) users
    const registrations = await db.registration.findMany({
      where: { eventId: id, status: 'registered' },
      include: { user: { select: { id: true, name: true, email: true } } },
    })

    if (registrations.length === 0) {
      return errorResponse('No registered users to send reminders to', 400)
    }

    const eventDateStr = event.date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    const eventTimeStr = event.endTime
      ? `${event.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} – ${event.endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
      : event.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

    // Send email + notification to each registered user
    let sentCount = 0
    for (const reg of registrations) {
      await sendEmail({
        to: reg.user.email,
        subject: `Reminder: ${event.title} on ${eventDateStr}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #111;">📅 Event Reminder</h1>
            <p>Hi ${reg.user.name},</p>
            <p>This is a reminder that you are registered for:</p>
            <h2>${event.title}</h2>
            <p><strong>Date:</strong> ${eventDateStr}</p>
            <p><strong>Time:</strong> ${eventTimeStr}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <p style="color:#666;margin-top:24px;font-size:14px;">See you there!</p>
          </div>
        `,
      })

      await createNotification(
        reg.user.id,
        'event_reminder',
        'Event Reminder',
        `Reminder: "${event.title}" is on ${eventDateStr} at ${event.location}.`,
        { eventId: id }
      )

      sentCount++
    }

    return successResponse({
      sent: sentCount,
      total: registrations.length,
    })
  } catch (error) {
    console.error('POST /api/events/[id]/remind error:', error)
    return errorResponse('Failed to send reminders', 500)
  }
}
