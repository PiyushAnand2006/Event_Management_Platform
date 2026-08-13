import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'

// PATCH: Upvote a Q&A question
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)

    // Auth: registered user
    const question = await db.qnAQuestion.findUnique({
      where: { id },
      include: { event: { select: { id: true } } }
    })
    if (!question) return errorResponse('Question not found', 404)

    const registration = await db.registration.findFirst({
      where: {
        eventId: question.event.id,
        userId: user.id,
        status: { in: ['registered', 'attended'] }
      }
    })
    if (!registration) return errorResponse('You must be registered for this event', 403)

    // Parse upvotedBy array
    let upvotedBy: string[] = []
    try {
      upvotedBy = JSON.parse(question.upvotedBy || '[]')
    } catch {
      upvotedBy = []
    }

    // Check if user already upvoted
    if (upvotedBy.includes(user.id)) {
      return errorResponse('You have already upvoted this question', 409)
    }

    // Add user and increment
    upvotedBy.push(user.id)
    const updated = await db.qnAQuestion.update({
      where: { id },
      data: {
        upvotes: { increment: 1 },
        upvotedBy: JSON.stringify(upvotedBy)
      },
      include: {
        user: { select: { id: true, name: true, image: true } }
      }
    })

    return successResponse({
      ...updated,
      upvotedBy,
      isUpvotedByMe: true
    })
  } catch (error) {
    console.error('PATCH /api/qna/[id]/upvote error:', error)
    return errorResponse('Failed to upvote question', 500)
  }
}
