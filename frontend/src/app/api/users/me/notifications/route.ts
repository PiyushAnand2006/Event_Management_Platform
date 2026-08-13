'use server'

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerUser, successResponse, errorResponse } from '@/lib/api-utils'

export async function GET() {
  try {
    const user = await getServerUser()
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    const now = new Date()

    const [notifications, unreadCount] = await Promise.all([
      db.notification.findMany({
        where: {
          userId: user.id,
          expiresAt: { gt: now },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.notification.count({
        where: {
          userId: user.id,
          isRead: false,
          expiresAt: { gt: now },
        },
      }),
    ])

    return successResponse({ notifications, unreadCount })
  } catch (error) {
    console.error('Get notifications error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    // Only admin and organizer can create notifications
    if (user.role !== 'admin' && user.role !== 'organizer') {
      return errorResponse('Forbidden: only admins and organizers can create notifications', 403)
    }

    const body = await request.json()
    const { userId, type, title, message, data } = body

    if (!userId || !type || !title || !message) {
      return errorResponse('userId, type, title, and message are required', 400)
    }

    // Default expiration: 30 days from now
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    const notification = await db.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: data ? JSON.stringify(data) : null,
        expiresAt,
      },
    })

    return successResponse(notification, 201)
  } catch (error) {
    console.error('Create notification error:', error)
    return errorResponse('Internal server error', 500)
  }
}
