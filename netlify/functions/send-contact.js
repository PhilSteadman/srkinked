const { Resend } = require('resend')

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  let body
  try {
    body = JSON.parse(event.body)
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' }
  }

  const { name, email, subject, message } = body
  if (!name || !email || !message) {
    return { statusCode: 400, body: 'Missing required fields' }
  }

  const goldBtn = (href, text) =>
    `<a href="${href}" style="display:inline-block;background:#c9a84c;color:#0a0a0a;padding:12px 24px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;text-decoration:none;font-weight:700;margin-right:12px">${text}</a>`

  const outlineBtn = (href, text) =>
    `<a href="${href}" style="display:inline-block;border:1px solid #c9a84c;color:#c9a84c;padding:12px 24px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;text-decoration:none;font-weight:700">${text}</a>`

  const header = `
    <div style="background:#0a0a0a;padding:24px 32px;border-bottom:2px solid #c9a84c;text-align:center">
      <p style="font-family:Georgia,serif;font-size:22px;letter-spacing:0.3em;color:#c9a84c;margin:0;text-transform:uppercase">SRJ Inked</p>
      <p style="font-size:11px;letter-spacing:0.2em;color:#888;margin:6px 0 0;text-transform:uppercase">Where Your Story Meets The Canvas</p>
    </div>`

  const footer = `
    <div style="padding:16px 32px;background:#0a0a0a;border-top:1px solid #2a2a2a;text-align:center">
      <p style="color:#444;font-size:11px;margin:0 0 6px">Follow SRJ Inked</p>
      <p style="margin:0">
        <a href="https://instagram.com/srjinked" style="color:#c9a84c;font-size:11px;letter-spacing:0.1em;text-decoration:none;margin:0 8px">Instagram</a>
        <a href="https://facebook.com/srjinked" style="color:#c9a84c;font-size:11px;letter-spacing:0.1em;text-decoration:none;margin:0 8px">Facebook</a>
        <a href="https://tiktok.com/@s.r.j.inked" style="color:#c9a84c;font-size:11px;letter-spacing:0.1em;text-decoration:none;margin:0 8px">TikTok</a>
      </p>
    </div>`

  const wrap = (inner) =>
    `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#111;color:#f0ebe0;border:1px solid #2a2a2a">${header}<div style="padding:32px">${inner}</div>${footer}</div>`

  try {
    // Notification to SRJ
    await resend.emails.send({
      from: 'SRJ Inked Website <noreply@srjinked.uk>',
      to: 'srjinked@gmail.com',
      replyTo: email,
      subject: `New enquiry: ${subject || 'Contact form'} — from ${name}`,
      html: wrap(`
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#888;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;width:110px">Name</td>
            <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#f0ebe0;font-size:15px">${name}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#888;font-size:12px;letter-spacing:0.1em;text-transform:uppercase">Email</td>
            <td style="padding:10px 0;border-bottom:1px solid #2a2a2a"><a href="mailto:${email}" style="color:#c9a84c;font-size:15px">${email}</a></td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#888;font-size:12px;letter-spacing:0.1em;text-transform:uppercase">Subject</td>
            <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#f0ebe0;font-size:15px">${subject || 'Not specified'}</td>
          </tr>
        </table>
        <p style="color:#888;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 10px">Message</p>
        <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-left:3px solid #c9a84c;padding:16px 20px;font-size:15px;line-height:1.7;color:#f0ebe0;white-space:pre-wrap">${message}</div>
        <div style="margin-top:28px">
          <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject || 'Your enquiry')}"
            style="display:inline-block;background:#c9a84c;color:#0a0a0a;padding:12px 28px;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;text-decoration:none;font-weight:700">
            Reply to ${name}
          </a>
        </div>
      `)
    })

    // Auto-reply to customer
    await resend.emails.send({
      from: 'SRJ Inked <noreply@srjinked.uk>',
      to: email,
      subject: `Thanks for getting in touch — SRJ Inked`,
      html: wrap(`
        <p style="font-size:16px;line-height:1.7;margin:0 0 16px">Hey ${name},</p>
        <p style="font-size:15px;line-height:1.7;color:#c8c4ba;margin:0 0 16px">
          Thanks for reaching out! Your message has been received and SRJ will get back to you within 24–48 hours.
        </p>
        <p style="font-size:15px;line-height:1.7;color:#c8c4ba;margin:0 0 24px">
          In the meantime, feel free to check out the gallery or book a session online.
        </p>
        <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-left:3px solid #c9a84c;padding:16px 20px;margin-bottom:28px">
          <p style="color:#888;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 8px">Your message</p>
          <p style="font-size:14px;color:#888;margin:0;white-space:pre-wrap">${message}</p>
        </div>
        <div>
          ${goldBtn('https://srjinked.uk/gallery', 'View Gallery')}
          ${outlineBtn('https://srjinked.uk/booking', 'Book Now')}
        </div>
      `)
    })

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true })
    }

  } catch (err) {
    console.error('Resend error:', err)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to send email' })
    }
  }
}
