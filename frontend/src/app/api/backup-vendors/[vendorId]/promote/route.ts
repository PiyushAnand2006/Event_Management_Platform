import { db } from '@/lib/db'
import {
  successResponse,
  errorResponse,
  getServerUser,
} from '@/lib/api-utils'
import { createNotification } from '@/lib/notification-helper'

// POST: Promote a backup vendor to an active food stall
export async function POST(
  _request: Request,
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

    // If already promoted, return error
    if (vendor.promotedToStallId) {
      return errorResponse('Vendor has already been promoted', 409)
    }

    // Verify the user has access to the event
    const event = await db.event.findUnique({ where: { id: vendor.eventId } })
    if (!event) return errorResponse('Event not found', 404)
    if (user.role !== 'admin' && user.id !== event.organizerId) {
      return errorResponse('Forbidden', 403)
    }

    // Get the triggering stall to copy stallType
    const triggeringStall = await db.foodStall.findUnique({
      where: { id: vendor.triggeringStallId },
    })
    if (!triggeringStall) {
      return errorResponse('Triggering stall not found', 404)
    }

    // Check if venue exists for POI creation
    const venue = await db.venue.findUnique({
      where: { eventId: vendor.eventId },
    })

    // Create new FoodStall from vendor data
    const newStall = await db.foodStall.create({
      data: {
        eventId: vendor.eventId,
        ownerName: vendor.name,
        phone: vendor.phone || '',
        stallType: triggeringStall.stallType,
        cuisineType: triggeringStall.cuisineType,
        contractStatus: 'confirmed',
        locationX: triggeringStall.locationX,
        locationY: triggeringStall.locationY,
        notes: `Promoted from backup vendor. Original: ${triggeringStall.ownerName}`,
      },
    })

    // Create POI for the new stall if venue exists and location available
    if (venue && triggeringStall.locationX !== null && triggeringStall.locationY !== null) {
      await db.pOI.create({
        data: {
          venueId: venue.id,
          type: 'food_stall',
          name: `${newStall.ownerName} (${newStall.stallType})`,
          positionX: triggeringStall.locationX,
          positionY: triggeringStall.locationY,
          refId: newStall.id,
          icon: 'utensils',
        },
      })
    }

    // Link the vendor to the new stall
    await db.backupVendor.update({
      where: { id: vendorId },
      data: {
        promotedToStallId: newStall.id,
        contactStatus: 'confirmed',
      },
    })

    // Notify organizer about successful promotion
    await createNotification(
      event.organizerId,
      'vendor_fallback_ready',
      'Backup Vendor Promoted',
      `${vendor.name} has been promoted to replace ${triggeringStall.ownerName} for event "${event.title}".`,
      {
        eventId: vendor.eventId,
        newStallId: newStall.id,
        vendorId,
        oldStallId: triggeringStall.id,
      }
    )

    // Fetch the newly created stall for response
    const stallWithVendors = await db.foodStall.findUnique({
      where: { id: newStall.id },
      include: {
        backupVendors: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    return successResponse(stallWithVendors, 201)
  } catch (error) {
    console.error('POST /api/backup-vendors/[vendorId]/promote error:', error)
    return errorResponse('Failed to promote backup vendor', 500)
  }
}
