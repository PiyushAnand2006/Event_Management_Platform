import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'
import { verifyInvitationToken } from '@/lib/invitation'
import { createNotification } from '@/lib/notification-helper'

export async function POST(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const body = await request.json()
    const { token, barcode, eventId } = body
    const presented: string = token || barcode

    if (!presented || !eventId) {
      return errorResponse('Token and eventId are required', 400)
    }

    // QR codes carry the signed invitation JWT; the Code128 barcode scans as
    // the plain invitation id. Accept either.
    const isJwt = presented.split('.').length === 3
    let invId: string
    if (isJwt) {
      const payload = await verifyInvitationToken(presented)
      if (!payload) {
        return errorResponse('Invalid or expired token', 400)
      }
      if (payload.eventId !== eventId) {
        return errorResponse('Token does not match this event', 400)
      }
      invId = payload.invId
    } else {
      invId = presented
    }

    // Perform atomic check-in
    const result = await db.$transaction(
      async (tx) => {
        // 1. Find invitation that is not checked in and not revoked
        const invitation = await tx.invitation.findUnique({
          where: { id: invId },
          include: {
            registration: {
              include: {
                user: true,
                seat: true,
              },
            },
          },
        })

        if (!invitation) {
          throw new Error('INVITATION_NOT_FOUND')
        }

        if (invitation.eventId !== eventId) {
          throw new Error('WRONG_EVENT')
        }

        if (invitation.status === 'checked_in') {
          throw new Error('ALREADY_CHECKED_IN')
        }

        if (invitation.status === 'revoked') {
          throw new Error('INVITATION_REVOKED')
        }

        const now = new Date()

        // 2. Update invitation
        await tx.invitation.update({
          where: { id: invitation.id },
          data: { status: 'checked_in', checkedInAt: now },
        })

        // 3. Update registration
        await tx.registration.update({
          where: { id: invitation.registrationId },
          data: { status: 'attended' },
        })

        // 4. Update seat if assigned
        if (invitation.registration.seatId) {
          await tx.seat.update({
            where: { id: invitation.registration.seatId },
            data: { status: 'occupied' },
          })
        }

        return {
          guestName: invitation.registration.user.name,
          tier: invitation.registration.tier,
          seatLabel: invitation.registration.seat?.label || null,
          checkedInAt: now,
          userId: invitation.registration.userId,
          eventTitle: invitation.eventId, // will fetch separately if needed
        }
      },
      { isolationLevel: 'Serializable' }
    )

    // 5. Create notification for the guest (outside transaction)
    const event = await db.event.findUnique({ where: { id: eventId }, select: { title: true } })
    await createNotification(
      result.userId,
      'checkin_success',
      'Checked In Successfully',
      `You have been checked in to "${event?.title || 'the event'}".`,
      { eventId }
    )

    return successResponse({
      guestName: result.guestName,
      tier: result.tier,
      seatLabel: result.seatLabel,
      checkedInAt: result.checkedInAt,
    })
  } catch (error) {
    console.error('POST /api/checkin/scan error:', error)
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to process check-in'

    if (message === 'INVITATION_NOT_FOUND') return errorResponse('Invitation not found', 404)
    if (message === 'ALREADY_CHECKED_IN') return errorResponse('Guest already checked in', 409)
    if (message === 'INVITATION_REVOKED') return errorResponse('Invitation has been revoked', 403)
    if (message === 'WRONG_EVENT') return errorResponse('Ticket does not belong to this event', 400)

    return errorResponse(message === 'Failed to process check-in' ? message : 'Check-in failed', 500)
  }
}
