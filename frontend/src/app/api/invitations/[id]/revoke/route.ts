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

    const invitation = await db.invitation.findUnique({
      where: { id },
      include: { event: true },
    })

    if (!invitation) return errorResponse('Invitation not found', 404)

    if (user.role !== 'admin' && invitation.event.organizerId !== user.id) {
      return errorResponse('Forbidden', 403)
    }

    await db.invitation.update({
      where: { id },
      data: { status: 'revoked' },
    })

    return successResponse(null)
  } catch (error) {
    console.error('POST /api/invitations/[id]/revoke error:', error)
    return errorResponse('Failed to revoke invitation', 500)
  }
}
