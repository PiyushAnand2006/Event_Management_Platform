import { db } from '@/lib/db'
import {
  successResponse,
  errorResponse,
  getServerUser,
} from '@/lib/api-utils'
import { createNotification } from '@/lib/notification-helper'

// POST: Mark stall as declined and notify organizer
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string; stallId: string }> }
) {
  try {
    const { id, stallId } = await params
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const event = await db.event.findUnique({ where: { id } })
    if (!event) return errorResponse('Event not found', 404)
    if (user.role !== 'admin' && user.id !== event.organizerId) {
      return errorResponse('Forbidden', 403)
    }

    const stall = await db.foodStall.findUnique({ where: { id: stallId } })
    if (!stall || stall.eventId !== id) {
      return errorResponse('Stall not found', 404)
    }

    if (stall.contractStatus === 'declined') {
      return errorResponse('Stall is already declined', 409)
    }

    // Mark as declined
    const updated = await db.foodStall.update({
      where: { id: stallId },
      data: { contractStatus: 'declined' },
      include: {
        backupVendors: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    // Create notification to organizer about vendor decline
    await createNotification(
      event.organizerId,
      'vendor_declined',
      'Vendor Declined',
      `${stall.ownerName} (${stall.stallType}) has declined the contract for event "${event.title}". Backup vendors are being searched.`,
      {
        eventId: id,
        stallId,
        stallType: stall.stallType,
        ownerName: stall.ownerName,
      }
    )

    return successResponse({
      stall: updated,
      message:
        'Stall marked as declined. Backup vendor search has been initiated.',
    })
  } catch (error) {
    console.error('POST /api/events/[id]/stalls/[stallId]/decline error:', error)
    return errorResponse('Failed to decline stall', 500)
  }
}
