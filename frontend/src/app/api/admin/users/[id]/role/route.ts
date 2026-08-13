import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'

const VALID_ROLES = ['customer', 'organizer', 'admin']

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)
    if (user.role !== 'admin') return errorResponse('Admin access required', 403)
    if (user.id === id) return errorResponse('You cannot change your own role', 400)

    const target = await db.user.findUnique({ where: { id } })
    if (!target) return errorResponse('User not found', 404)

    const body = await request.json()
    const { role } = body

    if (!role || !VALID_ROLES.includes(role)) {
      return errorResponse(`Role must be one of: ${VALID_ROLES.join(', ')}`, 400)
    }

    const updated = await db.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true, isBlocked: true },
    })

    return successResponse(updated)
  } catch (error) {
    console.error('PUT /api/admin/users/[id]/role error:', error)
    return errorResponse('Failed to update user role', 500)
  }
}
