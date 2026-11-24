import Link from 'next/link'
import { ADMIN_SECTIONS } from '@/lib/admin/sections'

export const metadata = { title: 'Inicio' }

export default function AdminHome() {
  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <header>
        <h1 className="text-2xl font-bold">Panel de administración</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Administra el contenido de carlosperaza.dev.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ADMIN_SECTIONS.filter((s) => s.href !== '/admin').map(({ href, label }) => (
          <Link key={href} href={href} className="glass-card p-5 font-medium" style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
            {label}
          </Link>
        ))}
      </div>
    </div>
  )
}
