'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Ban, Check, ExternalLink, ShieldAlert, Trash2, X } from 'lucide-react'
import { deleteComment, setCommentStatus, type CommentStatus } from '@/lib/admin/comment-actions'

export interface ModerationComment {
  id: string
  name: string
  body: string
  lang: string
  status: CommentStatus
  createdAt: string
  titleEn: string | null
  titleEs: string | null
  slugEn: string | null
  slugEs: string | null
}

const TABS: { key: CommentStatus; label: string }[] = [
  { key: 'pending', label: 'Pendientes' },
  { key: 'approved', label: 'Aprobados' },
  { key: 'rejected', label: 'Rechazados' },
  { key: 'spam', label: 'Spam' },
]

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('es-419', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export default function CommentsModeration({
  status,
  rows: initial,
  counts,
}: {
  status: CommentStatus
  rows: ModerationComment[]
  counts: Record<CommentStatus, number>
}) {
  const router = useRouter()
  const [rows, setRows] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const act = (c: ModerationComment, fn: () => Promise<{ ok: boolean; error?: string }>) => {
    const prev = rows
    setRows(rows.filter((r) => r.id !== c.id))
    startTransition(async () => {
      const res = await fn().catch(() => ({ ok: false, error: 'Error de conexión.' }))
      if (!res.ok) {
        setRows(prev)
        setError(res.error ?? 'No se pudo completar la acción.')
      } else {
        setError(null)
        router.refresh()
      }
    })
  }

  return (
    <div className="flex flex-col gap-4 max-w-4xl">
      <h1 className="text-2xl font-bold">Comentarios</h1>
      <nav className="flex flex-wrap gap-2" aria-label="Estado">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/comments?status=${tab.key}`}
            className="px-3 py-1.5 rounded-lg text-sm"
            style={{
              background: status === tab.key ? 'var(--accent)' : 'var(--bg-card)',
              color: status === tab.key ? 'var(--bg)' : 'var(--text-secondary)',
              border: '1px solid var(--border)',
              textDecoration: 'none',
            }}
          >
            {tab.label} ({counts[tab.key]})
          </Link>
        ))}
      </nav>
      {error && (
        <p role="alert" className="admin-error">
          {error}
        </p>
      )}

      {rows.length === 0 ? (
        <p className="glass-card p-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {status === 'pending' ? 'No hay comentarios pendientes.' : 'Nada por aquí.'}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((c) => {
            const lang = c.lang === 'es' ? 'es' : 'en'
            const title = (lang === 'es' ? c.titleEs : c.titleEn) ?? c.titleEn ?? c.titleEs ?? 'Post'
            const slug = lang === 'es' ? c.slugEs : c.slugEn
            const url = slug ? `${lang === 'es' ? '/es' : ''}/blog/${slug}#comments` : null
            return (
              <li key={c.id} className="glass-card p-4 flex flex-col gap-3">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
                  <strong>{c.name}</strong>
                  <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {fmt(c.createdAt)} · {lang.toUpperCase()}
                  </span>
                  {url && (
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs inline-flex items-center gap-1 ml-auto"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {title} <ExternalLink size={12} />
                    </a>
                  )}
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#d6d6de' }}>
                  {c.body}
                </p>
                <div className="flex flex-wrap gap-2">
                  {status !== 'approved' && (
                    <button
                      type="button"
                      className="btn-accent text-xs"
                      onClick={() => act(c, () => setCommentStatus(c.id, 'approved'))}
                    >
                      <Check size={14} /> Aprobar
                    </button>
                  )}
                  {status !== 'rejected' && (
                    <button
                      type="button"
                      className="btn-outline text-xs"
                      onClick={() => act(c, () => setCommentStatus(c.id, 'rejected'))}
                    >
                      {status === 'approved' ? <Ban size={14} /> : <X size={14} />}{' '}
                      {status === 'approved' ? 'Ocultar' : 'Rechazar'}
                    </button>
                  )}
                  {status !== 'spam' && (
                    <button
                      type="button"
                      className="btn-outline text-xs"
                      onClick={() => act(c, () => setCommentStatus(c.id, 'spam'))}
                    >
                      <ShieldAlert size={14} /> Spam
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-outline text-xs"
                    onClick={() => {
                      if (confirm('¿Eliminar este comentario definitivamente?')) act(c, () => deleteComment(c.id))
                    }}
                  >
                    <Trash2 size={14} /> Eliminar
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
