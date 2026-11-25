import { NextResponse, after } from 'next/server'
import { and, count, eq, gte } from 'drizzle-orm'
import { z } from 'zod'
import { getDb, schema as s } from '@/lib/db'
import { transporter } from '@/lib/mailer'
import { verifyTurnstile } from '@/lib/turnstile'
import { buildCommentHtml, buildCommentText } from '@/lib/comment-email'
import { SITE_URL, absoluteUrl } from '@/lib/i18n'
import { UUID, clientIp, hashIp } from '@/lib/visitor'

export const dynamic = 'force-dynamic'

const MAX_PER_WINDOW = 3 // comments per visitor…
const WINDOW_MS = 10 * 60 * 1000 // …every 10 minutes

const Body = z.object({
  postId: z.string().regex(UUID),
  lang: z.enum(['en', 'es']),
  name: z.string().trim().min(2).max(60),
  body: z.string().trim().min(3).max(2000),
  token: z.string().min(1),
  website: z.string().optional(), // honeypot: real users never fill it
})

const fail = (error: string, status = 400) => NextResponse.json({ error }, { status })

export async function POST(req: Request) {
  let parsed: z.infer<typeof Body>
  try {
    const result = Body.safeParse(await req.json())
    if (!result.success) return fail('invalid')
    parsed = result.data
  } catch {
    return fail('invalid')
  }

  // Bots that fill the hidden field get a fake success (and nothing is saved)
  if (parsed.website) return NextResponse.json({ ok: true })

  const ip = clientIp(req)
  if (!(await verifyTurnstile(parsed.token, ip))) return fail('captcha', 403)

  const db = getDb()
  const ipHash = hashIp(ip)

  const [{ recent }] = await db
    .select({ recent: count() })
    .from(s.comments)
    .where(and(eq(s.comments.ipHash, ipHash), gte(s.comments.createdAt, new Date(Date.now() - WINDOW_MS))))
  if (recent >= MAX_PER_WINDOW) return fail('rate', 429)

  const [post] = await db.select().from(s.posts).where(eq(s.posts.id, parsed.postId)).limit(1)
  if (!post || post.status !== 'published') return fail('not-found', 404)

  // Plain text only: strip control characters, keep line breaks
  const clean = (t: string) => t.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim()
  const name = clean(parsed.name)
  const body = clean(parsed.body)

  await db.insert(s.comments).values({
    postId: post.id,
    lang: parsed.lang,
    name,
    body,
    ipHash,
    userAgent: req.headers.get('user-agent')?.slice(0, 300) ?? null,
  })

  // Email after responding, so the visitor doesn't wait for SMTP
  after(async () => {
    const title = (parsed.lang === 'es' ? post.titleEs : post.titleEn) ?? post.titleEn ?? post.titleEs ?? 'Post'
    const slug = (parsed.lang === 'es' ? post.slugEs : post.slugEn) ?? ''
    const data = {
      postTitle: title,
      postUrl: absoluteUrl(parsed.lang, `/blog/${slug}`),
      adminUrl: `${SITE_URL}/admin/comments`,
      name,
      body,
      lang: parsed.lang,
    }
    try {
      await transporter.sendMail({
        from: `"carlosperaza.dev" <${process.env.SMTP_USER}>`,
        to: process.env.EMAIL_TO,
        subject: `Nuevo comentario: ${title}`,
        html: buildCommentHtml(data),
        text: buildCommentText(data),
      })
    } catch (e) {
      console.error('[comments] email failed', e)
    }
  })

  return NextResponse.json({ ok: true })
}
