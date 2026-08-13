import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'

export async function GET(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    const query = searchParams.get('query') || ''

    if (!eventId) return errorResponse('eventId is required', 400)
    if (!query.trim()) return errorResponse('query is required', 400)

    const registrations = await db.registration.findMany({
      where: {
        eventId,
        user: {
          OR: [
            { name: { contains: query } },
            { email: { contains: query } },
          ],
        },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        seat: {
          select: { label: true },
        },
        invitation: {
          select: { status: true, checkedInAt: true },
        },
      },
      take: 20,
    })

    const results = registrations.map((reg) => ({
      userId: reg.userId,
      userName: reg.user.name,
      email: reg.user.email,
      status: reg.status,
      seatLabel: reg.seat?.label || null,
      checkedIn:
        reg.status === 'attended' ||
        reg.invitation?.status === 'checked_in',
    }))

    return successResponse({ results })
  } catch (error) {
    console.error('GET /api/checkin/search error:', error)
    return errorResponse('Failed to search registrations', 500)
  }
}
