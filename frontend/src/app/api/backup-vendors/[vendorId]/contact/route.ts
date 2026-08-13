import { db } from '@/lib/db'
import {
  successResponse,
  errorResponse,
  getServerUser,
} from '@/lib/api-utils'

const VALID_CONTACT_STATUSES = ['contacted', 'confirmed']

// PATCH: Update vendor contactStatus
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  try {
    const { vendorId } = await params
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const vendor = await db.backupVendor.findUnique({
      where: { id: vendorId },
    })
    if (!vendor) return errorResponse('Backup vendor not found', 404)

    // Verify the user has access to the event
    const event = await db.event.findUnique({ where: { id: vendor.eventId } })
    if (!event) return errorResponse('Event not found', 404)
    if (user.role !== 'admin' && user.id !== event.organizerId) {
      return errorResponse('Forbidden', 403)
    }

    // If already promoted, prevent status change
    if (vendor.promotedToStallId) {
      return errorResponse('Cannot update contact status for an already promoted vendor', 409)
    }

    const body = await request.json()
    const { contactStatus } = body

    if (!contactStatus || !VALID_CONTACT_STATUSES.includes(contactStatus)) {
      return errorResponse(
        `contactStatus must be one of: ${VALID_CONTACT_STATUSES.join(', ')}`,
        400
      )
    }

    const updated = await db.backupVendor.update({
      where: { id: vendorId },
      data: { contactStatus },
    })

    return successResponse(updated)
  } catch (error) {
    console.error('PATCH /api/backup-vendors/[vendorId]/contact error:', error)
    return errorResponse('Failed to update vendor contact status', 500)
  }
}
