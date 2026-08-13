import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'

// PUT: Update POI position/name
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ poiId: string }> }
) {
  try {
    const { poiId } = await params
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const poi = await db.pOI.findUnique({
      where: { id: poiId },
      include: { venue: { include: { event: { select: { organizerId: true } } } } },
    })
    if (!poi) return errorResponse('POI not found', 404)

    if (user.role !== 'admin' && user.id !== poi.venue.event.organizerId) {
      return errorResponse('Only the event organizer can update POIs', 403)
    }

    const body = await request.json()
    const { name, positionX, positionY, type, refId, icon, sortOrder } = body

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return errorResponse('POI name must be a non-empty string', 400)
      }
      updateData.name = name.trim()
    }
    if (positionX !== undefined) updateData.positionX = parseFloat(positionX) || 0
    if (positionY !== undefined) updateData.positionY = parseFloat(positionY) || 0
    if (type !== undefined) updateData.type = type
    if (refId !== undefined) updateData.refId = refId || null
    if (icon !== undefined) updateData.icon = icon
    if (sortOrder !== undefined) updateData.sortOrder = parseInt(sortOrder, 10) || 0

    const updated = await db.pOI.update({
      where: { id: poiId },
      data: updateData,
    })

    return successResponse(updated)
  } catch (error) {
    console.error('PUT /api/venues/pois/[poiId] error:', error)
    return errorResponse('Failed to update POI', 500)
  }
}

// DELETE: Delete POI
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ poiId: string }> }
) {
  try {
    const { poiId } = await params
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const poi = await db.pOI.findUnique({
      where: { id: poiId },
      include: { venue: { include: { event: { select: { organizerId: true } } } } },
    })
    if (!poi) return errorResponse('POI not found', 404)

    if (user.role !== 'admin' && user.id !== poi.venue.event.organizerId) {
      return errorResponse('Only the event organizer can delete POIs', 403)
    }

    await db.pOI.delete({ where: { id: poiId } })
    return successResponse({ deleted: true })
  } catch (error) {
    console.error('DELETE /api/venues/pois/[poiId] error:', error)
    return errorResponse('Failed to delete POI', 500)
  }
}
