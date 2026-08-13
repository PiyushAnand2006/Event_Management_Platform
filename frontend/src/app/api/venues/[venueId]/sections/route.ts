import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'
import { venuePresets } from '@/lib/venue-presets'

// POST: Create section for a venue. If preset specified, auto-generate seats.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ venueId: string }> }
) {
  try {
    const { venueId } = await params
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const venue = await db.venue.findUnique({
      where: { id: venueId },
      include: { event: { select: { organizerId: true } } },
    })
    if (!venue) return errorResponse('Venue not found', 404)

    if (user.role !== 'admin' && user.id !== venue.event.organizerId) {
      return errorResponse('Only the event organizer can create sections', 403)
    }

    const body = await request.json()
    const { name, shape, preset, positionX, positionY, width, height, sortOrder } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return errorResponse('Section name is required', 400)
    }

    const validShapes = ['rectangle', 'circle']
    const sectionShape = shape || 'rectangle'
    if (!validShapes.includes(sectionShape)) {
      return errorResponse('Invalid section shape', 400)
    }

    if (preset && !venuePresets[preset]) {
      return errorResponse('Invalid preset', 400)
    }

    // Create section within transaction so seats are also created atomically
    const result = await db.$transaction(async (tx) => {
      const section = await tx.venueSection.create({
        data: {
          venueId,
          name: name.trim(),
          shape: sectionShape,
          preset: preset || null,
          positionX: positionX !== undefined ? parseFloat(positionX) : 0,
          positionY: positionY !== undefined ? parseFloat(positionY) : 0,
          width: width !== undefined ? parseFloat(width) : (preset && venuePresets[preset] ? venuePresets[preset].defaultWidth : 20),
          height: height !== undefined ? parseFloat(height) : (preset && venuePresets[preset] ? venuePresets[preset].defaultHeight : 20),
          sortOrder: sortOrder !== undefined ? parseInt(sortOrder, 10) : 0,
        },
      })

      let seats: Array<unknown> = []

      // Auto-generate seats if preset is specified
      if (preset && venuePresets[preset]) {
        const seatLayouts = venuePresets[preset].generateSeats(
          section.id,
          section.positionX,
          section.positionY
        )

        // Check for label uniqueness within venue
        const existingLabels = await tx.seat.findMany({
          where: { venueId },
          select: { label: true },
        })
        const existingLabelSet = new Set(existingLabels.map((s) => s.label))

        const seatData = seatLayouts
          .filter((layout) => !existingLabelSet.has(layout.label))
          .map((layout) => ({
            venueId,
            sectionId: section.id,
            label: layout.label,
            positionX: layout.x,
            positionY: layout.y,
            positionZ: 0,
            rotation: 0,
            tier: layout.tier,
            status: 'unoccupied' as const,
            groupId: layout.groupId || null,
          }))

        // Use individual creates for SQLite compatibility
        for (const data of seatData) {
          await tx.seat.create({ data })
        }

        seats = await tx.seat.findMany({
          where: { sectionId: section.id },
          orderBy: [{ label: 'asc' }],
        })
      }

      return { ...section, seats }
    })

    return successResponse(result, 201)
  } catch (error) {
    console.error('POST /api/venues/[venueId]/sections error:', error)
    return errorResponse('Failed to create section', 500)
  }
}
