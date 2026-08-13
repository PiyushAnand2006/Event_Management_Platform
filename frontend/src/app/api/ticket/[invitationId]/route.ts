import { db } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-utils'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ invitationId: string }> }
) {
  try {
    const { invitationId } = await params

    const invitation = await db.invitation.findUnique({
      where: { id: invitationId },
      include: {
        registration: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
            seat: {
              select: {
                id: true,
                label: true,
                tier: true,
                section: { select: { name: true } },
              },
            },
          },
        },
        event: true,
      },
    })

    if (!invitation) return errorResponse('Invitation not found', 404)

    const { event, registration } = invitation

    return successResponse({
      invitation: {
        id: invitation.id,
        token: invitation.token,
        barcodeUrl: invitation.barcodeUrl,
        qrUrl: invitation.qrUrl,
        status: invitation.status,
        sentAt: invitation.sentAt,
        checkedInAt: invitation.checkedInAt,
        createdAt: invitation.createdAt,
      },
      event: {
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        endTime: event.endTime,
        location: event.location,
        posterUrl: event.posterUrl,
        type: event.type,
        category: event.category,
        price: event.price,
        isFree: event.isFree,
      },
      seat: registration.seat
        ? {
            id: registration.seat.id,
            label: registration.seat.label,
            tier: registration.seat.tier,
            section: registration.seat.section?.name || null,
          }
        : null,
      guest: {
        name: registration.user.name,
        email: registration.user.email,
        image: registration.user.image,
      },
      tier: registration.tier,
    })
  } catch (error) {
    console.error('GET /api/ticket/[invitationId] error:', error)
    return errorResponse('Failed to fetch ticket', 500)
  }
}
