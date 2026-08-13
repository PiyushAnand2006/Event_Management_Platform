import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser, parseJsonField } from '@/lib/api-utils'

/**
 * Simple tag/category overlap recommendation engine.
 * Matches user.interests (JSON array) against event.tags and event.category.
 * Excludes events the user already registered for.
 */
export async function GET(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const { searchParams } = new URL(request.url)
    const limit = Math.min(20, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)))

    // Get user interests
    const fullUser = await db.user.findUnique({
      where: { id: user.id },
      select: { interests: true },
    })
    const interests: string[] = parseJsonField(fullUser?.interests, [])

    // Get IDs of events user already registered for
    const userRegistrations = await db.registration.findMany({
      where: { userId: user.id },
      select: { eventId: true },
    })
    const registeredEventIds = new Set(userRegistrations.map((r) => r.eventId))

    // Fetch all published events
    const allEvents = await db.event.findMany({
      where: { status: 'published' },
      include: {
        organizer: { select: { id: true, name: true, image: true } },
        _count: { select: { reviews: true, bookmarks: true } },
      },
    })

    // Score each event based on overlap
    const scored = allEvents
      .filter((e) => !registeredEventIds.has(e.id))
      .map((e) => {
        const eventTags: string[] = parseJsonField(e.tags, [])
        let score = 0

        // Category match (highest weight)
        if (interests.includes(e.category)) {
          score += 3
        }

        // Tag overlap
        for (const tag of eventTags) {
          if (interests.includes(tag)) {
            score += 1
          }
        }

        // Small bonus for rating
        score += e.averageRating * 0.5

        return {
          ...e,
          tags: eventTags,
          score,
          reviewCount: e._count.reviews,
          bookmarkCount: e._count.bookmarks,
          _count: undefined,
          coordinates: e.coordinates ? parseJsonField(e.coordinates, null) : null,
        }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

    return successResponse(scored)
  } catch (error) {
    console.error('GET /api/events/recommended error:', error)
    return errorResponse('Failed to fetch recommended events', 500)
  }
}
