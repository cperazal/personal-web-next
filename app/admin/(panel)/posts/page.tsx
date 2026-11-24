import { listPosts } from '@/lib/admin/post-actions'
import PostsList, { type PostListItem } from '@/components/admin/PostsList'

export const metadata = { title: 'Blog' }

export default async function AdminPostsPage() {
  const rows = await listPosts()
  const now = Date.now()
  const posts: PostListItem[] = rows.map((p) => ({
    id: p.id,
    title: p.titleEs || p.titleEn || '',
    status: p.status,
    hasEn: Boolean(p.titleEn && p.contentEn),
    hasEs: Boolean(p.titleEs && p.contentEs),
    publishedAt: p.publishedAt?.toISOString() ?? null,
    updatedAt: p.updatedAt.toISOString(),
    views: p.views,
    scheduled: p.status === 'published' && Boolean(p.publishedAt && p.publishedAt.getTime() > now),
  }))
  return <PostsList posts={posts} />
}
