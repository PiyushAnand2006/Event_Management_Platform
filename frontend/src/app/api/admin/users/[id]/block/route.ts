import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)
    if (user.role !== 'admin') return errorResponse('Admin access required', 403)
    if (user.id === id) return errorResponse('You cannot block yourself', 400)

    const target = await db.user.findUnique({ where: { id } })
    if (!target) return errorResponse('User not found', 404)

    if (target.isBlocked) return errorResponse('User is already blocked', 400)

    const updated = await db.user.update({
      where: { id },
      data: { isBlocked: true },
      select: { id: true, name: true, email: true, role: true, isBlocked: true },
    })

    return successResponse(updated)
  } catch (error) {
    console.error('POST /api/admin/users/[id]/block error:', error)
    return errorResponse('Failed to block user', 500)
  }
}
