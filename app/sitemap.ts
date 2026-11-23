import type { MetadataRoute } from 'next'
import { getCaseStudies, getLastContentUpdate } from '@/lib/contentful'
import { HOME_URL, HREFLANG, absoluteUrl, hreflangFor } from '@/lib/i18n'

// Fallback used only if Contentful can't be reached. Update it when the site's
// code or static content changes in a meaningful way.
const SITE_LAST_UPDATED = new Date('2026-11-22')

// Regenerate at most once a day.
export const revalidate = 86400

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [contentUpdated, caseStudies] = await Promise.all([
    getLastContentUpdate(),
    getCaseStudies('en-US'),
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

  return [...home, ...projects]
}
