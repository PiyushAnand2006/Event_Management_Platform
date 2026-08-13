import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'

export async function GET() {
  try {
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)
    if (user.role !== 'admin') return errorResponse('Admin only', 403)

    const [
      totalUsers,
      totalEvents,
      totalRegistrations,
      eventsByStatus,
      categoryDistribution,
      ratingResult,
    ] = await Promise.all([
      db.user.count(),
      db.event.count(),
      db.registration.count(),
      db.event.groupBy({ by: ['status'], _count: { id: true } }),
      db.event.groupBy({ by: ['category'], _count: { id: true } }),
      db.event.aggregate({ _avg: { averageRating: true } }),
    ])

    const avgRating = ratingResult._avg.averageRating
      ? Number(ratingResult._avg.averageRating.toFixed(1))
      : 0

    const statusMap: Record<string, number> = {}
    for (const row of eventsByStatus) {
      statusMap[row.status] = row._count.id
    }

    const topCategories = categoryDistribution
      .map((c) => ({ category: c.category, count: c._count.id }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return successResponse({
      totalUsers,
      totalEvents,
      totalRegistrations,
      averageRating: avgRating,
      eventsByStatus: statusMap,
      topCategories,
    })
  } catch (error) {
    console.error('GET /api/admin/analytics error:', error)
    return errorResponse('Failed to fetch platform analytics', 500)
  }
}
