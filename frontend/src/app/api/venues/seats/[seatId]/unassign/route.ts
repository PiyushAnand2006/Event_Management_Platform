import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'

// PATCH: Remove guest assignment from seat
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
        venue: { include: { event: { select: { organizerId: true } } } },
      },
    })
    if (!seat) return errorResponse('Seat not found', 404)

    if (user.role !== 'admin' && user.id !== seat.venue.event.organizerId) {
      return errorResponse('Only the event organizer can unassign seats', 403)
    }

    if (!seat.assignedGuestId) {
      return errorResponse('This seat is not assigned to any guest', 400)
    }

    // Transaction: clear both seat and registration references
    const result = await db.$transaction(async (tx) => {
      const registrationId = seat.assignedGuestId!

      const updatedSeat = await tx.seat.update({
        where: { id: seatId },
        data: {
          assignedGuestId: null,
          status: 'unoccupied',
        },
      })

      await tx.registration.update({
        where: { id: registrationId },
        data: { seatId: null },
      })

      // Log for potential Socket.IO event
      console.log(`[SeatUnassignment] Seat ${seatId} unassigned from registration ${registrationId}`)

      return { seat: updatedSeat, unassignedRegistrationId: registrationId }
    })

    return successResponse(result)
  } catch (error) {
    console.error('PATCH /api/venues/seats/[seatId]/unassign error:', error)
    return errorResponse('Failed to unassign seat', 500)
  }
}
