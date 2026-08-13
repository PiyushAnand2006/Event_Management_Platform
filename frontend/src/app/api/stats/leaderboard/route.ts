import { db } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-utils'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sortBy = searchParams.get('sortBy') || 'rating'
    const limit = Math.min(20, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)))

    const orderBy =
      sortBy === 'registrations'
        ? { registeredCount: 'desc' as const }
        : { averageRating: 'desc' as const }

    // Only show published events
    const where = { status: 'published' }

    const events = await db.event.findMany({
      where,
      orderBy,
      take: limit,
      select: {
        id: true,
        title: true,
        category: true,
        type: true,
        date: true,
        location: true,
        posterUrl: true,
        averageRating: true,
        registeredCount: true,
        organizer: { select: { id: true, name: true, image: true } },
        _count: { select: { reviews: true } },
      },
    })

    return successResponse(
      events.map((e) => ({
        ...e,
        reviewCount: e._count.reviews,
        _count: undefined,
      }))
    )
  } catch (error) {
    console.error('GET /api/stats/leaderboard error:', error)
    return errorResponse('Failed to fetch leaderboard', 500)
  }
}
