import type { MetadataRoute } from 'next'
import { getLastContentUpdate } from '@/lib/contentful'

const SITE_URL = 'https://carlosperaza.dev'

// Fallback used only if Contentful can't be reached. Update it when the site's
// code or static content changes in a meaningful way.
const SITE_LAST_UPDATED = new Date('2026-11-20')

// Regenerate at most once a day.
export const revalidate = 86400

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const contentUpdated = await getLastContentUpdate()
  const lastModified =
    contentUpdated && contentUpdated > SITE_LAST_UPDATED ? contentUpdated : SITE_LAST_UPDATED

  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
  ]
}
