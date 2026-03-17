import { NextRequest, NextResponse } from 'next/server'
import sgMail from '@sendgrid/mail'

// ─── In-memory rate limiter (5 req / IP / 60 min) ────────────────────────────
const rateMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 60 * 60 * 1000
  const max = 5

  const entry = rateMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (entry.count >= max) return false
  entry.count++
  return true
}

// ─── Handler ─────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // Rate limiting
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1'
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many requests, please try again later.' },
      { status: 429 }
    )
  }

  // Parse and validate body
  let body: { name?: unknown; email?: unknown; subject?: unknown; message?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { name, email, subject, message } = body

  if (
    typeof name !== 'string' || !name.trim() ||
    typeof email !== 'string' || !email.trim() || !email.includes('@') ||
    typeof subject !== 'string' || !subject.trim() ||
    typeof message !== 'string' || !message.trim()
  ) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
  }

  // Sanitize to prevent header injection
  const safeName = name.trim().slice(0, 200)
  const safeEmail = email.trim().slice(0, 200)
  const safeSubject = subject.trim().slice(0, 200)
  const safeMessage = message.trim().slice(0, 5000)

  // Send via SendGrid
  sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

  const msg = {
    to: process.env.EMAIL_TO!,
    from: process.env.EMAIL_FROM!,
    subject: safeSubject,
    templateId: 'd-78c00b37a23e404eae9a840d972806c4',
    dynamicTemplateData: {
      name: safeName,
      message: safeMessage,
      email: safeEmail,
    },
  }

  try {
    await sgMail.send(msg)
    return NextResponse.json({ message: 'El correo ha sido enviado' })
  } catch (error) {
    console.error('[contact] SendGrid error:', error)
    return NextResponse.json(
      { error: 'Ha ocurrido un error al enviar el email, por favor vuelve a intentarlo' },
      { status: 500 }
    )
  }
}
