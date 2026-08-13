'use server'

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerUser, successResponse, errorResponse } from '@/lib/api-utils'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getServerUser()
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    const { id } = await params

    const notification = await db.notification.findUnique({
      where: { id },
    })

    if (!notification || notification.userId !== user.id) {
      return errorResponse('Notification not found', 404)
    }

    const updated = await db.notification.update({
      where: { id },
      data: { isRead: true },
    })

    return successResponse(updated)
  } catch (error) {
    console.error('Mark notification read error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getServerUser()
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    const { id } = await params

    const notification = await db.notification.findUnique({
      where: { id },
    })

    if (!notification || notification.userId !== user.id) {
      return errorResponse('Notification not found', 404)
    }

    await db.notification.delete({
      where: { id },
    })

    return successResponse({ deleted: true })
  } catch (error) {
    console.error('Delete notification error:', error)
    return errorResponse('Internal server error', 500)
  }
}
