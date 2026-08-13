/**
 * Generate a certificate as a formatted HTML string.
 * In production this would use jsPDF or similar; for now we return
 * an HTML string that can be downloaded as an .html file and printed.
 */
export function generateCertificateHtml(data: {
  attendeeName: string
  eventTitle: string
  date: string
  organizerName: string
  certificateId: string
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Certificate of Participation — ${data.eventTitle}</title>
  <style>
    @page {
      size: landscape;
      margin: 0;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #f5f5f5;
    }
    .certificate {
      width: 900px;
      height: 640px;
      background: #fffef5;
      border: 12px solid #1a1a2e;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      text-align: center;
      color: #1a1a2e;
    }
    .certificate::before {
      content: '';
      position: absolute;
      top: 16px; left: 16px; right: 16px; bottom: 16px;
      border: 2px solid #c9a84c;
      pointer-events: none;
    }
    .logo {
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 6px;
      color: #c9a84c;
      margin-bottom: 20px;
    }
    .title {
      font-size: 36px;
      font-weight: bold;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .subtitle {
      font-size: 16px;
      color: #555;
      margin-bottom: 40px;
    }
    .divider {
      width: 120px;
      height: 2px;
      background: #c9a84c;
      margin: 0 auto 40px;
    }
    .recipient-label {
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #777;
    }
    .recipient-name {
      font-size: 48px;
      font-style: italic;
      margin: 8px 0 30px;
      color: #1a1a2e;
    }
    .body-text {
      font-size: 16px;
      line-height: 1.6;
      color: #444;
      max-width: 600px;
      margin-bottom: 30px;
    }
    .event-name {
      font-weight: bold;
      font-size: 20px;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      width: 100%;
      margin-top: 20px;
      padding-top: 20px;
    }
    .footer-item {
      text-align: center;
      min-width: 180px;
    }
    .footer-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #999;
      border-top: 1px solid #ccc;
      padding-top: 8px;
      margin-top: 4px;
    }
    .footer-value {
      font-size: 14px;
      color: #333;
    }
    .cert-id {
      position: absolute;
      bottom: 24px;
      right: 32px;
      font-size: 10px;
      color: #bbb;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="logo">Occasio</div>
    <div class="title">Certificate of Participation</div>
    <div class="subtitle">This is to certify that</div>
    <div class="divider"></div>
    <div class="recipient-label">Presented to</div>
    <div class="recipient-name">${data.attendeeName}</div>
    <div class="body-text">
      has successfully participated in<br />
      <span class="event-name">${data.eventTitle}</span>
    </div>
    <div class="footer">
      <div class="footer-item">
        <div class="footer-value">${data.organizerName}</div>
        <div class="footer-label">Organizer</div>
      </div>
      <div class="footer-item">
        <div class="footer-value">${data.date}</div>
        <div class="footer-label">Date</div>
      </div>
    </div>
    <div class="cert-id">${data.certificateId}</div>
  </div>
</body>
</html>`
}
