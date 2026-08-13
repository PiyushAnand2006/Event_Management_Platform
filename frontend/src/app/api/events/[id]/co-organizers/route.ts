import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const event = await db.event.findUnique({
      where: { id },
      include: { coOrganizers: true },
    })
    if (!event) return errorResponse('Event not found', 404)

    if (user.role !== 'admin' && user.id !== event.organizerId) {
      return errorResponse('Only the event organizer can add co-organizers', 403)
    }

    const body = await request.json()
    const { email } = body

    if (!email) return errorResponse('Email is required', 400)

    const targetUser = await db.user.findUnique({ where: { email } })
    if (!targetUser) return errorResponse('User not found', 404)

    // Check if already a co-organizer
    const alreadyCoOrg = event.coOrganizers.some((co) => co.userId === targetUser.id)
    if (alreadyCoOrg) return errorResponse('User is already a co-organizer', 409)

    // Don't allow the main organizer as co-organizer
    if (targetUser.id === event.organizerId) {
      return errorResponse('The event organizer cannot be added as a co-organizer', 400)
    }

    const coOrganizer = await db.coOrganizer.create({
      data: { eventId: id, userId: targetUser.id },
      include: { user: { select: { id: true, name: true, email: true, image: true } } },
    })

    return successResponse(coOrganizer, 201)
  } catch (error) {
    console.error('POST /api/events/[id]/co-organizers error:', error)
    return errorResponse('Failed to add co-organizer', 500)
  }
}
