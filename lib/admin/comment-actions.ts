'use server'

import { count, desc, eq } from 'drizzle-orm'
import { getDb, schema as s } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/require-admin'
import { revalidateSite } from '@/lib/revalidate'

export type CommentStatus = 'pending' | 'approved' | 'rejected' | 'spam'
const STATUSES: CommentStatus[] = ['pending', 'approved', 'rejected', 'spam']

export async function listComments(status: CommentStatus) {
  await requireAdmin()
  const db = getDb()
  const rows = await db
    .select({
      id: s.comments.id,
      name: s.comments.name,
      body: s.comments.body,
      lang: s.comments.lang,
      status: s.comments.status,
      createdAt: s.comments.createdAt,
      postId: s.comments.postId,
      titleEn: s.posts.titleEn,
      titleEs: s.posts.titleEs,
      slugEn: s.posts.slugEn,
      slugEs: s.posts.slugEs,
    })
    .from(s.comments)
    .innerJoin(s.posts, eq(s.posts.id, s.comments.postId))
    .where(eq(s.comments.status, status))
    .orderBy(status === 'pending' ? s.comments.createdAt : desc(s.comments.createdAt))
    .limit(200)
  const counts = await db.select({ status: s.comments.status, n: count() }).from(s.comments).groupBy(s.comments.status)
  return {
    rows: rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
    counts: Object.fromEntries(
      STATUSES.map((st) => [st, counts.find((c) => c.status === st)?.n ?? 0])
    ) as Record<CommentStatus, number>,
  }
}

function refresh() {
  // Approved comments are part of the article HTML and its JSON-LD
  revalidateSite()
}

export async function setCommentStatus(id: string, status: CommentStatus) {
  await requireAdmin()
  if (!STATUSES.includes(status)) return { ok: false, error: 'Estado inválido' }
  await getDb()
    .update(s.comments)
    .set({ status, approvedAt: status === 'approved' ? new Date() : null })
    .where(eq(s.comments.id, id))
  refresh()
  return { ok: true }
}

export async function deleteComment(id: string) {
  await requireAdmin()
  await getDb().delete(s.comments).where(eq(s.comments.id, id))
  refresh()
  return { ok: true }
}

/** Numbers for the admin dashboard */
export async function dashboardStats() {
  await requireAdmin()
  const db = getDb()
  const [[pending], top, [published]] = await Promise.all([
    db.select({ n: count() }).from(s.comments).where(eq(s.comments.status, 'pending')),
    db
      .select({ id: s.posts.id, titleEn: s.posts.titleEn, titleEs: s.posts.titleEs, views: s.postViews.count })
      .from(s.postViews)
      .innerJoin(s.posts, eq(s.posts.id, s.postViews.postId))
      .orderBy(desc(s.postViews.count))
      .limit(5),
    db.select({ n: count() }).from(s.posts).where(eq(s.posts.status, 'published')),
  ])
  return { pendingComments: pending.n, publishedPosts: published.n, topPosts: top }
}
