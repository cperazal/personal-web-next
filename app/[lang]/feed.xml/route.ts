import { buildFeed } from '@/lib/feed'
import { isLang } from '@/lib/i18n'

// Serves /es/feed.xml (and /en/feed.xml, though /feed.xml is the canonical English one)
export const revalidate = 3600

export async function GET(_req: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return buildFeed(isLang(lang) ? lang : 'en')
}
