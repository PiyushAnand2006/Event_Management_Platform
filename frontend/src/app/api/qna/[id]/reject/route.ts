import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'

// PATCH: Reject (delete) a Q&A question
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
      return errorResponse('Only the event organizer or admin can reject questions', 403)
    }

    await db.qnAQuestion.delete({ where: { id } })

    return successResponse({ message: 'Question rejected and deleted successfully' })
  } catch (error) {
    console.error('PATCH /api/qna/[id]/reject error:', error)
    return errorResponse('Failed to reject question', 500)
  }
}
