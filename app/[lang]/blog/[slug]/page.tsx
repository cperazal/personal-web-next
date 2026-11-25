import { jsonLd } from '@/lib/jsonld'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { findSlugRedirect, getApprovedComments, getPostBySlug, getPublishedPosts, getRelatedPosts } from '@/lib/data/blog'
import { getAuthor } from '@/lib/data/content'
import { renderMarkdown } from '@/lib/markdown'
import { BLOG_COPY, formatDate } from '@/lib/blog-copy'
import { LOCALE_BY_LANG, SEO, SITE_URL, absoluteUrl, isLang, localePath, type Lang } from '@/lib/i18n'
import PostCard from '@/components/blog/PostCard'
import ShareButtons from '@/components/blog/ShareButtons'
import AuthorBox from '@/components/blog/AuthorBox'
import ViewCounter from '@/components/blog/ViewCounter'
import CommentForm from '@/components/blog/CommentForm'

// Static at build time; the admin revalidates on publish, hourly as a safety net.
// New posts published later are rendered on first visit.
export const revalidate = 3600

type Params = Promise<{ lang: string; slug: string }>

export async function generateStaticParams({ params }: { params: { lang: string } }) {
  const lang: Lang = isLang(params.lang) ? params.lang : 'en'
  try {
    return (await getPublishedPosts(lang)).map((p) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

async function load(params: Params) {
  const { lang: raw, slug } = await params
  if (!isLang(raw)) notFound()
  const lang: Lang = raw
  const post = await getPostBySlug(lang, slug)
  if (!post) {
    const current = await findSlugRedirect(lang, slug)
    if (current) permanentRedirect(localePath(lang, `/blog/${current}`))
    notFound()
  }
  return { lang, post }
}

const postPath = (slug: string) => `/blog/${slug}`

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, post } = await load(params)
  const url = absoluteUrl(lang, postPath(post.slug))
  const languages: Record<string, string> = { [lang]: url }
  if (post.alternate) languages[post.alternate.lang] = absoluteUrl(post.alternate.lang, postPath(post.alternate.slug))
  languages['x-default'] = languages.en ?? url

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    alternates: { canonical: url, languages },
    openGraph: {
      type: 'article',
      url,
      title: post.title,
      description: post.excerpt,
      siteName: 'carlosperaza.dev',
      locale: SEO[lang].ogLocale,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [SITE_URL],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      creator: '@cperazal',
    },
  }
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { lang, post } = await load(params)
  const t = BLOG_COPY[lang]
  const [rendered, author, related, comments] = await Promise.all([
    renderMarkdown(post.content),
    getAuthor(LOCALE_BY_LANG[lang]),
    getRelatedPosts(post),
    getApprovedComments(post.id),
  ])
  const url = absoluteUrl(lang, postPath(post.slug))
  const blogUrl = absoluteUrl(lang, '/blog')
  const ogImage = `${url}/opengraph-image`
  const wasUpdated = post.updatedAt.slice(0, 10) > post.publishedAt.slice(0, 10)

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${url}#article`,
        headline: post.title,
        description: post.excerpt,
        image: [ogImage, ...(post.coverUrl ? [post.coverUrl] : [])],
        datePublished: post.publishedAt,
        dateModified: post.updatedAt,
        inLanguage: lang,
        url,
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        author: { '@id': `${SITE_URL}/#person` },
        publisher: { '@id': `${SITE_URL}/#person` },
        isPartOf: { '@type': 'Blog', '@id': `${blogUrl}#blog`, url: blogUrl, name: t.title },
        keywords: post.tags.join(', '),
        wordCount: rendered.wordCount,
        timeRequired: `PT${post.readingTime}M`,
        commentCount: comments.length,
        ...(comments.length
          ? {
              comment: comments.map((c) => ({
                '@type': 'Comment',
                author: { '@type': 'Person', name: c.name },
                dateCreated: c.createdAt,
                text: c.body,
                inLanguage: c.lang,
              })),
            }
          : {}),
        ...(post.alternate
          ? { workTranslation: { '@id': `${absoluteUrl(post.alternate.lang, postPath(post.alternate.slug))}#article` } }
          : {}),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: t.home, item: absoluteUrl(lang, '/') },
          { '@type': 'ListItem', position: 2, name: t.blog, item: blogUrl },
          { '@type': 'ListItem', position: 3, name: post.title, item: url },
        ],
      },
    ],
  }

  return (
    <article className="container-section" style={{ maxWidth: '46rem', paddingTop: '8rem' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="font-mono text-xs" style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        <Link href={localePath(lang, '/')} style={{ color: 'inherit' }}>{t.home}</Link>
        {' / '}
        <Link href={localePath(lang, '/blog')} style={{ color: 'inherit' }}>{t.blog}</Link>
      </nav>

      {/* Header */}
      <header className="flex flex-col" style={{ gap: '1rem', marginBottom: '2.5rem' }}>
        <h1 className="font-bold" style={{ fontSize: 'clamp(2rem, 5vw, 2.75rem)', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{post.excerpt}</p>
        )}
        <p className="font-mono text-xs flex flex-wrap" style={{ color: 'var(--text-secondary)', gap: '0.25rem 0.75rem' }}>
          <span>
            {author?.name} · <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, lang)}</time>
          </span>
          {wasUpdated && (
            <span>
              {t.updated}: <time dateTime={post.updatedAt}>{formatDate(post.updatedAt, lang)}</time>
            </span>
          )}
          <span>{t.minRead(post.readingTime)}</span>
          <ViewCounter postId={post.id} locale={LOCALE_BY_LANG[lang]} />
        </p>
      </header>

      {post.coverUrl && (
        <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '1200 / 630', marginBottom: '2.5rem', border: '1px solid var(--border)' }}>
          <Image src={post.coverUrl} alt={post.coverAlt} fill priority className="object-cover" sizes="(max-width: 768px) 100vw, 736px" />
        </div>
      )}

      {rendered.toc.length >= 3 && (
        <details className="glass-card" style={{ padding: '1rem 1.25rem', marginBottom: '2.5rem' }} open>
          <summary className="font-semibold cursor-pointer">{t.toc}</summary>
          <ol style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {rendered.toc.map((h) => (
              <li key={h.id} style={{ paddingLeft: h.level === 3 ? '1rem' : 0 }}>
                <a href={`#${h.id}`} className="text-sm" style={{ color: 'var(--text-secondary)' }}>{h.text}</a>
              </li>
            ))}
          </ol>
        </details>
      )}

      {/* Body (sanitized HTML rendered on the server) */}
      <div className="prose-blog" dangerouslySetInnerHTML={{ __html: rendered.html }} />

      {post.tags.length > 0 && (
        <ul className="flex flex-wrap" style={{ gap: '0.5rem', marginTop: '2.5rem' }}>
          {post.tags.map((tag) => (
            <li key={tag} className="tech-chip">{tag}</li>
          ))}
        </ul>
      )}

      <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
        <ShareButtons url={url} title={post.title} labels={{ share: t.share, copy: t.copy, copied: t.copied }} />
      </div>

      {author && (
        <div style={{ marginTop: '2.5rem' }}>
          <AuthorBox author={author} lang={lang} title={t.about} />
        </div>
      )}


      {/* Comments: approved ones are part of the server HTML (indexable) */}
      <section id="comments" style={{ marginTop: '4rem' }} aria-labelledby="comments-heading">
        <h2 id="comments-heading" className="text-xl font-semibold" style={{ marginBottom: '1.25rem' }}>
          {t.comments} {comments.length > 0 && <span style={{ color: 'var(--text-secondary)' }}>({comments.length})</span>}
        </h2>
        {comments.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{t.noComments}</p>
        ) : (
          <ol className="flex flex-col" style={{ gap: '1rem', marginBottom: '2rem' }}>
            {comments.map((c) => (
              <li key={c.id} className="glass-card" style={{ padding: '1.1rem 1.25rem' }}>
                <p className="text-sm flex flex-wrap items-baseline" style={{ gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <strong>{c.name}</strong>
                  <time dateTime={c.createdAt} className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {formatDate(c.createdAt, lang)}
                  </time>
                  {c.lang !== lang && <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>· {t.otherLang}</span>}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: '#d6d6de', whiteSpace: 'pre-line' }}>{c.body}</p>
              </li>
            ))}
          </ol>
        )}
        <CommentForm
          postId={post.id}
          lang={lang}
          labels={{
            leaveComment: t.leaveComment,
            yourName: t.yourName,
            yourComment: t.yourComment,
            send: t.send,
            sending: t.sending,
            moderationNote: t.moderationNote,
            thanks: t.thanks,
            errCaptcha: t.errCaptcha,
            errRate: t.errRate,
            errGeneric: t.errGeneric,
            errFields: t.errFields,
          }}
        />
      </section>

      {related.length > 0 && (
        <section style={{ marginTop: '4rem' }} aria-labelledby="related-heading">
          <h2 id="related-heading" className="text-xl font-semibold" style={{ marginBottom: '1.25rem' }}>{t.related}</h2>
          <div className="grid sm:grid-cols-2" style={{ gap: '1.25rem' }}>
            {related.slice(0, 2).map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}

      <Link
        href={localePath(lang, '/blog')}
        className="inline-flex items-center font-mono text-sm"
        style={{ color: 'var(--accent)', textDecoration: 'none', gap: '0.5rem', marginTop: '3rem' }}
      >
        <ArrowLeft size={15} /> {t.allPosts}
      </Link>
    </article>
  )
}
