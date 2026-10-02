import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser, toJsonField, parseJsonField } from '@/lib/api-utils'

function computePollResults(poll: { id: string; options: string; allowMultiple: boolean }, responses: { selectedOptions: string }[]) {
  const options = parseJsonField<string[]>(poll.options, [])
  const voteCounts: Record<number, number> = {}
  for (let i = 0; i < options.length; i++) {
    voteCounts[i] = 0
  }
  for (const resp of responses) {
    const selected = parseJsonField<number[]>(resp.selectedOptions, [])
    for (const idx of selected) {
      if (idx >= 0 && idx < options.length) {
        voteCounts[idx] = (voteCounts[idx] || 0) + 1
      }
    }
  }
  return {
    options: options.map((text, idx) => ({
      index: idx,
      text,
      votes: voteCounts[idx] || 0
    })),
    totalResponses: responses.length,
    totalVotes: responses.reduce((sum, resp) => {
      const selected = parseJsonField<number[]>(resp.selectedOptions, [])
      return sum + selected.length
    }, 0)
  }
}

// GET: Single poll with response counts
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const poll = await db.poll.findUnique({
      where: { id },
      include: {
        event: { select: { id: true, organizerId: true, status: true } },
        responses: true
      }
    })
    if (!poll) return errorResponse('Poll not found', 404)

    // Auth: registered user or organizer/admin
    if (user.role !== 'admin' && user.id !== poll.event.organizerId) {
      if (poll.event.status !== 'published') {
        return errorResponse('Event is not published', 403)
      }
      const registration = await db.registration.findFirst({
        where: {
          eventId: poll.event.id,
          userId: user.id,
          status: { in: ['registered', 'attended'] }
        }
      })
      if (!registration) return errorResponse('You must be registered for this event', 403)
    }

    // Check if current user already voted
    const existingVote = poll.responses.find(r => r.userId === user.id)

    const results = computePollResults(poll, poll.responses)

    return successResponse({
      id: poll.id,
      eventId: poll.eventId,
      question: poll.question,
      options: parseJsonField<string[]>(poll.options, []),
      allowMultiple: poll.allowMultiple,
      isLive: poll.isLive,
      closesAt: poll.closesAt,
      createdAt: poll.createdAt,
      updatedAt: poll.updatedAt,
      createdBy: poll.createdBy,
      hasVoted: !!existingVote,
      userSelectedOptions: existingVote
        ? parseJsonField<number[]>(existingVote.selectedOptions, [])
        : null,
      results
    })
  } catch (error) {
    console.error('GET /api/polls/[id] error:', error)
    return errorResponse('Failed to fetch poll', 500)
  }
}

// PATCH: Update a poll
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const poll = await db.poll.findUnique({
      where: { id },
      include: { event: { select: { organizerId: true } } }
    })
    if (!poll) return errorResponse('Poll not found', 404)

    if (user.role !== 'admin' && user.id !== poll.event.organizerId) {
      return errorResponse('Only the event organizer or admin can update this poll', 403)
    }

    const body = await request.json()
    const { question, options, allowMultiple, closesAt, isLive } = body

    const updateData: Record<string, unknown> = {}

    if (question !== undefined) {
      if (typeof question !== 'string' || !question.trim()) {
        return errorResponse('Question must be a non-empty string', 400)
      }
      updateData.question = question.trim()
    }

    if (options !== undefined) {
      if (!Array.isArray(options) || options.length < 2 || options.length > 10) {
        return errorResponse('Options must be an array of 2 to 10 strings', 400)
      }
      const validOptions = options.every(
        (opt: unknown) => typeof opt === 'string' && opt.trim().length > 0
      )
      if (!validOptions) {
        return errorResponse('Each option must be a non-empty string', 400)
      }
      const trimmedOptions = options.map((opt: string) => opt.trim())
      if (new Set(trimmedOptions).size !== trimmedOptions.length) {
        return errorResponse('Options must be unique', 400)
      }
      updateData.options = toJsonField(trimmedOptions)
    }

    if (allowMultiple !== undefined) {
      if (typeof allowMultiple !== 'boolean') {
        return errorResponse('allowMultiple must be a boolean', 400)
      }
      updateData.allowMultiple = allowMultiple
    }

    if (closesAt !== undefined) {
      updateData.closesAt = closesAt ? new Date(closesAt) : null
    }

    if (isLive !== undefined) {
      if (typeof isLive !== 'boolean') {
        return errorResponse('isLive must be a boolean', 400)
      }
      updateData.isLive = isLive
    }

    const updatedPoll = await db.poll.update({
      where: { id },
      data: updateData,
      include: {
        _count: { select: { responses: true } }
      }
    })

    return successResponse({
      ...updatedPoll,
      options: parseJsonField<string[]>(updatedPoll.options, [])
    })
  } catch (error) {
    console.error('PATCH /api/polls/[id] error:', error)
    return errorResponse('Failed to update poll', 500)
  }
}

// DELETE: Delete a poll and all its responses
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const poll = await db.poll.findUnique({
      where: { id },
      include: { event: { select: { organizerId: true } } }
    })
    if (!poll) return errorResponse('Poll not found', 404)

    if (user.role !== 'admin' && user.id !== poll.event.organizerId) {
      return errorResponse('Only the event organizer or admin can delete this poll', 403)
    }

    // Delete all responses first, then the poll (cascade handled by schema)
    await db.pollResponse.deleteMany({ where: { pollId: id } })
    await db.poll.delete({ where: { id } })

    return successResponse({ message: 'Poll deleted successfully' })
  } catch (error) {
    console.error('DELETE /api/polls/[id] error:', error)
    return errorResponse('Failed to delete poll', 500)
  }
}
