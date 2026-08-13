import { db } from '@/lib/db'
import { getServerUser } from '@/lib/api-utils'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getServerUser()
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const event = await db.event.findUnique({ where: { id } })
    if (!event) return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 })

    if (user.role !== 'admin' && user.id !== event.organizerId) {
      const isCoOrg = await db.coOrganizer.findUnique({
        where: { eventId_userId: { eventId: id, userId: user.id } },
      })
      if (!isCoOrg) return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 })
    }

    const registrations = await db.registration.findMany({
      where: { eventId: id },
      orderBy: { createdAt: 'asc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    })

    const headers = ['Name', 'Email', 'Status', 'Tier', 'Payment Status', 'Registered At']
    const rows = registrations.map((r) => [
      r.user.name,
      r.user.email,
      r.status,
      r.tier,
      r.paymentStatus,
      r.createdAt.toISOString(),
    ])

    // Escape CSV fields
    const escape = (val: string) => {
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`
      }
      return val
    }

    const csv = [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n')

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${event.title.replace(/[^a-zA-Z0-9]/g, '_')}_registrations.csv"`,
      },
    })
  } catch (error) {
    console.error('GET /api/events/[id]/registrations/csv error:', error)
    return NextResponse.json({ success: false, error: 'Failed to export registrations' }, { status: 500 })
  }
}
