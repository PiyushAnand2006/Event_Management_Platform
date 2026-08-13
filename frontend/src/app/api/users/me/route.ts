'use server'

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerUser, successResponse, errorResponse, toJsonField } from '@/lib/api-utils'

export async function GET() {
  try {
    const user = await getServerUser()
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    const fullUser = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        role: true,
        isBlocked: true,
        points: true,
        interests: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!fullUser) {
      return errorResponse('User not found', 404)
    }

    return successResponse(fullUser)
  } catch (error) {
    console.error('Get user error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    const body = await request.json()
    const { name, phone, bio, interests, image } = body

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone
    if (bio !== undefined) updateData.bio = bio
    if (image !== undefined) updateData.image = image
    if (interests !== undefined) {
      updateData.interests = toJsonField(interests)
    }

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        role: true,
        isBlocked: true,
        points: true,
        interests: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return successResponse(updatedUser)
  } catch (error) {
    console.error('Update user error:', error)
    return errorResponse('Internal server error', 500)
  }
}
