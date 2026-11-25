import 'server-only'
import nodemailer from 'nodemailer'

// ─── SMTP transporter (module-level singleton) ────────────────────────────────
// Shared by the contact form and the comment notifications.
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === 'true', // true = 465/SSL, false = STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

/** Escapes HTML entities for safe interpolation in email bodies */
export const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
