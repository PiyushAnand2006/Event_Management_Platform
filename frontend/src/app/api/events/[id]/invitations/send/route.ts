import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'
import { sendInvitationEmail } from '@/lib/invitation'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const event = await db.event.findUnique({ where: { id: eventId } })
    if (!event) return errorResponse('Event not found', 404)

    if (user.role !== 'admin' && event.organizerId !== user.id) {
      return errorResponse('Forbidden', 403)
    }

    const body = await request.json()
    const invitationIds: string[] = body.invitationIds || []

    // Get invitations to send
    let invitations
    if (invitationIds.length > 0) {
      invitations = await db.invitation.findMany({
        where: { id: { in: invitationIds }, eventId },
        include: {
          registration: {
            include: { user: true },
          },
        },
      })
    } else {
      // Send all unsent invitations
      invitations = await db.invitation.findMany({
        where: { eventId, status: 'issued' },
        include: {
          registration: {
            include: { user: true },
          },
        },
      })
    }

    let sent = 0
    let failed = 0

    for (const inv of invitations) {
      const guest = inv.registration.user
      const ticketUrl = `${process.env.NEXTAUTH_URL || ''}/ticket/${inv.id}`
      const barcodeUrl = inv.barcodeUrl || ''

      const success = await sendInvitationEmail(
        guest.email,
        guest.name,
        event.title,
        ticketUrl,
        barcodeUrl
      )

      if (success) {
        await db.invitation.update({
          where: { id: inv.id },
          data: { status: 'sent', sentAt: new Date() },
        })
        sent++
      } else {
        failed++
      }
    }

    return successResponse({ sent, failed })
  } catch (error) {
    console.error('POST /api/events/[id]/invitations/send error:', error)
    return errorResponse('Failed to send invitations', 500)
  }
}
