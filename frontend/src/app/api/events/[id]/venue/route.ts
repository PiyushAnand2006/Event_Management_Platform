import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'

// GET: Get venue with all sections and seats for an event
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getServerUser()

    const event = await db.event.findUnique({ where: { id } })
    if (!event) return errorResponse('Event not found', 404)

    // Access control: public for published, owner/co-organizer/admin for others
    if (event.status !== 'published') {
      if (!user) return errorResponse('Event not found', 404)
      const isOwner = user.id === event.organizerId
      const isCoOrganizer = await db.coOrganizer.count({
        where: { eventId: id, userId: user.id },
      })
      if (user.role !== 'admin' && !isOwner && !isCoOrganizer) {
        return errorResponse('Event not found', 404)
      }
    }

    const venue = await db.venue.findUnique({
      where: { eventId: id },
      include: {
        sections: {
          include: {
            seats: {
              include: {
                assignedGuest: {
                  select: { id: true, userId: true, eventId: true, status: true },
                },
              },
              orderBy: [{ label: 'asc' }],
            },
          },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        },
        seats: {
          include: {
            assignedGuest: {
              select: { id: true, userId: true, eventId: true, status: true },
            },
          },
        },
        pois: {
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        },
      },
    })

    // If no venue exists, return null data
    if (!venue) {
      return successResponse(null)
    }

    return successResponse(venue)
  } catch (error) {
    console.error('GET /api/events/[id]/venue error:', error)
    return errorResponse('Failed to fetch venue', 500)
  }
}

// POST: Create venue for an event
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
      return errorResponse('Only the event organizer can create a venue', 403)
    }

    // Check if venue already exists for this event
    const existing = await db.venue.findUnique({ where: { eventId: id } })
    if (existing) return errorResponse('Venue already exists for this event', 409)

    const body = await request.json()
    const { name, width, height, coordinates } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return errorResponse('Venue name is required', 400)
    }

    const venue = await db.venue.create({
      data: {
        name: name.trim(),
        eventId: id,
        width: width ? parseFloat(width) : 100,
        height: height ? parseFloat(height) : 100,
        coordinates: coordinates ? JSON.stringify(coordinates) : null,
      },
      include: {
        sections: {
          include: {
            seats: {
              orderBy: [{ label: 'asc' }],
            },
          },
          orderBy: [{ sortOrder: 'asc' }],
        },
        pois: {
          orderBy: [{ sortOrder: 'asc' }],
        },
      },
    })

    return successResponse(venue, 201)
  } catch (error) {
    console.error('POST /api/events/[id]/venue error:', error)
    return errorResponse('Failed to create venue', 500)
  }
}

// PUT: Update venue name/dimensions
export async function PUT(
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
      return errorResponse('Only the event organizer can update the venue', 403)
    }

    const venue = await db.venue.findUnique({ where: { eventId: id } })
    if (!venue) return errorResponse('Venue not found for this event', 404)

    const body = await request.json()
    const { name, width, height, coordinates } = body

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return errorResponse('Venue name must be a non-empty string', 400)
      }
      updateData.name = name.trim()
    }
    if (width !== undefined) updateData.width = Math.max(10, parseFloat(width) || 100)
    if (height !== undefined) updateData.height = Math.max(10, parseFloat(height) || 100)
    if (coordinates !== undefined) {
      updateData.coordinates = coordinates ? JSON.stringify(coordinates) : null
    }

    const updated = await db.venue.update({
      where: { id: venue.id },
      data: updateData,
      include: {
        sections: {
          include: {
            seats: {
              orderBy: [{ label: 'asc' }],
            },
          },
          orderBy: [{ sortOrder: 'asc' }],
        },
        pois: {
          orderBy: [{ sortOrder: 'asc' }],
        },
      },
    })

    return successResponse(updated)
  } catch (error) {
    console.error('PUT /api/events/[id]/venue error:', error)
    return errorResponse('Failed to update venue', 500)
  }
}

// DELETE: Delete venue and all sections/seats/pois (cascade)
export async function DELETE(
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
      return errorResponse('Only the event organizer can delete the venue', 403)
    }

    const venue = await db.venue.findUnique({ where: { eventId: id } })
    if (!venue) return errorResponse('Venue not found for this event', 404)

    await db.venue.delete({ where: { id: venue.id } })
    return successResponse({ deleted: true })
  } catch (error) {
    console.error('DELETE /api/events/[id]/venue error:', error)
    return errorResponse('Failed to delete venue', 500)
  }
}
