import { ImageResponse } from 'next/og'
import { getPostBySlug } from '@/lib/data/blog'
import { getAuthor } from '@/lib/data/content'
import { BLOG_COPY } from '@/lib/blog-copy'
import { LOCALE_BY_LANG, isLang, type Lang } from '@/lib/i18n'

// Share card for LinkedIn, X, Facebook, WhatsApp… generated from the post itself,
// so every article gets a clear preview without designing images by hand.
//
// Served from a plain route (not the opengraph-image file convention) so the
// page can link it as /og?v=<last edit>: the URL changes whenever the post is
// edited, which forces LinkedIn & co. to fetch the new image instead of reusing
// a cached one.
const size = { width: 1200, height: 630 }

const clamp = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1).replace(/\s+\S*$/, '')}…` : text)

export async function GET(req: Request, { params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang: raw, slug } = await params
  // Versioned URLs (?v=…) never change content → cache for a year; unversioned ones briefly
  const versioned = new URL(req.url).searchParams.has('v')
  const cacheControl = versioned
    ? 'public, max-age=31536000, immutable'
    : 'public, max-age=300, s-maxage=300, stale-while-revalidate=86400'
  const lang: Lang = isLang(raw) ? raw : 'en'
  const [post, author] = await Promise.all([getPostBySlug(lang, slug), getAuthor(LOCALE_BY_LANG[lang])])
  const t = BLOG_COPY[lang]

  const title = post?.title ?? 'carlosperaza.dev'
  const titleSize = title.length > 80 ? 52 : title.length > 50 ? 60 : 70

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: 'linear-gradient(135deg, #0c132b 0%, #111a35 60%, #1a2440 100%)',
          color: '#f1f1f1',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 26, color: '#8b8b9a' }}>
          <span style={{ color: '#E3E3E3', fontWeight: 700 }}>carlosperaza.dev</span>
          <span>/</span>
          <span>{t.blog}</span>
          {post && (
            <span style={{ marginLeft: 'auto', fontSize: 22 }}>{t.minRead(post.readingTime)}</span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ fontSize: titleSize, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }}>{title}</div>
          {post?.excerpt && (
            <div style={{ fontSize: 28, lineHeight: 1.4, color: '#b8b8c6' }}>{clamp(post.excerpt, 140)}</div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {author?.photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={author.photoUrl} width={76} height={76} alt="" style={{ borderRadius: 999, objectFit: 'cover', border: '3px solid #E3E3E3' }} />
          )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 30, fontWeight: 700 }}>{author?.name ?? 'Carlos Peraza'}</span>
            <span style={{ fontSize: 22, color: '#8b8b9a' }}>{author?.headline ?? 'Software Engineer | Tech Lead'}</span>
          </div>
          <div style={{ display: 'flex', gap: 10, marginLeft: 'auto' }}>
            {(post?.tags ?? []).slice(0, 3).map((tag) => (
              <span
                key={tag}
                style={{ fontSize: 20, padding: '8px 16px', borderRadius: 999, border: '1px solid #3a4566', color: '#E3E3E3' }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size, headers: { 'Cache-Control': cacheControl } }
  )
}
