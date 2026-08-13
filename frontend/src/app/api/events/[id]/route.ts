import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser, parseJsonField, toJsonField } from '@/lib/api-utils'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getServerUser()

    const event = await db.event.findUnique({
      where: { id },
      include: {
        organizer: { select: { id: true, name: true, image: true, email: true } },
        coOrganizers: { include: { user: { select: { id: true, name: true, image: true } } } },
        _count: { select: { reviews: true, bookmarks: true, registrations: true } },
      },
    })

    if (!event) return errorResponse('Event not found', 404)

    // Access control: public for published, owner for others
    if (event.status !== 'published') {
      if (!user) return errorResponse('Event not found', 404)
      if (user.role !== 'admin' && user.id !== event.organizerId) {
        return errorResponse('Event not found', 404)
      }
    }

    return successResponse({
      ...event,
      tags: parseJsonField(event.tags, []),
      coordinates: event.coordinates ? parseJsonField(event.coordinates, null) : null,
      reviewCount: event._count.reviews,
      bookmarkCount: event._count.bookmarks,
      registrationCount: event._count.registrations,
      _count: undefined,
    })
  } catch (error) {
    console.error('GET /api/events/[id] error:', error)
    return errorResponse('Failed to fetch event', 500)
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const existing = await db.event.findUnique({ where: { id } })
    if (!existing) return errorResponse('Event not found', 404)

    if (user.role !== 'admin' && user.id !== existing.organizerId) {
      return errorResponse('You can only edit your own events', 403)
    }

    const body = await request.json()
    const { title, description, type, category, date, endTime, location, coordinates, capacity, price, isFree, tags } = body

    const validTypes = ['conference', 'seminar', 'hackathon', 'wedding', 'private_ceremony', 'other']

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title.trim()
    if (description !== undefined) updateData.description = description.trim()
    if (type !== undefined && validTypes.includes(type)) updateData.type = type
    if (category !== undefined) updateData.category = category.trim()
    if (date !== undefined) updateData.date = new Date(date)
    if (endTime !== undefined) updateData.endTime = endTime ? new Date(endTime) : null
    if (location !== undefined) updateData.location = location.trim()
    if (coordinates !== undefined) updateData.coordinates = coordinates ? JSON.stringify(coordinates) : null
    if (capacity !== undefined) updateData.capacity = Math.max(0, parseInt(capacity, 10) || 0)
    if (price !== undefined) {
      updateData.price = Math.max(0, parseFloat(price) || 0)
      updateData.isFree = updateData.price === 0
    }
    if (isFree !== undefined) updateData.isFree = isFree
    if (tags !== undefined) updateData.tags = toJsonField(tags)

    const event = await db.event.update({
      where: { id },
      data: updateData,
      include: { organizer: { select: { id: true, name: true, image: true } } },
    })

    return successResponse({
      ...event,
      tags: parseJsonField(event.tags, []),
      coordinates: event.coordinates ? parseJsonField(event.coordinates, null) : null,
    })
  } catch (error) {
    console.error('PUT /api/events/[id] error:', error)
    return errorResponse('Failed to update event', 500)
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const existing = await db.event.findUnique({ where: { id } })
    if (!existing) return errorResponse('Event not found', 404)

    if (user.role !== 'admin' && user.id !== existing.organizerId) {
      return errorResponse('You can only delete your own events', 403)
    }

    await db.event.delete({ where: { id } })
    return successResponse({ deleted: true })
  } catch (error) {
    console.error('DELETE /api/events/[id] error:', error)
    return errorResponse('Failed to delete event', 500)
  }
}
