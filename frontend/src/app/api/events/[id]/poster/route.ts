import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'

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
      return errorResponse('You can only update your own events', 403)
    }

    const body = await request.json()
    const { posterUrl } = body

    if (!posterUrl) {
      return errorResponse('posterUrl is required', 400)
    }

    const updated = await db.event.update({
      where: { id },
      data: { posterUrl },
    })

    return successResponse({ posterUrl: updated.posterUrl })
  } catch (error) {
    console.error('POST /api/events/[id]/poster error:', error)
    return errorResponse('Failed to update poster', 500)
  }
}
