import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'

// PUT: Update section properties
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ sectionId: string }> }
) {
  try {
    const { sectionId } = await params
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const section = await db.venueSection.findUnique({
      where: { id: sectionId },
      include: { venue: { include: { event: { select: { organizerId: true } } } } },
    })
    if (!section) return errorResponse('Section not found', 404)

    if (user.role !== 'admin' && user.id !== section.venue.event.organizerId) {
      return errorResponse('Only the event organizer can update sections', 403)
    }

    const body = await request.json()
    const { name, positionX, positionY, width, height, sortOrder, preset } = body

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return errorResponse('Section name must be a non-empty string', 400)
      }
      updateData.name = name.trim()
    }
    if (positionX !== undefined) updateData.positionX = parseFloat(positionX) || 0
    if (positionY !== undefined) updateData.positionY = parseFloat(positionY) || 0
    if (width !== undefined) updateData.width = Math.max(1, parseFloat(width) || 20)
    if (height !== undefined) updateData.height = Math.max(1, parseFloat(height) || 20)
    if (sortOrder !== undefined) updateData.sortOrder = parseInt(sortOrder, 10) || 0
    if (preset !== undefined) updateData.preset = preset || null

    const updated = await db.venueSection.update({
      where: { id: sectionId },
      data: updateData,
      include: {
        seats: {
          orderBy: [{ label: 'asc' }],
        },
      },
    })

    return successResponse(updated)
  } catch (error) {
    console.error('PUT /api/venues/sections/[sectionId] error:', error)
    return errorResponse('Failed to update section', 500)
  }
}

// DELETE: Delete section and all its seats
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ sectionId: string }> }
) {
  try {
    const { sectionId } = await params
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const section = await db.venueSection.findUnique({
      where: { id: sectionId },
      include: { venue: { include: { event: { select: { organizerId: true } } } } },
    })
    if (!section) return errorResponse('Section not found', 404)

    if (user.role !== 'admin' && user.id !== section.venue.event.organizerId) {
      return errorResponse('Only the event organizer can delete sections', 403)
    }

    await db.venueSection.delete({ where: { id: sectionId } })
    return successResponse({ deleted: true })
  } catch (error) {
    console.error('DELETE /api/venues/sections/[sectionId] error:', error)
    return errorResponse('Failed to delete section', 500)
  }
}
