import { buildFeed } from '@/lib/feed'

// English feed at /feed.xml (Spanish: /es/feed.xml)
export const revalidate = 3600

export function GET() {
  return buildFeed('en')
}
