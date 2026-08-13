import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'
import { format, parseISO } from 'date-fns'

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

    const invitations = await db.invitation.findMany({
      where: { eventId: id },
      select: { checkedInAt: true, status: true },
      orderBy: { checkedInAt: 'asc' },
    })

    const total = invitations.length
    const checkedIn = invitations.filter((inv) => inv.status === 'checked_in')
    const checkedInCount = checkedIn.length
    const rate = total > 0 ? Number(((checkedInCount / total) * 100).toFixed(1)) : 0

    // Group by date
    const dateMap: Record<string, number> = {}
    for (const inv of checkedIn) {
      if (inv.checkedInAt) {
        const dateKey = format(new Date(inv.checkedInAt), 'MMM d')
        dateMap[dateKey] = (dateMap[dateKey] || 0) + 1
      }
    }

    // Sort by date (approximate sort using key)
    const sortedEntries = Object.entries(dateMap).sort((a, b) => {
      return a[0].localeCompare(b[0])
    })

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
