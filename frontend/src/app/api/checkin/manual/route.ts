import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'
import { createNotification } from '@/lib/notification-helper'

export async function POST(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const body = await request.json()
    const { eventId, userId } = body

    if (!eventId || !userId) {
      return errorResponse('eventId and userId are required', 400)
    }

    // Perform atomic check-in
    const result = await db.$transaction(
      async (tx) => {
        // Find registration
        const registration = await tx.registration.findUnique({
          where: { userId_eventId: { userId, eventId } },
          include: {
            user: true,
            seat: true,
            invitation: true,
          },
        })

        if (!registration) {
          throw new Error('REGISTRATION_NOT_FOUND')
        }

        if (registration.status === 'attended') {
          throw new Error('ALREADY_CHECKED_IN')
        }

        // If invitation exists, check its status
        if (registration.invitation) {
          if (registration.invitation.status === 'checked_in') {
            throw new Error('ALREADY_CHECKED_IN')
          }
          if (registration.invitation.status === 'revoked') {
            throw new Error('INVITATION_REVOKED')
          }

          // Update invitation
          const now = new Date()
          await tx.invitation.update({
            where: { id: registration.invitation.id },
            data: { status: 'checked_in', checkedInAt: now },
          })
        }

        // Update registration
        await tx.registration.update({
          where: { id: registration.id },
          data: { status: 'attended' },
        })

        // Update seat if assigned
        if (registration.seatId) {
          await tx.seat.update({
            where: { id: registration.seatId },
            data: { status: 'occupied' },
          })
        }

        return {
          guestName: registration.user.name,
          tier: registration.tier,
          seatLabel: registration.seat?.label || null,
          checkedInAt: new Date(),
        }
      },
      { isolationLevel: 'Serializable' }
    )

    // Create notification for the guest (outside transaction)
    const event = await db.event.findUnique({ where: { id: eventId }, select: { title: true } })
    await createNotification(
      userId,
      'checkin_success',
      'Checked In Successfully',
      `You have been checked in to "${event?.title || 'the event'}".`,
      { eventId }
    )

    return successResponse(result)
  } catch (error) {
    console.error('POST /api/checkin/manual error:', error)
    const message =
      error instanceof Error ? error.message : 'Failed to process check-in'

    if (message === 'REGISTRATION_NOT_FOUND') return errorResponse('Registration not found', 404)
    if (message === 'ALREADY_CHECKED_IN') return errorResponse('Guest already checked in', 409)
    if (message === 'INVITATION_REVOKED') return errorResponse('Invitation has been revoked', 403)

    return errorResponse('Check-in failed', 500)
  }
}
