import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'
import {
  generateInvitationToken,
  generateBarcode,
  generateQRCode,
} from '@/lib/invitation'

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

    // The dashboard posts without a body to generate for every registration;
    // only a JSON body carries an explicit registrationIds subset.
    let registrationIds: string[] = []
    try {
      const body = await request.json()
      registrationIds = body.registrationIds || []
    } catch {
      // empty request body — generate for all
    }

    // Get registrations to generate invitations for
    let registrations
    if (registrationIds.length > 0) {
      registrations = await db.registration.findMany({
        where: {
          id: { in: registrationIds },
          eventId,
        },
        include: { user: true, invitation: true },
      })
    } else {
      registrations = await db.registration.findMany({
        where: { eventId },
        include: { user: true, invitation: true },
      })
    }

    let generated = 0
    const total = registrations.length

    for (const reg of registrations) {
      // Skip if invitation already exists
      if (reg.invitation) continue

      const invitation = await db.invitation.create({
        data: {
          registrationId: reg.id,
          eventId,
          token: '', // placeholder, will be updated
          status: 'issued',
        },
      })

      const token = await generateInvitationToken(
        invitation.id,
        eventId,
        reg.tier
      )
      const barcodeUrl = await generateBarcode(invitation.id)
      const qrUrl = await generateQRCode(token)

      await db.invitation.update({
        where: { id: invitation.id },
        data: { token, barcodeUrl, qrUrl },
      })

      generated++
    }

    return successResponse({ generated, total })
  } catch (error) {
    console.error('POST /api/events/[id]/invitations/generate error:', error)
    return errorResponse('Failed to generate invitations', 500)
  }
}
