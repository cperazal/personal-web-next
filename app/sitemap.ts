import type { MetadataRoute } from 'next'
import { getLastContentUpdate } from '@/lib/contentful'
import { HOME_URL, HREFLANG } from '@/lib/i18n'

// Fallback used only if Contentful can't be reached. Update it when the site's
// code or static content changes in a meaningful way.
const SITE_LAST_UPDATED = new Date('2026-11-20')

// Regenerate at most once a day.
export const revalidate = 86400

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const contentUpdated = await getLastContentUpdate()
  const lastModified =
    contentUpdated && contentUpdated > SITE_LAST_UPDATED ? contentUpdated : SITE_LAST_UPDATED

  const alternates = { languages: HREFLANG }

  return [
    { url: HOME_URL.en, lastModified, changeFrequency: 'monthly', priority: 1.0, alternates },
    { url: HOME_URL.es, lastModified, changeFrequency: 'monthly', priority: 0.9, alternates },
  ]
}
