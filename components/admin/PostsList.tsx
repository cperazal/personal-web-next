'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { deletePost } from '@/lib/admin/post-actions'

export interface PostListItem {
  id: string
  title: string
  status: 'draft' | 'published'
  hasEn: boolean
  hasEs: boolean
  publishedAt: string | null
  updatedAt: string
  views: number
  scheduled: boolean
}

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('es-419', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

export default function PostsList({ posts: initial }: { posts: PostListItem[] }) {
  const router = useRouter()
  const [posts, setPosts] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const remove = (p: PostListItem) => {
    if (!confirm(`¿Eliminar "${p.title}"? También se borran sus comentarios y visitas. No se puede deshacer.`)) return
    const prev = posts
    setPosts(posts.filter((x) => x.id !== p.id))
    startTransition(async () => {
      const res = await deletePost(p.id).catch(() => ({ ok: false, error: 'Error de conexión.' }))
      if (!res.ok) {
        setPosts(prev)
        setError(res.error ?? 'No se pudo eliminar.')
      } else router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-4 max-w-5xl">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Blog</h1>
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{posts.length}</span>
        <Link href="/admin/posts/new" className="btn-accent text-sm ml-auto">
          <Plus size={15} /> Nuevo post
        </Link>
      </div>
      {error && <p role="alert" className="admin-error">{error}</p>}

      {posts.length === 0 ? (
        <div className="glass-card p-8 text-center flex flex-col gap-3 items-center">
          <p>Todavía no hay posts.</p>
          <Link href="/admin/posts/new" className="btn-accent text-sm"><Plus size={15} /> Escribir el primero</Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {posts.map((p) => (
            <li key={p.id} className="glass-card flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <Link href={`/admin/posts/${p.id}`} className="font-medium block truncate" style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                  {p.title || '(sin título)'}
                </Link>
                <p className="text-xs flex flex-wrap gap-x-3 gap-y-1 mt-1" style={{ color: 'var(--text-secondary)' }}>
                  <span
                    style={{ color: p.status === 'published' ? (p.scheduled ? '#93c5fd' : '#86efac') : '#fbbf24' }}
                  >
                    {p.status === 'published' ? (p.scheduled ? `Programado · ${fmt(p.publishedAt)}` : `Publicado · ${fmt(p.publishedAt)}`) : 'Borrador'}
                  </span>
                  <span>EN {p.hasEn ? '✓' : '—'} · ES {p.hasEs ? '✓' : '—'}</span>
                  <span>Editado {fmt(p.updatedAt)}</span>
                  <span className="inline-flex items-center gap-1"><Eye size={12} /> {p.views}</span>
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Link href={`/admin/posts/${p.id}`} className="admin-icon-btn" aria-label="Editar"><Pencil size={15} /></Link>
                <button type="button" className="admin-icon-btn" aria-label="Eliminar" onClick={() => remove(p)}><Trash2 size={15} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
