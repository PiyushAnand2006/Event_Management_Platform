import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)
    if (user.role !== 'admin') return errorResponse('Admin access required', 403)
    if (user.id === id) return errorResponse('You cannot delete yourself', 400)

    const target = await db.user.findUnique({ where: { id } })
    if (!target) return errorResponse('User not found', 404)

    await db.user.delete({ where: { id } })
    return successResponse({ deleted: true })
  } catch (error) {
    console.error('DELETE /api/admin/users/[id] error:', error)
    return errorResponse('Failed to delete user', 500)
  }
}
