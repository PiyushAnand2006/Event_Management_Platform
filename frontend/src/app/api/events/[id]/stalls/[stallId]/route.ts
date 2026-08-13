import { db } from '@/lib/db'
import {
  successResponse,
  errorResponse,
  getServerUser,
} from '@/lib/api-utils'

const VALID_STALL_TYPES = [
  'food',
  'beverage',
  'dessert',
  'decor',
  'photography',
  'other',
]

const VALID_CONTRACT_STATUSES = ['pending', 'confirmed', 'declined', 'cancelled']

// GET: Single stall with backup vendors
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; stallId: string }> }
) {
  try {
    const { id, stallId } = await params
    const user = await getServerUser()

    const event = await db.event.findUnique({ where: { id } })
    if (!event) return errorResponse('Event not found', 404)

    if (!user) return errorResponse('Unauthorized', 401)
    if (user.role !== 'admin' && user.id !== event.organizerId) {
      return errorResponse('Forbidden', 403)
    }

    const stall = await db.foodStall.findUnique({
      where: { id: stallId },
      include: {
        backupVendors: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!stall || stall.eventId !== id) {
      return errorResponse('Stall not found', 404)
    }

    return successResponse(stall)
  } catch (error) {
    console.error('GET /api/events/[id]/stalls/[stallId] error:', error)
    return errorResponse('Failed to fetch stall', 500)
  }
}

// PUT: Update stall fields
export async function PUT(
  request: Request,
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

    const body = await request.json()
    const {
      ownerName,
      phone,
      stallType,
      cuisineType,
      locationX,
      locationY,
      notes,
      photoUrl,
      contractStatus,
    } = body

    const updateData: Record<string, unknown> = {}

    if (ownerName !== undefined) {
      if (typeof ownerName !== 'string' || !ownerName.trim()) {
        return errorResponse('ownerName must be a non-empty string', 400)
      }
      updateData.ownerName = ownerName.trim()
    }
    if (phone !== undefined) {
      if (typeof phone !== 'string' || !phone.trim()) {
        return errorResponse('phone must be a non-empty string', 400)
      }
      updateData.phone = phone.trim()
    }
    if (stallType !== undefined) {
      if (!VALID_STALL_TYPES.includes(stallType)) {
        return errorResponse(
          `stallType must be one of: ${VALID_STALL_TYPES.join(', ')}`,
          400
        )
      }
      updateData.stallType = stallType
    }
    if (cuisineType !== undefined) {
      updateData.cuisineType = cuisineType
        ? String(cuisineType).trim()
        : null
    }
    if (locationX !== undefined) {
      updateData.locationX =
        locationX !== null ? parseFloat(locationX) : null
    }
    if (locationY !== undefined) {
      updateData.locationY =
        locationY !== null ? parseFloat(locationY) : null
    }
    if (notes !== undefined) {
      updateData.notes = notes ? String(notes).trim() : null
    }
    if (photoUrl !== undefined) {
      updateData.photoUrl = photoUrl ? String(photoUrl).trim() : null
    }
    if (contractStatus !== undefined) {
      if (!VALID_CONTRACT_STATUSES.includes(contractStatus)) {
        return errorResponse(
          `contractStatus must be one of: ${VALID_CONTRACT_STATUSES.join(', ')}`,
          400
        )
      }
      updateData.contractStatus = contractStatus

      // When contractStatus changes to 'declined', trigger backup vendor search
      if (contractStatus === 'declined' && stall.contractStatus !== 'declined') {
        // Check if there are already backup vendors for this stall
        const existingBackups = await db.backupVendor.count({
          where: { triggeringStallId: stallId },
        })

        if (existingBackups === 0) {
          // Auto-create a placeholder backup vendor entry to signal search needed
          await db.backupVendor.create({
            data: {
              eventId: id,
              triggeringStallId: stallId,
              name: `[Auto-search needed for ${stall.stallType} vendor]`,
              distanceKm: 0,
              source: 'manual',
              contactStatus: 'unverified',
            },
          })
        }
      }
    }

    const updated = await db.foodStall.update({
      where: { id: stallId },
      data: updateData,
      include: {
        backupVendors: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    return successResponse(updated)
  } catch (error) {
    console.error('PUT /api/events/[id]/stalls/[stallId] error:', error)
    return errorResponse('Failed to update stall', 500)
  }
}

// DELETE: Delete stall and its POI
export async function DELETE(
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

    // Delete the POI linked to this stall (if any)
    const venue = await db.venue.findUnique({ where: { eventId: id } })
    if (venue) {
      await db.pOI.deleteMany({
        where: { venueId: venue.id, refId: stallId },
      })
    }

    // Delete the stall (backupVendors cascade via onDelete: Cascade)
    await db.foodStall.delete({ where: { id: stallId } })

    return successResponse({ deleted: true })
  } catch (error) {
    console.error('DELETE /api/events/[id]/stalls/[stallId] error:', error)
    return errorResponse('Failed to delete stall', 500)
  }
}
