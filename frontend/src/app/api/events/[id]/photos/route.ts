import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'

// GET: List photos for an event
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

    const isOrganizer = user.role === 'admin' || user.id === event.organizerId

    // If not organizer, check registration
    if (!isOrganizer) {
      const registration = await db.registration.findFirst({
        where: { eventId: event.id, userId: user.id, status: { in: ['registered', 'attended'] } }
      })
      if (!registration) return errorResponse('You must be registered for this event', 403)
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))

    // Build where clause
    const where: Record<string, unknown> = { eventId: id }

    if (status) {
      const validStatuses = ['pending', 'approved', 'rejected']
      if (!validStatuses.includes(status)) {
        return errorResponse('Invalid status. Must be: pending, approved, or rejected', 400)
      }
      // Non-organizers can only see approved
      if (!isOrganizer && status !== 'approved') {
        where.status = 'approved'
      } else {
        where.status = status
      }
    } else {
      // No status filter: organizer sees all, guest sees only approved
      if (!isOrganizer) {
        where.status = 'approved'
      }
    }

    const [photos, total] = await Promise.all([
      db.photo.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, name: true, image: true } },
          moderator: status && isOrganizer
            ? { select: { id: true, name: true } }
            : false,
        },
      }),
      db.photo.count({ where }),
    ])

    return successResponse({
      photos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('GET /api/events/[id]/photos error:', error)
    return errorResponse('Failed to fetch photos', 500)
  }
}

// POST: Upload a photo (accept URL string)
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

    // Auth: registered user
    const registration = await db.registration.findFirst({
      where: { eventId: event.id, userId: user.id, status: { in: ['registered', 'attended'] } }
    })
    if (!registration) return errorResponse('You must be registered for this event', 403)

    const body = await request.json()
    const { url, caption } = body

    if (!url || typeof url !== 'string' || !url.trim()) {
      return errorResponse('Photo URL is required', 400)
    }

    const photo = await db.photo.create({
      data: {
        eventId: id,
        uploadedBy: user.id,
        url: url.trim(),
        caption: caption ? String(caption).trim() : null,
        status: 'pending',
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    })

    return successResponse(photo, 201)
  } catch (error) {
    console.error('POST /api/events/[id]/photos error:', error)
    return errorResponse('Failed to upload photo', 500)
  }
}
