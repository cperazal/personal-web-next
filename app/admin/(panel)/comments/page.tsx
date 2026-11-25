import { listComments, type CommentStatus } from '@/lib/admin/comment-actions'
import CommentsModeration from '@/components/admin/CommentsModeration'

export const metadata = { title: 'Comentarios' }

const VALID: CommentStatus[] = ['pending', 'approved', 'rejected', 'spam']

export default async function CommentsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status: raw } = await searchParams
  const status = VALID.includes(raw as CommentStatus) ? (raw as CommentStatus) : 'pending'
  const { rows, counts } = await listComments(status)
  // key: reset local state when switching tabs
  return <CommentsModeration key={status} status={status} rows={rows} counts={counts} />
}
