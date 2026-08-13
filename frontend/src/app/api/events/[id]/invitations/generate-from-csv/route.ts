import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser } from '@/lib/api-utils'
import {
  generateInvitationToken,
  generateBarcode,
  generateQRCode,
} from '@/lib/invitation'

/**
 * Simple CSV row parser that handles basic quoting.
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"'
        i++ // skip next quote
      } else if (char === '"') {
        inQuotes = false
      } else {
        current += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === ',') {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
  }
  result.push(current.trim())
  return result
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const event = await db.event.findUnique({ where: { id: eventId } })
    if (!event) return errorResponse('Event not found', 404)

    if (user.role !== 'admin' && event.organizerId !== user.id) {
      return errorResponse('Forbidden', 403)
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return errorResponse('No file uploaded', 400)

    const text = await file.text()
    const lines = text.split(/\r?\n/).filter((l) => l.trim())

    if (lines.length === 0) {
      return errorResponse('CSV file is empty', 400)
    }

    // Detect if first line is a header
    const firstLine = parseCsvLine(lines[0])
    const isHeader = firstLine.some((col) =>
      ['name', 'email', 'tier', 'groupid'].includes(col.toLowerCase())
    )
    const dataLines = isHeader ? lines.slice(1) : lines

    // We need to create registrations for CSV guests that don't exist yet
    // CSV guests have name, email, tier, groupId but no user account
    // Since Invitation requires registrationId, we need to create a special registration
    // But the schema has @@unique([userId, eventId]), so we need a real userId
    // Strategy: For CSV guests, we'll create a placeholder user or find existing one by email

    let imported = 0
    let skipped = 0

    for (const line of dataLines) {
      const cols = parseCsvLine(line)
      const name = cols[0] || ''
      const email = cols[1] || ''
      const tier = cols[2] || 'general'
      const groupId = cols[3] || null

      if (!name || !email) {
        skipped++
        continue
      }

      // Find or create user
      let existingUser = await db.user.findUnique({ where: { email } })
      let userId: string

      if (existingUser) {
        userId = existingUser.id
      } else {
        // Create a user with a random password (they won't use it for login)
        const bcrypt = await import('bcryptjs')
        const passwordHash = await bcrypt.hash(Date.now().toString(), 10)
        const newUser = await db.user.create({
          data: {
            name,
            email,
            passwordHash,
            role: 'customer',
          },
        })
        userId = newUser.id
      }

      // Check if already registered
      const existingReg = await db.registration.findUnique({
        where: { userId_eventId: { userId, eventId } },
      })

      let registrationId: string
      if (existingReg) {
        // Check if invitation already exists
        const existingInv = await db.invitation.findUnique({
          where: { registrationId: existingReg.id },
        })
        if (existingInv) {
          skipped++
          continue
        }
        registrationId = existingReg.id
      } else {
        // Create registration
        const reg = await db.registration.create({
          data: {
            userId,
            eventId,
            tier,
            groupId,
            status: 'registered',
            paymentStatus: 'not_applicable',
          },
        })
        registrationId = reg.id

        // Update registered count
        await db.event.update({
          where: { id: eventId },
          data: { registeredCount: { increment: 1 } },
        })
      }

      // Create invitation
      const invitation = await db.invitation.create({
        data: {
          registrationId,
          eventId,
          token: '',
          status: 'issued',
        },
      })

      const token = await generateInvitationToken(invitation.id, eventId, tier)
      const barcodeUrl = await generateBarcode(invitation.id)
      const qrUrl = await generateQRCode(token)

      await db.invitation.update({
        where: { id: invitation.id },
        data: { token, barcodeUrl, qrUrl },
      })

      imported++
    }

    return successResponse({ imported, skipped })
  } catch (error) {
    console.error('POST /api/events/[id]/invitations/generate-from-csv error:', error)
    return errorResponse('Failed to import CSV invitations', 500)
  }
}
