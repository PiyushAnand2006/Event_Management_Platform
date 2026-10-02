import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser, parseJsonField } from '@/lib/api-utils'
import { computePollResults } from '@/lib/poll-utils'

// POST: Submit a vote on a poll
export async function POST(
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

    // Check user is registered for the event
    const registration = await db.registration.findFirst({
      where: {
        eventId: poll.event.id,
        userId: user.id,
        status: { in: ['registered', 'attended'] }
      }
    })
    if (!registration) return errorResponse('You must be registered for this event', 403)

    // Validate poll is live
    if (!poll.isLive) {
      return errorResponse('This poll is no longer live', 400)
    }

    // Check if poll has closed
    if (poll.closesAt && new Date(poll.closesAt) <= new Date()) {
      return errorResponse('This poll has closed', 400)
    }

    const body = await request.json()
    const { selectedOptions } = body

    if (!Array.isArray(selectedOptions) || selectedOptions.length === 0) {
      return errorResponse('selectedOptions must be a non-empty array of indices', 400)
    }

    // Validate all indices are numbers and within range
    const options = parseJsonField<string[]>(poll.options, [])
    const validIndices = selectedOptions.every(
      (idx: unknown) => typeof idx === 'number' && Number.isInteger(idx) && idx >= 0 && idx < options.length
    )
    if (!validIndices) {
      return errorResponse('Each selected option must be a valid index into the options array', 400)
    }

    // Check for duplicate indices
    if (new Set(selectedOptions).size !== selectedOptions.length) {
      return errorResponse('Duplicate option selections are not allowed', 400)
    }

    // Validate single vs multiple selection
    if (!poll.allowMultiple && selectedOptions.length !== 1) {
      return errorResponse('This poll only allows a single selection', 400)
    }

    // Check if user already voted
    const existingVote = poll.responses.find(r => r.userId === user.id)
    if (existingVote) {
      return errorResponse('You have already voted on this poll', 409)
    }

    // Create the vote
    await db.pollResponse.create({
      data: {
        pollId: id,
        userId: user.id,
        selectedOptions: JSON.stringify(selectedOptions)
      }
    })

    // Fetch updated poll with all responses for results
    const updatedPoll = await db.poll.findUnique({
      where: { id },
      include: { responses: true }
    })

    const results = computePollResults(updatedPoll!, updatedPoll!.responses)

    return successResponse({
      message: 'Vote submitted successfully',
      results
    })
  } catch (error) {
    console.error('POST /api/polls/[id]/vote error:', error)
    return errorResponse('Failed to submit vote', 500)
  }
}
