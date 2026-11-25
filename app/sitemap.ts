import type { MetadataRoute } from 'next'
import { getCaseStudies, getLastContentUpdate } from '@/lib/data/content'
import { getPublishedPosts, type PostSummary } from '@/lib/data/blog'
import { HOME_URL, HREFLANG, absoluteUrl, hreflangFor, type Lang } from '@/lib/i18n'

// Fallback when there are no content dates yet. Update it when the site's code
// or static content changes in a meaningful way.
const SITE_LAST_UPDATED = new Date('2026-11-23')

// Content changes revalidate through the admin; daily as a safety net.
export const revalidate = 86400

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [contentUpdated, caseStudies, postsEn, postsEs] = await Promise.all([
    getLastContentUpdate(),
    getCaseStudies('en-US'),
    getPublishedPosts('en'),
    getPublishedPosts('es'),
  ])
  const lastModified =
    contentUpdated && contentUpdated > SITE_LAST_UPDATED ? contentUpdated : SITE_LAST_UPDATED

  const home: MetadataRoute.Sitemap = [
    { url: HOME_URL.en, lastModified, changeFrequency: 'monthly', priority: 1.0, alternates: { languages: HREFLANG } },
    { url: HOME_URL.es, lastModified, changeFrequency: 'monthly', priority: 0.9, alternates: { languages: HREFLANG } },
  ]

  // One entry per case study and language, each with its real last edit date
  const projects: MetadataRoute.Sitemap = caseStudies.flatMap((p) => {
    const path = `/projects/${p.slug}`
    const updated = p.updatedAt ? new Date(p.updatedAt) : lastModified
    return (['en', 'es'] as const).map((lang) => ({
      url: absoluteUrl(lang, path),
      lastModified: updated,
      changeFrequency: 'yearly' as const,
      priority: 0.7,
      alternates: { languages: hreflangFor(path) },
    }))
  })

  // Blog index + every published post, linked to its translation (slugs differ per language)
  const newest = (posts: PostSummary[]) => (posts[0] ? new Date(posts[0].updatedAt) : lastModified)
  const blogIndex: MetadataRoute.Sitemap = (['en', 'es'] as const).map((lang) => ({
    url: absoluteUrl(lang, '/blog'),
    lastModified: newest(lang === 'en' ? postsEn : postsEs),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
    alternates: { languages: hreflangFor('/blog') },
  }))

  const postEntry = (p: PostSummary): MetadataRoute.Sitemap[number] => {
    const languages: Record<string, string> = { [p.lang]: absoluteUrl(p.lang, `/blog/${p.slug}`) }
    if (p.alternate) languages[p.alternate.lang] = absoluteUrl(p.alternate.lang, `/blog/${p.alternate.slug}`)
    languages['x-default'] = languages.en ?? languages[p.lang]
    return {
      url: absoluteUrl(p.lang as Lang, `/blog/${p.slug}`),
      lastModified: new Date(p.updatedAt),
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: { languages },
      images: p.coverUrl ? [p.coverUrl] : undefined,
    }
  }

  return [...home, ...blogIndex, ...postsEn.map(postEntry), ...postsEs.map(postEntry), ...projects]
}
