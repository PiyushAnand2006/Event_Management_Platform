import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-utils'

const SCALE_FACTOR = 0.5 // meters per unit

function toCompassDirection(angleDeg: number): string {
  // Normalize to 0-360
  const a = ((angleDeg % 360) + 360) % 360
  if (a >= 337.5 || a < 22.5) return 'N'
  if (a < 67.5) return 'NE'
  if (a < 112.5) return 'E'
  if (a < 157.5) return 'SE'
  if (a < 202.5) return 'S'
  if (a < 247.5) return 'SW'
  if (a < 292.5) return 'W'
  return 'NW'
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const fromX = parseFloat(searchParams.get('fromX') ?? '')
    const fromY = parseFloat(searchParams.get('fromY') ?? '')
    const toX = parseFloat(searchParams.get('toX') ?? '')
    const toY = parseFloat(searchParams.get('toY') ?? '')

    if ([fromX, fromY, toX, toY].some(isNaN)) {
      return errorResponse('fromX, fromY, toX, toY are required numbers', 400)
    }

    const event = await db.event.findUnique({
      where: { id },
      select: { id: true, status: true, venueId: true },
    })

    if (!event || event.status !== 'published') {
      return errorResponse('Event not found or not published', 404)
    }

    // Euclidean distance in abstract units
    const dx = toX - fromX
    const dy = toY - fromY
    const distance = Math.sqrt(dx * dx + dy * dy)
    const distanceMeters = Math.round(distance * SCALE_FACTOR * 10) / 10

    // Angle: atan2(dy, dx) → degrees, then compass
    const angleRad = Math.atan2(dy, dx)
    const angleDeg = (angleRad * 180) / Math.PI
    const direction = toCompassDirection(angleDeg)

    // Find nearest section to destination
    let nearestSection: { id: string; name: string; distance: number } | null = null

    if (event.venueId) {
      const sections = await db.venueSection.findMany({
        where: { venueId: event.venueId },
        select: { id: true, name: true, positionX: true, positionY: true, width: true, height: true },
      })

      let minDist = Infinity
      for (const s of sections) {
        // Distance to center of section
        const cx = s.positionX + s.width / 2
        const cy = s.positionY + s.height / 2
        const d = Math.sqrt((toX - cx) ** 2 + (toY - cy) ** 2)
        if (d < minDist) {
          minDist = d
          nearestSection = { id: s.id, name: s.name, distance: Math.round(d * SCALE_FACTOR * 10) / 10 }
        }
      }
    }

    return successResponse({
      distance: Math.round(distance * 10) / 10,
      distanceMeters,
      angle: Math.round(angleDeg * 10) / 10,
      direction,
      nearestSection,
    })
  } catch (error) {
    console.error('[Lobby Direction] GET error:', error)
    return errorResponse('Failed to calculate direction')
  }
}
