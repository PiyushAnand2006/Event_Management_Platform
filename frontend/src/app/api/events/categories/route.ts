import { db } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-utils'

export async function GET() {
  try {
    const categories = await db.event.findMany({
      where: { status: 'published' },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    })

    return successResponse(categories.map((c) => c.category))
  } catch (error) {
    console.error('GET /api/events/categories error:', error)
    return errorResponse('Failed to fetch categories', 500)
  }
}
