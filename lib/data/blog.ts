import 'server-only'
import { unstable_cache } from 'next/cache'
import { and, desc, eq, lte } from 'drizzle-orm'
import { getDb, schema as s } from '@/lib/db'
import { readingTime } from '@/lib/markdown'
import type { Lang } from '@/lib/i18n'

/* Public blog queries, cached under the "posts" tag (revalidated by the admin). */
export const POSTS_TAG = 'posts'

export interface PostSummary {
  id: string
  lang: Lang
  title: string
  slug: string
  excerpt: string
  coverUrl: string | null
  coverAlt: string
  tags: string[]
  publishedAt: string // ISO
  updatedAt: string // ISO
  readingTime: number
  /** Same post in the other language, if published there */
  alternate: { lang: Lang; slug: string } | null
}

export interface PostDetail extends PostSummary {
  content: string
}

type PostRow = typeof s.posts.$inferSelect

const fields = (row: PostRow, lang: Lang) =>
  lang === 'es'
    ? { title: row.titleEs, slug: row.slugEs, excerpt: row.excerptEs, content: row.contentEs, rt: row.readingTimeEs, alt: row.coverAltEs }
    : { title: row.titleEn, slug: row.slugEn, excerpt: row.excerptEn, content: row.contentEn, rt: row.readingTimeEn, alt: row.coverAltEn }

/** A language version exists only when it has title, slug and content */
const isAvailable = (row: PostRow, lang: Lang) => {
  const f = fields(row, lang)
  return Boolean(f.title?.trim() && f.slug?.trim() && f.content?.trim())
}

function toDetail(row: PostRow, lang: Lang): PostDetail {
  const f = fields(row, lang)
  const other: Lang = lang === 'en' ? 'es' : 'en'
  return {
    id: row.id,
    lang,
    title: f.title!,
    slug: f.slug!,
    excerpt: f.excerpt ?? '',
    content: f.content!,
    coverUrl: row.coverUrl,
    coverAlt: f.alt || fields(row, other).alt || f.title!,
    tags: row.tags,
    publishedAt: (row.publishedAt ?? row.createdAt).toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    readingTime: f.rt ?? readingTime(f.content!),
    alternate: isAvailable(row, other) ? { lang: other, slug: fields(row, other).slug! } : null,
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const summary = ({ content: _content, ...rest }: PostDetail): PostSummary => rest

/** Published rows (publishedAt in the past), newest first */
async function publishedRows(): Promise<PostRow[]> {
  return getDb()
    .select()
    .from(s.posts)
    .where(and(eq(s.posts.status, 'published'), lte(s.posts.publishedAt, new Date())))
    .orderBy(desc(s.posts.publishedAt))
}

export const getPublishedPosts = unstable_cache(
  async (lang: Lang): Promise<PostSummary[]> =>
    (await publishedRows()).filter((r) => isAvailable(r, lang)).map((r) => summary(toDetail(r, lang))),
  ['blog-list'],
  { tags: [POSTS_TAG], revalidate: 3600 }
)

export const getPostBySlug = unstable_cache(
  async (lang: Lang, slug: string): Promise<PostDetail | null> => {
    const column = lang === 'es' ? s.posts.slugEs : s.posts.slugEn
    const [row] = await getDb()
      .select()
      .from(s.posts)
      .where(and(eq(column, slug), eq(s.posts.status, 'published'), lte(s.posts.publishedAt, new Date())))
      .limit(1)
    return row && isAvailable(row, lang) ? toDetail(row, lang) : null
  },
  ['blog-post'],
  { tags: [POSTS_TAG], revalidate: 3600 }
)

/** Current slug for an old one (so changed slugs 308-redirect instead of 404) */
export const findSlugRedirect = unstable_cache(
  async (lang: Lang, slug: string): Promise<string | null> => {
    const [hit] = await getDb()
      .select({ postId: s.postSlugRedirects.postId })
      .from(s.postSlugRedirects)
      .where(and(eq(s.postSlugRedirects.lang, lang), eq(s.postSlugRedirects.slug, slug)))
      .limit(1)
    if (!hit) return null
    const [row] = await getDb().select().from(s.posts).where(eq(s.posts.id, hit.postId)).limit(1)
    return row && row.status === 'published' && isAvailable(row, lang) ? fields(row, lang).slug : null
  },
  ['blog-redirect'],
  { tags: [POSTS_TAG], revalidate: 3600 }
)

/** Up to `limit` posts sharing tags with this one, then the most recent */
export async function getRelatedPosts(post: PostSummary, limit = 3): Promise<PostSummary[]> {
  const others = (await getPublishedPosts(post.lang)).filter((p) => p.id !== post.id)
  const score = (p: PostSummary) => p.tags.filter((t) => post.tags.includes(t)).length
  return [...others].sort((a, b) => score(b) - score(a)).slice(0, limit)
}
