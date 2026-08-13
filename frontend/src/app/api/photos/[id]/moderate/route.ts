import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'

// PATCH: Moderate a photo (approve or reject)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const photo = await db.photo.findUnique({
      where: { id },
      include: { event: { select: { organizerId: true } } },
    })
    if (!photo) return errorResponse('Photo not found', 404)

    if (user.role !== 'admin' && user.id !== photo.event.organizerId) {
      return errorResponse('Only the event organizer or admin can moderate photos', 403)
    }

    const body = await request.json()
    const { action, rejectionReason } = body

    if (!action || !['approve', 'reject'].includes(action)) {
      return errorResponse("action must be 'approve' or 'reject'", 400)
    }

    if (photo.status !== 'pending') {
      return errorResponse('Photo has already been moderated', 400)
    }

    const updateData: Record<string, unknown> = {
      moderatedBy: user.id,
    }

    if (action === 'approve') {
      updateData.status = 'approved'
      updateData.rejectionReason = null
    } else {
      updateData.status = 'rejected'
      updateData.rejectionReason = rejectionReason ? String(rejectionReason).trim() : null
    }

    const updated = await db.photo.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, image: true } },
        moderator: { select: { id: true, name: true } },
      },
    })

    return successResponse(updated)
  } catch (error) {
    console.error('PATCH /api/photos/[id]/moderate error:', error)
    return errorResponse('Failed to moderate photo', 500)
  }
}
