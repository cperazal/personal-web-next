/**
 * ─── ARCHIVED: SendGrid email sender ─────────────────────────────────────────
 * This file is kept as reference. It is NOT imported anywhere.
 * The active implementation lives in route.ts and uses Nodemailer + SMTP.
 *
 * To re-enable:
 *  1. npm install @sendgrid/mail
 *  2. Set SENDGRID_API_KEY, EMAIL_TO, EMAIL_FROM in .env
 *  3. Import sendViaSendGrid from './_sendgrid' inside route.ts
 *     and call it instead of sendViaSmtp.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import sgMail from '@sendgrid/mail'

interface SendGridPayload {
  to: string
  from: string
  subject: string
  name: string
  email: string
  message: string
  templateId?: string
}

export async function sendViaSendGrid({
  to,
  from,
  subject,
  name,
  email,
  message,
  templateId = 'd-78c00b37a23e404eae9a840d972806c4',
}: SendGridPayload): Promise<void> {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

  await sgMail.send({
    to,
    from,
    subject,
    templateId,
    dynamicTemplateData: { name, message, email },
  })
}
