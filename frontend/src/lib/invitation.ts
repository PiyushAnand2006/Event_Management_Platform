import { SignJWT, jwtVerify } from 'jose'
import { toBuffer } from 'bwip-js'
import { sendEmail } from '@/lib/email'

const SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'fallback-secret-change-me'
)

export interface InvitationTokenPayload {
  invId: string
  eventId: string
  tier: string
  exp: number
}

/**
 * Generate a signed JWT for an invitation.
 * Expires in 90 days.
 */
export async function generateInvitationToken(
  invitationId: string,
  eventId: string,
  tier: string
): Promise<string> {
  const payload: InvitationTokenPayload = {
    invId: invitationId,
    eventId,
    tier,
    exp: Math.floor(Date.now() / 1000) + 90 * 24 * 3600,
  }

  const token = await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(payload.exp)
    .sign(SECRET)

  return token
}

/**
 * Verify and decode an invitation JWT.
 * Returns null on failure (expired, invalid, etc.)
 */
export async function verifyInvitationToken(
  token: string
): Promise<{ invId: string; eventId: string; tier: string } | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    if (!payload.invId || !payload.eventId) return null
    return {
      invId: payload.invId as string,
      eventId: payload.eventId as string,
      tier: (payload.tier as string) || 'general',
    }
  } catch {
    return null
  }
}

/**
 * Generate a Code128 barcode PNG as a base64 data URL.
 */
export async function generateBarcode(text: string): Promise<string> {
  const buffer = await toBuffer({
    bcid: 'code128',
    text,
    scale: 3,
    includetext: false,
  })
  return `data:image/png;base64,${buffer.toString('base64')}`
}

/**
 * Generate a QR code PNG as a base64 data URL.
 */
export async function generateQRCode(text: string): Promise<string> {
  const buffer = await toBuffer({
    bcid: 'qrcode',
    text,
    scale: 4,
  })
  return `data:image/png;base64,${buffer.toString('base64')}`
}

/**
 * Send an invitation email with an inline barcode image.
 */
export async function sendInvitationEmail(
  to: string,
  guestName: string,
  eventTitle: string,
  ticketUrl: string,
  barcodeUrl: string
): Promise<boolean> {
  const subject = `Your Invitation: ${eventTitle}`

  // Extract base64 data from the data URL
  const base64Match = barcodeUrl.match(/^data:image\/(png|jpeg);base64,(.+)$/)
  const attachment = base64Match
    ? {
        filename: 'barcode.png',
        content: Buffer.from(base64Match[2], 'base64'),
        cid: 'barcode',
      }
    : undefined

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #111;">You're Invited!</h1>
      <p>Hi ${guestName},</p>
      <p>You have been invited to <strong>${eventTitle}</strong>.</p>
      <div style="text-align: center; margin: 24px 0;">
        ${base64Match ? '<img src="cid:barcode" alt="Barcode" style="max-width: 300px; height: auto;" />' : ''}
      </div>
      <p>
        <a href="${ticketUrl}" style="display:inline-block;padding:12px 24px;background:#111;color:#fff;border-radius:8px;text-decoration:none;">
          View Your Ticket
        </a>
      </p>
      <p style="color:#666;margin-top:24px;font-size:14px;">
        Please present this barcode at the venue entrance for check-in.
      </p>
    </div>
  `

  // Use sendEmail with attachments support
  const smtpHost = process.env.SMTP_HOST
  const smtpPort = process.env.SMTP_PORT
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
    // Mock fallback: log to console
    console.log('[MOCK INVITATION EMAIL]')
    console.log(`  To: ${to}`)
    console.log(`  Subject: ${subject}`)
    console.log(`  Guest: ${guestName}`)
    console.log(`  Event: ${eventTitle}`)
    console.log(`  Ticket URL: ${ticketUrl}`)
    console.log(`  Barcode: ${barcodeUrl.substring(0, 50)}...`)
    console.log('---')
    return true
  }

  try {
    const nodemailer = await import('nodemailer')
    const transport = nodemailer.default.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort, 10),
      secure: parseInt(smtpPort, 10) === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })

    await transport.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
      attachments: attachment ? [attachment] : undefined,
    })
    return true
  } catch (error) {
    console.error('Failed to send invitation email:', error)
    return false
  }
}
