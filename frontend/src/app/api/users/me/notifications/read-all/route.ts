'use server'

import { db } from '@/lib/db'
import { getServerUser, successResponse, errorResponse } from '@/lib/api-utils'

export async function DELETE() {
  try {
    const user = await getServerUser()
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    const result = await db.notification.updateMany({
      where: {
        userId: user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    })

    return successResponse({ markedRead: result.count })
  } catch (error) {
    console.error('Mark all read error:', error)
    return errorResponse('Internal server error', 500)
  }
}
