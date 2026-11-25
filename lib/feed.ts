import 'server-only'
import { getPublishedPosts } from '@/lib/data/blog'
import { BLOG_COPY } from '@/lib/blog-copy'
import { absoluteUrl, feedUrl, type Lang } from '@/lib/i18n'

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')

/** RSS 2.0 feed of published posts in one language */
export async function buildFeed(lang: Lang): Promise<Response> {
  const t = BLOG_COPY[lang]
  const posts = await getPublishedPosts(lang)
  const blogUrl = absoluteUrl(lang, '/blog')

  const items = posts
    .map((p) => {
      const url = absoluteUrl(lang, `/blog/${p.slug}`)
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>
      <dc:creator>Carlos Peraza</dc:creator>
      <description>${esc(p.excerpt)}</description>
${p.tags.map((tag) => `      <category>${esc(tag)}</category>`).join('\n')}
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${esc(t.title)}</title>
    <link>${blogUrl}</link>
    <description>${esc(t.description)}</description>
    <language>${lang === 'es' ? 'es' : 'en'}</language>
    <atom:link href="${feedUrl(lang)}" rel="self" type="application/rss+xml" />
${posts[0] ? `    <lastBuildDate>${new Date(posts[0].updatedAt).toUTCString()}</lastBuildDate>\n` : ''}${items}
  </channel>
</rss>
`
  return new Response(xml, {
    // No custom Cache-Control: Next.js caches this route at the CDN (revalidate = 3600)
    // and the admin's revalidateSite() refreshes it on every save.
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
