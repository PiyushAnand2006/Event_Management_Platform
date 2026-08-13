import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'
import { createNotification } from '@/lib/notification-helper'

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

    if (event.status !== 'published') {
      return errorResponse('This event is not available for registration', 400)
    }

    // Check if already registered
    const existingReg = await db.registration.findUnique({
      where: { userId_eventId: { userId: user.id, eventId: id } },
    })
    if (existingReg) {
      return errorResponse('You are already registered for this event', 409)
    }

    // Use transaction for atomic increment
    const result = await db.$transaction(async (tx) => {
      const freshEvent = await tx.event.findUnique({ where: { id } })
      if (!freshEvent) throw new Error('Event not found')

      const hasCapacity = freshEvent.capacity === 0 || freshEvent.registeredCount < freshEvent.capacity
      const status = hasCapacity ? 'registered' : 'waitlisted'

      const registration = await tx.registration.create({
        data: {
          userId: user.id,
          eventId: id,
          status,
          paymentStatus: freshEvent.isFree ? 'not_applicable' : 'pending',
        },
      })

      if (hasCapacity) {
        await tx.event.update({
          where: { id },
          data: { registeredCount: { increment: 1 } },
        })
      }

      return { registration, status }
    })

    // Create notification
    if (result.status === 'registered') {
      await createNotification(
        user.id,
        'registration_confirmed',
        'Registration Confirmed',
        `You have been registered for "${event.title}".`,
        { eventId: id }
      )
    } else {
      await createNotification(
        user.id,
        'waitlisted',
        'Added to Waitlist',
        `You have been added to the waitlist for "${event.title}".`,
        { eventId: id }
      )
    }

    return successResponse({
      ...result.registration,
      status: result.status,
    }, 201)
  } catch (error) {
    console.error('POST /api/events/[id]/register error:', error)
    return errorResponse('Failed to register for event', 500)
  }
}
