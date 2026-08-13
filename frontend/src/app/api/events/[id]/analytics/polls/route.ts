import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'
import { parseJsonField } from '@/lib/api-utils'

type PollOption = { text: string; votes: number }

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

    if (user.role !== 'admin' && user.id !== event.organizerId) {
      const isCoOrg = await db.coOrganizer.findUnique({
        where: { eventId_userId: { eventId: id, userId: user.id } },
      })
      if (!isCoOrg) return errorResponse('Access denied', 403)
    }

    const polls = await db.poll.findMany({
      where: { eventId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { responses: true } },
      },
    })

    const pollList = polls.map((poll) => {
      const options = parseJsonField<PollOption[]>(poll.options, [])
      const totalVotes = options.reduce((sum, o) => sum + (o.votes || 0), 0)
      return {
        id: poll.id,
        question: poll.question,
        options: options.map((o) => ({
          text: o.text,
          votes: o.votes || 0,
          percentage:
            totalVotes > 0
              ? Number(((o.votes || 0) / totalVotes * 100).toFixed(1))
              : 0,
        })),
        responseCount: poll._count.responses,
        isLive: poll.isLive,
        allowMultiple: poll.allowMultiple,
        createdAt: poll.createdAt.toISOString(),
      }
    })

    return successResponse({ polls: pollList })
  } catch (error) {
    console.error('GET /api/events/[id]/analytics/polls error:', error)
    return errorResponse('Failed to fetch poll analytics', 500)
  }
}
