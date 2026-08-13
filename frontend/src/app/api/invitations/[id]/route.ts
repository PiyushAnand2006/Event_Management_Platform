import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'

export async function GET(
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
        registration: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
            seat: {
              select: { id: true, label: true, tier: true, section: { select: { name: true } } },
            },
          },
        },
        event: true,
      },
    })

    if (!invitation) return errorResponse('Invitation not found', 404)

    // Owner (registration's userId) or Organizer of the event
    if (
      user.role !== 'admin' &&
      invitation.registration.userId !== user.id &&
      invitation.event.organizerId !== user.id
    ) {
      return errorResponse('Forbidden', 403)
    }

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
      },
      seat: registration.seat
        ? {
            id: registration.seat.id,
            label: registration.seat.label,
            tier: registration.seat.tier,
            section: registration.seat.section?.name || null,
          }
        : null,
    })
  } catch (error) {
    console.error('GET /api/invitations/[id] error:', error)
    return errorResponse('Failed to fetch invitation', 500)
  }
}
