import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser, parseJsonField } from '@/lib/api-utils'
import { Prisma } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)
    if (user.role !== 'admin') return errorResponse('Admin access required', 403)

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const role = searchParams.get('role') || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))

    const where: Prisma.UserWhereInput = {}
    if (role) where.role = role
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ]
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          isBlocked: true,
          createdAt: true,
          _count: {
            select: {
              organizedEvents: true,
              registrations: true,
              reviews: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.user.count({ where }),
    ])

    return successResponse({
      users: users.map((u) => ({
        ...u,
        interests: [],
        _count: undefined,
        eventCount: u._count.organizedEvents,
        registrationCount: u._count.registrations,
        reviewCount: u._count.reviews,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('GET /api/admin/users error:', error)
    return errorResponse('Failed to fetch users', 500)
  }
}
