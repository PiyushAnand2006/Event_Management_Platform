import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'

// PATCH: Answer a Q&A question
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const question = await db.qnAQuestion.findUnique({
      where: { id },
      include: { event: { select: { organizerId: true } } }
    })
    if (!question) return errorResponse('Question not found', 404)

    if (user.role !== 'admin' && user.id !== question.event.organizerId) {
      return errorResponse('Only the event organizer or admin can answer questions', 403)
    }

    const body = await request.json()
    const { answerText } = body

    if (!answerText || typeof answerText !== 'string' || !answerText.trim()) {
      return errorResponse('answerText is required', 400)
    }

    const updated = await db.qnAQuestion.update({
      where: { id },
      data: {
        answerText: answerText.trim(),
        isAnswered: true,
      },
      include: {
        user: { select: { id: true, name: true, image: true } }
      }
    })

    return successResponse({
      ...updated,
      upvotedBy: JSON.parse(updated.upvotedBy || '[]')
    })
  } catch (error) {
    console.error('PATCH /api/qna/[id]/answer error:', error)
    return errorResponse('Failed to answer question', 500)
  }
}
