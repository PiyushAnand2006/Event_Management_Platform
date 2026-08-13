import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'
import { venuePresets } from '@/lib/venue-presets'

// POST: Generate seats from preset. Delete existing seats for this section first, then regenerate.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ sectionId: string }> }
) {
  try {
    const { sectionId } = await params
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const section = await db.venueSection.findUnique({
      where: { id: sectionId },
      include: { venue: { include: { event: { select: { organizerId: true } } } } },
    })
    if (!section) return errorResponse('Section not found', 404)

    if (user.role !== 'admin' && user.id !== section.venue.event.organizerId) {
      return errorResponse('Only the event organizer can generate seats', 403)
    }

    const body = await request.json()
    const presetId = body.preset || section.preset

    if (!presetId) {
      return errorResponse('No preset specified and section has no preset', 400)
    }

    const preset = venuePresets[presetId]
    if (!preset) {
      return errorResponse('Invalid preset', 400)
    }

    // Transaction: delete existing seats, then create new ones
    const seatCount = await db.$transaction(async (tx) => {
      // Delete all existing seats for this section
      await tx.seat.deleteMany({
        where: { sectionId, venueId: section.venueId },
      })

      // Generate new seat layouts
      const seatLayouts = preset.generateSeats(
        sectionId,
        section.positionX,
        section.positionY
      )

      // Check for label uniqueness within venue (excluding seats we just deleted)
      const existingLabels = await tx.seat.findMany({
        where: { venueId: section.venueId },
        select: { label: true },
      })
      const existingLabelSet = new Set(existingLabels.map((s) => s.label))

      const seatData = seatLayouts
        .filter((layout) => !existingLabelSet.has(layout.label))
        .map((layout) => ({
          venueId: section.venueId,
          sectionId: sectionId,
          label: layout.label,
          positionX: layout.x,
          positionY: layout.y,
          positionZ: 0,
          rotation: 0,
          tier: layout.tier,
          status: 'unoccupied' as const,
          groupId: layout.groupId || null,
        }))

      // Create seats individually for SQLite compatibility
      for (const data of seatData) {
        await tx.seat.create({ data })
      }

      return seatData.length
    })

    // Update section preset if a different one was specified
    if (body.preset && body.preset !== section.preset) {
      await db.venueSection.update({
        where: { id: sectionId },
        data: { preset: body.preset },
      })
    }

    return successResponse({ generated: seatCount, preset: presetId })
  } catch (error) {
    console.error('POST /api/venues/sections/[sectionId]/seats/generate error:', error)
    return errorResponse('Failed to generate seats', 500)
  }
}
