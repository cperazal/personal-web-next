import type { Metadata } from 'next'
import Link from 'next/link'
import { getPublishedPosts } from '@/lib/data/blog'
import { BLOG_COPY } from '@/lib/blog-copy'
import { SEO, SITE_URL, absoluteUrl, feedUrl, hreflangFor, isLang, localePath, type Lang } from '@/lib/i18n'
import PostCard from '@/components/blog/PostCard'

export const revalidate = 3600

type Params = Promise<{ lang: string }>

async function getLang(params: Params): Promise<Lang> {
  const { lang } = await params
  return isLang(lang) ? lang : 'en'
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const lang = await getLang(params)
  const t = BLOG_COPY[lang]
  const url = absoluteUrl(lang, '/blog')
  return {
    title: { absolute: t.title },
    description: t.description,
    alternates: {
      canonical: url,
      languages: hreflangFor('/blog'),
      types: { 'application/rss+xml': feedUrl(lang) },
    },
    openGraph: {
      type: 'website',
      url,
      title: t.title,
      description: t.description,
      locale: SEO[lang].ogLocale,
      images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title: t.title, description: t.description },
  }
}

export default async function BlogIndexPage({ params }: { params: Params }) {
  const lang = await getLang(params)
  const t = BLOG_COPY[lang]
  const posts = await getPublishedPosts(lang)
  const url = absoluteUrl(lang, '/blog')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Blog',
        '@id': `${url}#blog`,
        url,
        name: t.title,
        description: t.description,
        inLanguage: lang,
        author: { '@id': `${SITE_URL}/#person` },
        publisher: { '@id': `${SITE_URL}/#person` },
        blogPost: posts.map((p) => ({
          '@type': 'BlogPosting',
          headline: p.title,
          url: absoluteUrl(lang, `/blog/${p.slug}`),
          datePublished: p.publishedAt,
          dateModified: p.updatedAt,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: t.home, item: absoluteUrl(lang, '/') },
          { '@type': 'ListItem', position: 2, name: t.blog, item: url },
        ],
      },
    ],
  }

  return (
    <div className="container-section" style={{ paddingTop: '8rem' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="font-mono text-xs" style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        <Link href={localePath(lang, '/')} style={{ color: 'inherit' }}>{t.home}</Link> / {t.blog}
      </nav>
      <header style={{ marginBottom: '3rem', maxWidth: '44rem' }}>
        <h1 className="section-heading">{t.blog}</h1>
        <p className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)', marginTop: '0.75rem' }}>{t.heading}</p>
      </header>

      {posts.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>{t.empty}</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3" style={{ gap: '1.5rem' }}>
          {posts.map((p, i) => (
            <PostCard key={p.id} post={p} priority={i < 3} />
          ))}
        </div>
      )}
    </div>
  )
}
