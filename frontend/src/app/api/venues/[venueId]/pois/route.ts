import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'
import { poiTypes } from '@/lib/venue-presets'

const validPoiTypes = poiTypes.map((p) => p.id)

// GET: Get all POIs for a venue
export async function GET(
  request: Request,
  { params }: { params: Promise<{ venueId: string }> }
) {
  try {
    const { venueId } = await params
    const user = await getServerUser()

    const venue = await db.venue.findUnique({
      where: { id: venueId },
      include: { event: { select: { organizerId: true, id: true } } },
    })
    if (!venue) return errorResponse('Venue not found', 404)

    // Access control: public for published, owner/co-organizer/admin for others
    if (venue.event) {
      const event = await db.event.findUnique({ where: { id: venue.event.id } })
      if (event && event.status !== 'published') {
        if (!user) return errorResponse('Venue not found', 404)
        if (user.role !== 'admin' && user.id !== venue.event.organizerId) {
          return errorResponse('Venue not found', 404)
        }
      }
    }

    const pois = await db.pOI.findMany({
      where: { venueId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    })

    return successResponse(pois)
  } catch (error) {
    console.error('GET /api/venues/[venueId]/pois error:', error)
    return errorResponse('Failed to fetch POIs', 500)
  }
}

// POST: Create POI for a venue
export async function POST(
  request: Request,
  { params }: { params: Promise<{ venueId: string }> }
) {
  try {
    const { venueId } = await params
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const venue = await db.venue.findUnique({
      where: { id: venueId },
      include: { event: { select: { organizerId: true } } },
    })
    if (!venue) return errorResponse('Venue not found', 404)

    if (user.role !== 'admin' && user.id !== venue.event.organizerId) {
      return errorResponse('Only the event organizer can create POIs', 403)
    }

    const body = await request.json()
    const { type, name, positionX, positionY, refId, icon, sortOrder } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return errorResponse('POI name is required', 400)
    }
    if (positionX === undefined || positionY === undefined) {
      return errorResponse('POI position (positionX, positionY) is required', 400)
    }
    if (!validPoiTypes.includes(type)) {
      return errorResponse(`Invalid POI type. Must be one of: ${validPoiTypes.join(', ')}`, 400)
    }

    const poi = await db.pOI.create({
      data: {
        venueId,
        type,
        name: name.trim(),
        positionX: parseFloat(positionX) || 0,
        positionY: parseFloat(positionY) || 0,
        refId: refId || null,
        icon: icon || 'map-pin',
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder, 10) : 0,
      },
    })

    return successResponse(poi, 201)
  } catch (error) {
    console.error('POST /api/venues/[venueId]/pois error:', error)
    return errorResponse('Failed to create POI', 500)
  }
}
