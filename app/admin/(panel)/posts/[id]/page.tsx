import { notFound } from 'next/navigation'
import { getPost } from '@/lib/admin/post-actions'
import PostEditor, { type PostEditorInitial } from '@/components/admin/PostEditor'

export const metadata = { title: 'Editar post' }

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const EMPTY: PostEditorInitial = {
  id: null,
  status: 'draft',
  titleEn: '',
  slugEn: '',
  excerptEn: '',
  contentEn: '',
  titleEs: '',
  slugEs: '',
  excerptEs: '',
  contentEs: '',
  coverUrl: null,
  coverAltEn: '',
  coverAltEs: '',
  tags: [],
  publishedAt: '',
}

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (id === 'new') return <PostEditor initial={EMPTY} />
  if (!UUID.test(id)) notFound()

  const p = await getPost(id)
  if (!p) notFound()
  const initial: PostEditorInitial = {
    id: p.id,
    status: p.status,
    titleEn: p.titleEn ?? '',
    slugEn: p.slugEn ?? '',
    excerptEn: p.excerptEn ?? '',
    contentEn: p.contentEn ?? '',
    titleEs: p.titleEs ?? '',
    slugEs: p.slugEs ?? '',
    excerptEs: p.excerptEs ?? '',
    contentEs: p.contentEs ?? '',
    coverUrl: p.coverUrl,
    coverAltEn: p.coverAltEn ?? '',
    coverAltEs: p.coverAltEs ?? '',
    tags: p.tags,
    publishedAt: p.publishedAt?.toISOString() ?? '',
  }
  // key: remount the editor when switching posts
  return <PostEditor key={p.id} initial={initial} />
}
