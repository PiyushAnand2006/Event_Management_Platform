import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'
import { createNotification } from '@/lib/notification-helper'
import { calculateRefund } from '@/lib/refund-policy'

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

    const registration = await db.registration.findUnique({
      where: { userId_eventId: { userId: user.id, eventId: id } },
    })
    if (!registration) {
      return errorResponse('No active registration found', 404)
    }
    if (registration.status === 'cancelled') {
      return errorResponse('Registration is already cancelled', 400)
    }

    // Calculate refund
    let refund = { percentage: 0, amount: 0, status: 'none' as const }
    if (!event.isFree && event.price > 0) {
      refund = calculateRefund(event.date, registration.createdAt, event.price)
    }

    // Use transaction for atomic operations
    const updated = await db.$transaction(async (tx) => {
      const updatedReg = await tx.registration.update({
        where: { userId_eventId: { userId: user.id, eventId: id } },
        data: {
          status: 'cancelled',
          refundStatus: !event.isFree ? 'processed' : 'not_applicable',
          refundAmount: refund.amount,
          refundedAt: !event.isFree ? new Date() : null,
        },
      })

      // Decrement registeredCount if was registered (not waitlisted)
      if (registration.status === 'registered' && event.capacity > 0) {
        await tx.event.update({
          where: { id },
          data: { registeredCount: { decrement: 1 } },
        })

        // Promote first waitlisted user
        const firstWaitlisted = await tx.registration.findFirst({
          where: { eventId: id, status: 'waitlisted' },
          orderBy: { createdAt: 'asc' },
        })

        if (firstWaitlisted) {
          await tx.registration.update({
            where: { id: firstWaitlisted.id },
            data: { status: 'registered' },
          })
          await tx.event.update({
            where: { id },
            data: { registeredCount: { increment: 1 } },
          })

          // Notify promoted user
          await createNotification(
            firstWaitlisted.userId,
            'waitlist_promoted',
            'You are in!',
            `A spot opened up for "${event.title}". You have been moved off the waitlist.`,
            { eventId: id }
          )
        }
      }

      return updatedReg
    })

    // Notify cancelling user
    await createNotification(
      user.id,
      'registration_confirmed',
      'Registration Cancelled',
      `Your registration for "${event.title}" has been cancelled.${refund.status !== 'none' ? ` Refund: ${refund.percentage}% ($${refund.amount.toFixed(2)})` : ''}`,
      { eventId: id }
    )

    return successResponse({
      ...updated,
      refund,
    })
  } catch (error) {
    console.error('POST /api/events/[id]/cancel-registration error:', error)
    return errorResponse('Failed to cancel registration', 500)
  }
}
