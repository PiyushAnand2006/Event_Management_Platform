import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'
import { generateRegistrationToken, generateQRCode } from '@/lib/invitation'

// GET /api/users/me/registrations — the signed-in customer's tickets with
// their personal QR codes. A QR is minted exactly once per registration
// (at registration time, or here as a one-time backfill for legacy rows
// created before the field was populated) and never regenerated after that.
export async function GET() {
  try {
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const registrations = await db.registration.findMany({
      where: { userId: user.id },
      include: {
        event: true,
        seat: { select: { id: true, label: true, tier: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const tickets = await Promise.all(
      registrations.map(async (reg) => {
        let qrCodeDataUrl = reg.qrCodeDataUrl

        // Legacy registration from before QR-at-registration existed: mint
        // its one and only QR now. Rows that already carry a QR are untouched.
        if (!qrCodeDataUrl && reg.status !== 'cancelled') {
          const token = await generateRegistrationToken(reg.id, reg.eventId, reg.tier)
          qrCodeDataUrl = await generateQRCode(token)
          await db.registration.update({
            where: { id: reg.id },
            data: { qrCodeDataUrl },
          })
        }

        return {
          id: reg.id,
          status: reg.status,
          tier: reg.tier,
          seatLabel: reg.seat?.label ?? null,
          qrCodeDataUrl,
          checkedIn: reg.status === 'attended',
          event: {
            id: reg.event.id,
            title: reg.event.title,
            description: reg.event.description,
            date: reg.event.date,
            endTime: reg.event.endTime,
            location: reg.event.location,
            type: reg.event.type,
            category: reg.event.category,
            posterUrl: reg.event.posterUrl,
            isFree: reg.event.isFree,
            price: reg.event.price,
          },
        }
      })
    )

    return successResponse({ registrations: tickets })
  } catch (error) {
    console.error('GET /api/users/me/registrations error:', error)
    return errorResponse('Failed to fetch your registrations', 500)
  }
}
