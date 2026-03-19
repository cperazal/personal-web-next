import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { buildContactHtml, buildContactText } from '@/lib/contact-email'

// ─── SMTP transporter (module-level singleton) ────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === 'true', // true = 465/SSL, false = STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

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
  const safeName    = name.trim().slice(0, 200)
  const safeEmail   = email.trim().slice(0, 200)
  const safeSubject = subject.trim().slice(0, 200)
  const safeMessage = message.trim().slice(0, 5000)

  // Send via SMTP (Nodemailer)
  try {
    await transporter.sendMail({
      from: `"${safeName}" <${process.env.SMTP_USER}>`,
      replyTo: safeEmail,
      to: process.env.EMAIL_TO,
      ...(process.env.EMAIL_CC ? { cc: process.env.EMAIL_CC } : {}),
      subject: safeSubject,
      html: buildContactHtml({ name: safeName, email: safeEmail, subject: safeSubject, message: safeMessage }),
      text: buildContactText({ name: safeName, email: safeEmail, subject: safeSubject, message: safeMessage }),
    })
    return NextResponse.json({ message: 'El correo ha sido enviado' })
  } catch (error) {
    console.error('[contact] SMTP error:', error)
    return NextResponse.json(
      { error: 'Ha ocurrido un error al enviar el email, por favor vuelve a intentarlo' },
      { status: 500 }
    )
  }
}
