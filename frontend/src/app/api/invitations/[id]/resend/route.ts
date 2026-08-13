import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'
import {
  generateBarcode,
  generateQRCode,
  sendInvitationEmail,
} from '@/lib/invitation'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const invitation = await db.invitation.findUnique({
      where: { id },
      include: {
        registration: { include: { user: true } },
        event: true,
      },
    })

    if (!invitation) return errorResponse('Invitation not found', 404)

    if (user.role !== 'admin' && invitation.event.organizerId !== user.id) {
      return errorResponse('Forbidden', 403)
    }

    // Regenerate barcode and QR if needed
    let barcodeUrl = invitation.barcodeUrl
    let qrUrl = invitation.qrUrl

    if (!barcodeUrl) {
      barcodeUrl = await generateBarcode(invitation.id)
    }
    if (!qrUrl) {
      qrUrl = await generateQRCode(invitation.token)
    }

    const ticketUrl = `${process.env.NEXTAUTH_URL || ''}/ticket/${invitation.id}`
    const guest = invitation.registration.user

    const success = await sendInvitationEmail(
      guest.email,
      guest.name,
      invitation.event.title,
      ticketUrl,
      barcodeUrl
    )

    if (!success) {
      return errorResponse('Failed to send invitation email', 500)
    }

    await db.invitation.update({
      where: { id },
      data: {
        barcodeUrl,
        qrUrl,
        status: 'sent',
        sentAt: new Date(),
      },
    })

    return successResponse({ sent: true })
  } catch (error) {
    console.error('POST /api/invitations/[id]/resend error:', error)
    return errorResponse('Failed to resend invitation', 500)
  }
}
