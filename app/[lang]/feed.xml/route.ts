import { buildFeed } from '@/lib/feed'
import { LANGS, isLang } from '@/lib/i18n'

// Serves /es/feed.xml (and /en/feed.xml, though /feed.xml is the canonical English one).
// Declaring both languages makes the route static (cached at the CDN) instead of
// running on every request; the admin refreshes it on save, hourly as a safety net.
export const revalidate = 3600
export const dynamicParams = false

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }))
}

export async function GET(_req: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return buildFeed(isLang(lang) ? lang : 'en')
}
