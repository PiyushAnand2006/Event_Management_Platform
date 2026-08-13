import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const event = await db.event.findUnique({ where: { id } })
    if (!event) return errorResponse('Event not found', 404)

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)))

    const [reviews, total] = await Promise.all([
      db.review.findMany({
        where: { eventId: id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      }),
      db.review.count({ where: { eventId: id } }),
    ])

    return successResponse({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('GET /api/events/[id]/reviews error:', error)
    return errorResponse('Failed to fetch reviews', 500)
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const event = await db.event.findUnique({ where: { id } })
    if (!event) return errorResponse('Event not found', 404)

    // Check user is registered (registered or attended)
    const registration = await db.registration.findUnique({
      where: { userId_eventId: { userId: user.id, eventId: id } },
    })
    if (!registration || (registration.status !== 'registered' && registration.status !== 'attended')) {
      return errorResponse('You must be registered for this event to leave a review', 403)
    }

    const body = await request.json()
    const { rating, comment } = body

    if (!rating || rating < 1 || rating > 5) {
      return errorResponse('Rating must be between 1 and 5', 400)
    }

    // Check for existing review (unique constraint will also catch this)
    const existingReview = await db.review.findUnique({
      where: { userId_eventId: { userId: user.id, eventId: id } },
    })
    if (existingReview) {
      return errorResponse('You have already reviewed this event', 409)
    }

    // Create review and recalculate average rating in transaction
    const review = await db.$transaction(async (tx) => {
      const newReview = await tx.review.create({
        data: {
          rating,
          comment: comment?.trim() || null,
          userId: user.id,
          eventId: id,
        },
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      })

      // Recalculate average
      const agg = await tx.review.aggregate({
        where: { eventId: id },
        _avg: { rating: true },
      })
      await tx.event.update({
        where: { id },
        data: { averageRating: Math.round((agg._avg.rating || 0) * 100) / 100 },
      })

      return newReview
    })

    return successResponse(review, 201)
  } catch (error) {
    console.error('POST /api/events/[id]/reviews error:', error)
    return errorResponse('Failed to submit review', 500)
  }
}
