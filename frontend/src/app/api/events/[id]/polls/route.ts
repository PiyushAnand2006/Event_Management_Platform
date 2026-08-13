import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser, toJsonField, parseJsonField } from '@/lib/api-utils'

// GET: List polls for an event
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getServerUser()

    const event = await db.event.findUnique({ where: { id } })
    if (!event) return errorResponse('Event not found', 404)

    if (!user) return errorResponse('Unauthorized', 401)

    // Organizer/admin can see all polls for their event
    // Registered users can see polls for published events
    if (user.role !== 'admin' && user.id !== event.organizerId) {
      if (event.status !== 'published') {
        return errorResponse('Event is not published', 403)
      }
      const registration = await db.registration.findFirst({
        where: { eventId: event.id, userId: user.id, status: { in: ['registered', 'attended'] } }
      })
      if (!registration) return errorResponse('You must be registered for this event', 403)
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Build where clause for status filter
    const now = new Date()
    const where: Record<string, unknown> = { eventId: id }
    if (status === 'open') {
      ;(where as Record<string, unknown>).isLive = true
      ;(where as Record<string, unknown>).OR = [
        { closesAt: null },
        { closesAt: { gt: now } }
      ]
    } else if (status === 'closed') {
      ;(where as Record<string, unknown>).OR = [
        { isLive: false },
        { closesAt: { lte: now } }
      ]
    }

    const polls = await db.poll.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { responses: true } },
        createdBy: { select: { id: true, name: true, image: true } }
      }
    })

    // Parse options for each poll
    const parsedPolls = polls.map(poll => ({
      ...poll,
      options: parseJsonField<string[]>(poll.options, [])
    }))

    return successResponse(parsedPolls)
  } catch (error) {
    console.error('GET /api/events/[id]/polls error:', error)
    return errorResponse('Failed to fetch polls', 500)
  }
}

// POST: Create a poll for an event
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

    if (user.role !== 'admin' && user.id !== event.organizerId) {
      return errorResponse('Only the event organizer or admin can create polls', 403)
    }

    const body = await request.json()
    const { question, options, allowMultiple, closesAt, isLive } = body

    if (!question || typeof question !== 'string' || !question.trim()) {
      return errorResponse('Question is required', 400)
    }

    if (!Array.isArray(options) || options.length < 2 || options.length > 10) {
      return errorResponse('Options must be an array of 2 to 10 strings', 400)
    }

    const validOptions = options.every(
      (opt: unknown) => typeof opt === 'string' && opt.trim().length > 0
    )
    if (!validOptions) {
      return errorResponse('Each option must be a non-empty string', 400)
    }

    // Check for duplicate options
    const trimmedOptions = options.map((opt: string) => opt.trim())
    if (new Set(trimmedOptions).size !== trimmedOptions.length) {
      return errorResponse('Options must be unique', 400)
    }

    const poll = await db.poll.create({
      data: {
        eventId: id,
        question: question.trim(),
        options: toJsonField(trimmedOptions),
        allowMultiple: typeof allowMultiple === 'boolean' ? allowMultiple : false,
        isLive: typeof isLive === 'boolean' ? isLive : true,
        closesAt: closesAt ? new Date(closesAt) : null,
        createdBy: user.id,
      },
      include: {
        _count: { select: { responses: true } },
        createdBy: { select: { id: true, name: true, image: true } }
      }
    })

    return successResponse({
      ...poll,
      options: parseJsonField<string[]>(poll.options, [])
    }, 201)
  } catch (error) {
    console.error('POST /api/events/[id]/polls error:', error)
    return errorResponse('Failed to create poll', 500)
  }
}
