'use server'

import { and, desc, eq, inArray } from 'drizzle-orm'
import { del } from '@vercel/blob'
import { getDb, schema as s } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/require-admin'
import { revalidateSite } from '@/lib/revalidate'
import { renderMarkdown, readingTime } from '@/lib/markdown'
import { slugify } from './entities'

export type PostRow = typeof s.posts.$inferSelect
export type PostInput = {
  titleEn: string
  slugEn: string
  excerptEn: string
  contentEn: string
  titleEs: string
  slugEs: string
  excerptEs: string
  contentEs: string
  coverUrl: string | null
  coverAltEn: string
  coverAltEs: string
  tags: string[]
  /** ISO date-time; empty = now when publishing */
  publishedAt: string
}
export type PostResult = { ok: true; id: string; status: 'draft' | 'published' } | { ok: false; error: string }

const BLOB_HOST = '.public.blob.vercel-storage.com'

function refreshBlog() {
  revalidateSite() // posts, home "latest posts", sitemap, feeds, llms.txt
}

const clean = (v: unknown, max = 100_000) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const orNull = (v: string) => v || null

/* ─── Reads ──────────────────────────────────────────────────────────────────── */
export async function listPosts() {
  await requireAdmin()
  const db = getDb()
  const posts = await db.select().from(s.posts).orderBy(desc(s.posts.updatedAt))
  const views = posts.length
    ? await db.select().from(s.postViews).where(inArray(s.postViews.postId, posts.map((p) => p.id)))
    : []
  const viewMap = new Map(views.map((v) => [v.postId, v.count]))
  return posts.map((p) => ({ ...p, views: viewMap.get(p.id) ?? 0 }))
}

export async function getPost(id: string): Promise<PostRow | null> {
  await requireAdmin()
  const [row] = await getDb().select().from(s.posts).where(eq(s.posts.id, id)).limit(1)
  return row ?? null
}

/** Live preview with exactly the same pipeline as the public article */
export async function previewMarkdown(markdown: string): Promise<string> {
  await requireAdmin()
  return (await renderMarkdown(markdown.slice(0, 200_000))).html
}

/* ─── Save / publish ─────────────────────────────────────────────────────────── */
export async function savePost(
  id: string | null,
  input: PostInput,
  status: 'draft' | 'published'
): Promise<PostResult> {
  await requireAdmin()
  const db = getDb()

  const v = {
    titleEn: clean(input.titleEn, 200),
    slugEn: slugify(clean(input.slugEn) || clean(input.titleEn)),
    excerptEn: clean(input.excerptEn, 300),
    contentEn: clean(input.contentEn),
    titleEs: clean(input.titleEs, 200),
    slugEs: slugify(clean(input.slugEs) || clean(input.titleEs)),
    excerptEs: clean(input.excerptEs, 300),
    contentEs: clean(input.contentEs),
  }
  const hasEn = Boolean(v.titleEn && v.contentEn)
  const hasEs = Boolean(v.titleEs && v.contentEs)

  if (!v.titleEn && !v.titleEs) return { ok: false, error: 'Escribe al menos un título (en inglés o en español).' }
  if (status === 'published') {
    if (!hasEn && !hasEs) return { ok: false, error: 'Para publicar, al menos un idioma necesita título y contenido.' }
    if (hasEn && !v.excerptEn) return { ok: false, error: 'Falta el resumen en inglés (es la meta descripción para Google).' }
    if (hasEs && !v.excerptEs) return { ok: false, error: 'Falta el resumen en español (es la meta descripción para Google).' }
  }
  let publishedAt: Date | null = null
  if (input.publishedAt) {
    const d = new Date(input.publishedAt)
    if (Number.isNaN(d.getTime())) return { ok: false, error: 'La fecha de publicación no es válida.' }
    publishedAt = d
  }

  const values = {
    status,
    titleEn: orNull(v.titleEn),
    slugEn: v.titleEn ? orNull(v.slugEn) : null,
    excerptEn: orNull(v.excerptEn),
    contentEn: orNull(v.contentEn),
    readingTimeEn: v.contentEn ? readingTime(v.contentEn) : null,
    titleEs: orNull(v.titleEs),
    slugEs: v.titleEs ? orNull(v.slugEs) : null,
    excerptEs: orNull(v.excerptEs),
    contentEs: orNull(v.contentEs),
    readingTimeEs: v.contentEs ? readingTime(v.contentEs) : null,
    coverUrl: input.coverUrl || null,
    coverAltEn: orNull(clean(input.coverAltEn, 200)),
    coverAltEs: orNull(clean(input.coverAltEs, 200)),
    tags: (input.tags ?? []).map((t) => String(t).trim()).filter(Boolean).slice(0, 10),
  }

  try {
    if (!id) {
      const [created] = await db
        .insert(s.posts)
        .values({ ...values, publishedAt: status === 'published' ? (publishedAt ?? new Date()) : publishedAt })
        .returning({ id: s.posts.id })
      refreshBlog()
      return { ok: true, id: created.id, status }
    }

    const [existing] = await db.select().from(s.posts).where(eq(s.posts.id, id)).limit(1)
    if (!existing) return { ok: false, error: 'El post ya no existe.' }

    // Keep the first publication date unless it was changed by hand
    const nextPublishedAt =
      publishedAt ?? existing.publishedAt ?? (status === 'published' ? new Date() : null)

    await db.update(s.posts).set({ ...values, publishedAt: nextPublishedAt }).where(eq(s.posts.id, id))

    // Changed slug on an already published post → keep the old URL working (308)
    if (existing.status === 'published') {
      for (const [lang, oldSlug, newSlug] of [
        ['en', existing.slugEn, values.slugEn],
        ['es', existing.slugEs, values.slugEs],
      ] as const) {
        if (oldSlug && newSlug && oldSlug !== newSlug) {
          await db.insert(s.postSlugRedirects).values({ postId: id, lang, slug: oldSlug }).onConflictDoNothing()
        }
        // If a slug is reused, it must not redirect anymore
        if (newSlug) {
          await db
            .delete(s.postSlugRedirects)
            .where(and(eq(s.postSlugRedirects.lang, lang), eq(s.postSlugRedirects.slug, newSlug)))
        }
      }
    }

    if (existing.coverUrl && existing.coverUrl !== values.coverUrl && existing.coverUrl.includes(BLOB_HOST)) {
      await del(existing.coverUrl).catch(() => {})
    }
    refreshBlog()
    return { ok: true, id, status }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    if (/posts_slug_en_idx/.test(msg)) return { ok: false, error: 'Ya existe otro post con ese slug en inglés.' }
    if (/posts_slug_es_idx/.test(msg)) return { ok: false, error: 'Ya existe otro post con ese slug en español.' }
    if (/unique|duplicate/i.test(msg)) return { ok: false, error: 'Ese slug ya está en uso.' }
    console.error('[admin] savePost', e)
    return { ok: false, error: 'No se pudo guardar el post.' }
  }
}

export async function deletePost(id: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin()
  const [deleted] = await getDb().delete(s.posts).where(eq(s.posts.id, id)).returning()
  if (deleted?.coverUrl?.includes(BLOB_HOST)) await del(deleted.coverUrl).catch(() => {})
  refreshBlog()
  return { ok: true }
}
