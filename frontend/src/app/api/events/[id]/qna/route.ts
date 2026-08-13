import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'

// GET: List Q&A questions for an event
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

    // Organizer sees all, guest sees only approved
    const where: Record<string, unknown> = { eventId: id }
    if (!isOrganizer) {
      where.isApproved = true
    }

    const questions = await db.qnAQuestion.findMany({
      where,
      orderBy: [{ isAnswered: 'asc' }, { upvotes: 'desc' }, { createdAt: 'asc' }],
      include: {
        user: { select: { id: true, name: true, image: true } }
      }
    })

    // Parse upvotedBy for each question and check if current user upvoted
    const parsedQuestions = questions.map(q => {
      const upvotedBy: string[] = JSON.parse(q.upvotedBy || '[]')
      return {
        ...q,
        upvotedBy,
        isUpvotedByMe: upvotedBy.includes(user.id)
      }
    })

    return successResponse(parsedQuestions)
  } catch (error) {
    console.error('GET /api/events/[id]/qna error:', error)
    return errorResponse('Failed to fetch questions', 500)
  }
}

// POST: Submit a Q&A question
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
    const { text } = body

    if (!text || typeof text !== 'string' || text.trim().length < 10) {
      return errorResponse('Question text is required and must be at least 10 characters', 400)
    }

    const question = await db.qnAQuestion.create({
      data: {
        eventId: id,
        askedBy: user.id,
        text: text.trim(),
        upvotes: 0,
        upvotedBy: '[]',
        isApproved: false,
        isAnswered: false,
      },
      include: {
        user: { select: { id: true, name: true, image: true } }
      }
    })

    return successResponse({
      ...question,
      upvotedBy: [],
      isUpvotedByMe: false
    }, 201)
  } catch (error) {
    console.error('POST /api/events/[id]/qna error:', error)
    return errorResponse('Failed to submit question', 500)
  }
}
