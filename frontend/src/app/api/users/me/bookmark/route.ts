'use server'

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerUser, successResponse, errorResponse } from '@/lib/api-utils'

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    const body = await request.json()
    const { eventId } = body

    if (!eventId) {
      return errorResponse('eventId is required', 400)
    }

    // Check if event exists
    const event = await db.event.findUnique({
      where: { id: eventId },
    })
    if (!event) {
      return errorResponse('Event not found', 404)
    }

    // Check if bookmark exists
    const existing = await db.bookmark.findUnique({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId,
        },
      },
    })

    if (existing) {
      // Remove bookmark
      await db.bookmark.delete({
        where: { id: existing.id },
      })
      return successResponse({ bookmarked: false })
    } else {
      // Add bookmark
      await db.bookmark.create({
        data: {
          userId: user.id,
          eventId,
        },
      })
      return successResponse({ bookmarked: true }, 201)
    }
  } catch (error) {
    console.error('Toggle bookmark error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function GET() {
  try {
    const user = await getServerUser()
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    const bookmarks = await db.bookmark.findMany({
      where: { userId: user.id },
      include: {
        event: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return successResponse(bookmarks)
  } catch (error) {
    console.error('Get bookmarks error:', error)
    return errorResponse('Internal server error', 500)
  }
}
