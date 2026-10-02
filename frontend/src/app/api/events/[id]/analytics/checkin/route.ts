import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'
import { format } from 'date-fns'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const event = await db.event.findUnique({ where: { id } })
    if (!event) return errorResponse('Event not found', 404)

    if (user.role !== 'admin' && user.id !== event.organizerId) {
      const isCoOrg = await db.coOrganizer.findUnique({
        where: { eventId_userId: { eventId: id, userId: user.id } },
      })
      if (!isCoOrg) return errorResponse('Access denied', 403)
    }

    // Registrations are the source of truth for who turned up. Reading only the
    // invitation rows missed every walk-in, because an invitation is optional
    // and the check-in timestamp is not stored on the registration itself.
    const registrations = await db.registration.findMany({
      where: { eventId: id, status: { in: ['registered', 'attended'] } },
      select: {
        status: true,
        updatedAt: true,
        invitation: { select: { checkedInAt: true } },
      },
      orderBy: { updatedAt: 'asc' },
    })

    const total = registrations.length
    const checkedIn = registrations.filter((reg) => reg.status === 'attended')
    const checkedInCount = checkedIn.length
    const rate = total > 0 ? Number(((checkedInCount / total) * 100).toFixed(1)) : 0

    // Group by date, preferring the invitation's check-in timestamp and falling
    // back to the registration's last update for walk-ins.
    const dateMap: Record<string, number> = {}
    for (const reg of checkedIn) {
      const at = reg.invitation?.checkedInAt ?? reg.updatedAt
      const dateKey = format(new Date(at), 'MMM d')
      dateMap[dateKey] = (dateMap[dateKey] || 0) + 1
    }

    const sortedEntries = Object.entries(dateMap).sort((a, b) => a[0].localeCompare(b[0]))

    // Build cumulative timeline
    let cumulative = 0
    const timeline = sortedEntries.map(([date, count]) => {
      cumulative += count
      return { date, count, cumulative }
    })

    return successResponse({ total, checkedIn: checkedInCount, rate, timeline })
  } catch (error) {
    console.error('GET /api/events/[id]/analytics/checkin error:', error)
    return errorResponse('Failed to fetch check-in analytics', 500)
  }
}
