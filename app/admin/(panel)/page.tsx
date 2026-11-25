import Link from 'next/link'
import { ADMIN_SECTIONS } from '@/lib/admin/sections'
import { dashboardStats } from '@/lib/admin/comment-actions'

export const metadata = { title: 'Inicio' }

export default async function AdminHome() {
  const stats = await dashboardStats()

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <header>
        <h1 className="text-2xl font-bold">Panel de administración</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Administra el contenido de carlosperaza.dev.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/admin/comments"
          className="glass-card p-5 flex flex-col gap-1"
          style={{ textDecoration: 'none', color: 'var(--text-primary)', borderColor: stats.pendingComments ? 'var(--warning)' : undefined }}
        >
          <span className="text-3xl font-bold">{stats.pendingComments}</span>
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Comentarios por moderar</span>
        </Link>
        <Link href="/admin/posts" className="glass-card p-5 flex flex-col gap-1" style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
          <span className="text-3xl font-bold">{stats.publishedPosts}</span>
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Posts publicados</span>
        </Link>
        <Link href="/admin/posts/new" className="glass-card p-5 flex flex-col justify-center gap-1" style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
          <span className="text-lg font-semibold">+ Nuevo post</span>
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Escribe y publica en EN/ES</span>
        </Link>
      </div>

      {stats.topPosts.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Posts más vistos</h2>
          <ol className="glass-card divide-y" style={{ borderColor: 'var(--border)' }}>
            {stats.topPosts.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm" style={{ borderColor: 'var(--border)' }}>
                <Link href={`/admin/posts/${p.id}`} className="truncate" style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                  {p.titleEs || p.titleEn}
                </Link>
                <span className="font-mono shrink-0" style={{ color: 'var(--text-secondary)' }}>{p.views} vistas</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Contenido</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ADMIN_SECTIONS.filter((s) => s.href !== '/admin').map(({ href, label }) => (
            <Link key={href} href={href} className="glass-card p-5 font-medium" style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
              {label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
