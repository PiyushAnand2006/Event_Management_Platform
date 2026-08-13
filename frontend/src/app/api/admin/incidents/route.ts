import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'

export async function GET() {
  try {
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)
    if (user.role !== 'admin') return errorResponse('Admin only', 403)

    const incidents = await db.backupVendor.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        triggeringStall: {
          select: {
            id: true,
            ownerName: true,
            stallType: true,
            contractStatus: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
          },
        },
        promotedToStall: {
          select: {
            id: true,
            ownerName: true,
          },
      },
      },
    })

    const incidentList = incidents.map((inc) => ({
      id: inc.id,
      vendorName: inc.name,
      phone: inc.phone,
      distanceKm: inc.distanceKm,
      source: inc.source,
      contactStatus: inc.contactStatus,
      promotedToStallId: inc.promotedToStallId,
      createdAt: inc.createdAt.toISOString(),
      stall: inc.triggeringStall,
      event: inc.event,
      promotedToStall: inc.promotedToStall,
    }))

    return successResponse({ incidents: incidentList })
  } catch (error) {
    console.error('GET /api/admin/incidents error:', error)
    return errorResponse('Failed to fetch incidents', 500)
  }
}
