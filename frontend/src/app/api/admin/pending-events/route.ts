import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser, parseJsonField } from '@/lib/api-utils'

export async function GET(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)
    if (user.role !== 'admin') return errorResponse('Admin access required', 403)

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))

    const where = { status: 'pending' }

    const [events, total] = await Promise.all([
      db.event.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          organizer: { select: { id: true, name: true, email: true, image: true } },
        },
      }),
      db.event.count({ where }),
    ])

    return successResponse({
      events: events.map((e) => ({
        ...e,
        tags: parseJsonField(e.tags, []),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('GET /api/admin/pending-events error:', error)
    return errorResponse('Failed to fetch pending events', 500)
  }
}
