import 'server-only'
import { revalidatePath, revalidateTag } from 'next/cache'
import { CONTENT_TAG } from '@/lib/data/content'
import { POSTS_TAG } from '@/lib/data/blog'

/**
 * Makes every admin change visible on the live site immediately.
 *
 * - Tags invalidate the cached database queries.
 * - '/[lang]' + 'layout' invalidates every prerendered page under the real root
 *   layout (home, blog, posts, case studies) in both languages. Note: '/' would
 *   NOT work here, because the site's root layout lives at app/[lang].
 * - Root-level files (sitemap, feeds, llms.txt) live outside [lang].
 */
export function revalidateSite() {
  revalidateTag(CONTENT_TAG)
  revalidateTag(POSTS_TAG)
  revalidatePath('/[lang]', 'layout')
  for (const path of ['/sitemap.xml', '/llms.txt', '/feed.xml']) revalidatePath(path)
}
