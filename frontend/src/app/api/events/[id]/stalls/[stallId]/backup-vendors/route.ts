import { db } from '@/lib/db'
import {
  successResponse,
  errorResponse,
  getServerUser,
} from '@/lib/api-utils'

// GET: List all backup vendors for a specific stall
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

    const stall = await db.foodStall.findUnique({ where: { id: stallId } })
    if (!stall || stall.eventId !== id) {
      return errorResponse('Stall not found', 404)
    }

    const vendors = await db.backupVendor.findMany({
      where: { triggeringStallId: stallId },
      orderBy: { createdAt: 'desc' },
    })

    return successResponse(vendors)
  } catch (error) {
    console.error(
      'GET /api/events/[id]/stalls/[stallId]/backup-vendors error:',
      error
    )
    return errorResponse('Failed to fetch backup vendors', 500)
  }
}

// POST: Add a manual backup vendor for a stall
export async function POST(
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
    const { name, phone, address, distanceKm } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return errorResponse('name is required', 400)
    }
    if (distanceKm === undefined || distanceKm === null) {
      return errorResponse('distanceKm is required', 400)
    }

    const vendor = await db.backupVendor.create({
      data: {
        eventId: id,
        triggeringStallId: stallId,
        name: name.trim(),
        phone: phone ? String(phone).trim() : null,
        address: address ? String(address).trim() : null,
        distanceKm: parseFloat(distanceKm) || 0,
        source: 'manual',
        contactStatus: 'unverified',
      },
    })

    return successResponse(vendor, 201)
  } catch (error) {
    console.error(
      'POST /api/events/[id]/stalls/[stallId]/backup-vendors error:',
      error
    )
    return errorResponse('Failed to add backup vendor', 500)
  }
}
