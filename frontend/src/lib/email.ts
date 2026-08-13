import nodemailer from 'nodemailer'

type EmailOptions = {
  to: string
  subject: string
  html: string
  text?: string
}

let transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter

  const smtpHost = process.env.SMTP_HOST
  const smtpPort = process.env.SMTP_PORT
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
    return null
  }

  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort, 10),
    secure: parseInt(smtpPort, 10) === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  })

  return transporter
}

export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<boolean> {
  const transport = getTransporter()

  if (!transport) {
    // Mock fallback: log to console
    console.log('[MOCK EMAIL]')
    console.log(`  To: ${to}`)
    console.log(`  Subject: ${subject}`)
    console.log(`  Text: ${text || '(no plain text)'}`)
    console.log(`  HTML: ${html}`)
    console.log('---')
    return true
  }

  try {
    await transport.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    })
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}

export async function sendTicketEmail(
  to: string,
  userName: string,
  eventTitle: string,
  ticketUrl: string
): Promise<boolean> {
  const subject = `Your Ticket for ${eventTitle}`
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #111;">🎉 You're Registered!</h1>
      <p>Hi ${userName},</p>
      <p>You're confirmed for <strong>${eventTitle}</strong>.</p>
      <p>
        <a href="${ticketUrl}" style="display:inline-block;padding:12px 24px;background:#111;color:#fff;border-radius:8px;text-decoration:none;">
          View Your Ticket
        </a>
      </p>
      <p style="color:#666;margin-top:24px;font-size:14px;">
        If you didn't register for this event, you can ignore this email.
      </p>
    </div>
  `
  return sendEmail({ to, subject, html })
}

export async function sendEventRejectionEmail(
  to: string,
  userName: string,
  eventTitle: string,
  reason?: string
): Promise<boolean> {
  const subject = `Event Update: ${eventTitle}`
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #111;">Event Status Update</h1>
      <p>Hi ${userName},</p>
      <p>Your event <strong>${eventTitle}</strong> has not been approved at this time.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p style="color:#666;margin-top:24px;font-size:14px;">
        You may review the guidelines and submit a new event for approval.
      </p>
    </div>
  `
  return sendEmail({ to, subject, html })
}
