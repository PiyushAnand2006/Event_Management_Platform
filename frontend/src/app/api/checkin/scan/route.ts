import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'
import { verifyInvitationToken, verifyRegistrationToken } from '@/lib/invitation'
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

    // A scanned QR can be three things:
    //  - the customer's registration QR (JWT with regId) — minted at registration
    //  - an invitation QR (JWT with invId) — minted when invitations are generated
    //  - a Code128 barcode payload — the plain invitation id
    const isJwt = presented.split('.').length === 3
    let invId: string | null = null
    let regId: string | null = null
    if (isJwt) {
      const regPayload = await verifyRegistrationToken(presented)
      if (regPayload) {
        if (regPayload.eventId !== eventId) {
          return errorResponse('Ticket does not belong to this event', 400)
        }
        regId = regPayload.regId
      } else {
        const invPayload = await verifyInvitationToken(presented)
        if (!invPayload) {
          return errorResponse('Invalid or expired ticket', 400)
        }
        if (invPayload.eventId !== eventId) {
          return errorResponse('Ticket does not belong to this event', 400)
        }
        invId = invPayload.invId
      }
    } else {
      invId = presented
    }

    // Perform atomic check-in
    const result = await db.$transaction(
      async (tx) => {
        const now = new Date()

        // Registration QR path: the customer's own ticket minted at registration
        if (regId) {
          const registration = await tx.registration.findUnique({
            where: { id: regId },
            include: { user: true, seat: true, invitation: true },
          })

          if (!registration) throw new Error('TICKET_NOT_FOUND')
          if (registration.eventId !== eventId) throw new Error('WRONG_EVENT')
          if (registration.status === 'attended') throw new Error('ALREADY_CHECKED_IN')
          if (registration.status === 'cancelled') throw new Error('REGISTRATION_CANCELLED')
          if (registration.invitation?.status === 'revoked') throw new Error('INVITATION_REVOKED')

          // Mark the registration (and its QR) as checked in. The stored QR
          // itself is never touched — it stays a permanent record.
          await tx.registration.update({
            where: { id: registration.id },
            data: { status: 'attended' },
          })

          if (registration.invitation && registration.invitation.status !== 'checked_in') {
            await tx.invitation.update({
              where: { id: registration.invitation.id },
              data: { status: 'checked_in', checkedInAt: now },
            })
          }

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
            checkedInAt: now,
            userId: registration.userId,
          }
        }

        // Invitation path: organizer-generated invitation QR or barcode
        const invitation = await tx.invitation.findUnique({
          where: { id: invId! },
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
          throw new Error('TICKET_NOT_FOUND')
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

    if (message === 'TICKET_NOT_FOUND') return errorResponse('Ticket not found', 404)
    if (message === 'INVITATION_NOT_FOUND') return errorResponse('Invitation not found', 404)
    if (message === 'ALREADY_CHECKED_IN') return errorResponse('Guest already checked in', 409)
    if (message === 'INVITATION_REVOKED') return errorResponse('Invitation has been revoked', 403)
    if (message === 'WRONG_EVENT') return errorResponse('Ticket does not belong to this event', 400)
    if (message === 'REGISTRATION_CANCELLED') return errorResponse('Registration was cancelled', 400)

    return errorResponse(message === 'Failed to process check-in' ? message : 'Check-in failed', 500)
  }
}
