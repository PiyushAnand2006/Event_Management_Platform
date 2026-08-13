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

// GET: List stalls for an event (with optional status filter)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getServerUser()

    const event = await db.event.findUnique({ where: { id } })
    if (!event) return errorResponse('Event not found', 404)

    if (!user) return errorResponse('Unauthorized', 401)
    if (user.role !== 'admin' && user.id !== event.organizerId) {
      return errorResponse('Forbidden', 403)
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: Record<string, unknown> = { eventId: id }
    if (status) {
      where.contractStatus = status
    }

    const stalls = await db.foodStall.findMany({
      where,
      include: {
        backupVendors: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return successResponse(stalls)
  } catch (error) {
    console.error('GET /api/events/[id]/stalls error:', error)
    return errorResponse('Failed to fetch stalls', 500)
  }
}

// POST: Create a food stall
export async function POST(
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
      return errorResponse('Forbidden', 403)
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
    } = body

    if (!ownerName || typeof ownerName !== 'string' || !ownerName.trim()) {
      return errorResponse('ownerName is required', 400)
    }
    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return errorResponse('phone is required', 400)
    }
    if (!stallType || !VALID_STALL_TYPES.includes(stallType)) {
      return errorResponse(
        `stallType is required and must be one of: ${VALID_STALL_TYPES.join(', ')}`,
        400
      )
    }

    // Check if venue exists for this event (needed for POI creation)
    const venue = await db.venue.findUnique({ where: { eventId: id } })

    // Create the stall
    const stall = await db.foodStall.create({
      data: {
        eventId: id,
        ownerName: ownerName.trim(),
        phone: phone.trim(),
        stallType,
        cuisineType: cuisineType ? String(cuisineType).trim() : null,
        contractStatus: 'pending',
        locationX:
          locationX !== undefined && locationX !== null
            ? parseFloat(locationX)
            : null,
        locationY:
          locationY !== undefined && locationY !== null
            ? parseFloat(locationY)
            : null,
        notes: notes ? String(notes).trim() : null,
        photoUrl: photoUrl ? String(photoUrl).trim() : null,
      },
    })

    // Auto-create a POI of type 'food_stall' if venue exists and location is provided
    if (venue && stall.locationX !== null && stall.locationY !== null) {
      await db.pOI.create({
        data: {
          venueId: venue.id,
          type: 'food_stall',
          name: `${stall.ownerName} (${stall.stallType})`,
          positionX: stall.locationX,
          positionY: stall.locationY,
          refId: stall.id,
          icon: 'utensils',
        },
      })
    }

    // Fetch the stall with backup vendors for response
    const createdStall = await db.foodStall.findUnique({
      where: { id: stall.id },
      include: {
        backupVendors: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    return successResponse(createdStall, 201)
  } catch (error) {
    console.error('POST /api/events/[id]/stalls error:', error)
    return errorResponse('Failed to create stall', 500)
  }
}
