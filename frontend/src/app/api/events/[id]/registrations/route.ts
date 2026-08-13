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

    const event = await db.event.findUnique({ where: { id } })
    if (!event) return errorResponse('Event not found', 404)

    if (user.role !== 'admin' && user.id !== event.organizerId) {
      // Also check co-organizer
      const isCoOrg = await db.coOrganizer.findUnique({
        where: { eventId_userId: { eventId: id, userId: user.id } },
      })
      if (!isCoOrg) return errorResponse('Access denied', 403)
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const status = searchParams.get('status')

    const where: Record<string, unknown> = { eventId: id }
    if (status) where.status = status

    const [registrations, total] = await Promise.all([
      db.registration.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
      }),
      db.registration.count({ where }),
    ])

    return successResponse({
      registrations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('GET /api/events/[id]/registrations error:', error)
    return errorResponse('Failed to fetch registrations', 500)
  }
}
