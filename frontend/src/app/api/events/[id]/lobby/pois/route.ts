import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const event = await db.event.findUnique({
      where: { id },
      select: { id: true, status: true, venueId: true },
    })

    if (!event || event.status !== 'published') {
      return errorResponse('Event not found or not published', 404)
    }

    if (!event.venueId) {
      return errorResponse('No venue configured', 404)
    }

    const pois = await db.pOI.findMany({
      where: { venueId: event.venueId },
      select: { id: true, type: true, name: true, positionX: true, positionY: true, icon: true, refId: true, sortOrder: true },
      orderBy: { sortOrder: 'asc' },
    })

    // For each POI that has a refId linking to a FoodStall, fetch stall info
    const enrichedPois = await Promise.all(
      pois.map(async (poi) => {
        if (poi.refId && poi.type === 'food_stall') {
          const stall = await db.foodStall.findUnique({
            where: { id: poi.refId },
            select: { id: true, stallType: true, ownerName: true, contractStatus: true, cuisineType: true },
          })
          return { ...poi, stall }
        }
        return { ...poi, stall: null }
      })
    )

    return successResponse(enrichedPois)
  } catch (error) {
    console.error('[Lobby POIs] GET error:', error)
    return errorResponse('Failed to load POIs')
  }
}
