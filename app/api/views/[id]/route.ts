import { NextResponse } from 'next/server'
import { eq, sql } from 'drizzle-orm'
import { getDb, schema as s } from '@/lib/db'
import { UUID, isBot } from '@/lib/visitor'

// View counter per post. The article stays static and cached; the browser
// calls this once per session to count the visit and read the total.
export const dynamic = 'force-dynamic'

type Ctx = { params: Promise<{ id: string }> }

async function current(id: string) {
  const [row] = await getDb().select({ count: s.postViews.count }).from(s.postViews).where(eq(s.postViews.postId, id))
  return row?.count ?? 0
}

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params
  if (!UUID.test(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  return NextResponse.json({ views: await current(id) }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params
  if (!UUID.test(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  if (isBot(req)) return NextResponse.json({ views: await current(id) })

  try {
    // Atomic increment (no lost updates under concurrent visits)
    const [row] = await getDb()
      .insert(s.postViews)
      .values({ postId: id, count: 1 })
      .onConflictDoUpdate({ target: s.postViews.postId, set: { count: sql`${s.postViews.count} + 1` } })
      .returning({ count: s.postViews.count })
    return NextResponse.json({ views: row.count }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    // Unknown post id (foreign key) or database hiccup: don't break the page
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
