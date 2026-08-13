import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'

// PATCH: Assign guest (registration) to seat
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ seatId: string }> }
) {
  try {
    const { seatId } = await params
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const seat = await db.seat.findUnique({
      where: { id: seatId },
      include: {
        venue: { include: { event: { select: { organizerId: true, id: true } } } },
      },
    })
    if (!seat) return errorResponse('Seat not found', 404)

    if (user.role !== 'admin' && user.id !== seat.venue.event.organizerId) {
      return errorResponse('Only the event organizer can assign seats', 403)
    }

    if (seat.assignedGuestId) {
      return errorResponse('This seat is already assigned. Unassign first.', 409)
    }

    if (seat.status === 'blocked') {
      return errorResponse('This seat is blocked and cannot be assigned', 400)
    }

    const body = await request.json()
    const { registrationId } = body

    if (!registrationId || typeof registrationId !== 'string') {
      return errorResponse('registrationId is required', 400)
    }

    // Verify registration exists and belongs to the same event
    const registration = await db.registration.findUnique({
      where: { id: registrationId },
      include: { user: { select: { id: true, name: true, email: true } } },
    })
    if (!registration) return errorResponse('Registration not found', 404)

    if (registration.eventId !== seat.venue.event.id) {
      return errorResponse('Registration does not belong to this event', 400)
    }

    if (registration.seatId) {
      return errorResponse('Registration is already assigned to a seat', 409)
    }

    // Transaction: assign seat to registration and vice versa
    const result = await db.$transaction(async (tx) => {
      const updatedSeat = await tx.seat.update({
        where: { id: seatId },
        data: {
          assignedGuestId: registrationId,
          status: 'occupied',
        },
      })

      const updatedRegistration = await tx.registration.update({
        where: { id: registrationId },
        data: { seatId },
      })

      // Log for potential Socket.IO event
      console.log(`[SeatAssignment] Seat ${seatId} assigned to registration ${registrationId}`)

      return { seat: updatedSeat, registration: updatedRegistration }
    })

    return successResponse(result)
  } catch (error) {
    console.error('PATCH /api/venues/seats/[seatId]/assign error:', error)
    return errorResponse('Failed to assign seat', 500)
  }
}
