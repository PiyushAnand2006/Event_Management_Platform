import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'

export async function GET(
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = { eventId }
    if (status) {
      where.status = status
    }

    const [invitations, total] = await Promise.all([
      db.invitation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          registration: {
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
              seat: {
                select: { id: true, label: true, tier: true },
              },
            },
          },
        },
      }),
      db.invitation.count({ where }),
    ])

    return successResponse({ invitations, total })
  } catch (error) {
    console.error('GET /api/events/[id]/invitations error:', error)
    return errorResponse('Failed to fetch invitations', 500)
  }
}
