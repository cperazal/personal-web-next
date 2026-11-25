import { redirect } from 'next/navigation'
import { signOut } from '@/auth'
import { requireAdmin, UnauthorizedError } from '@/lib/auth/require-admin'
import AdminNav from '@/components/admin/AdminNav'

// Never prerender or cache admin pages
export const dynamic = 'force-dynamic'

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  let email = ''
  try {
    email = (await requireAdmin()).user?.email ?? ''
  } catch (e) {
    if (e instanceof UnauthorizedError) redirect('/admin/login')
    throw e
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside
        className="md:w-60 md:min-h-screen flex md:flex-col gap-4 p-4 md:p-6 shrink-0"
        style={{ borderRight: '1px solid var(--border)', background: 'var(--surface-2)' }}
      >
        <div className="font-mono font-bold" style={{ color: 'var(--accent)' }}>
          @cperazal · admin
        </div>
        <AdminNav />
        <div className="hidden md:flex flex-col gap-2 mt-auto text-xs" style={{ color: 'var(--text-secondary)' }}>
          <span className="truncate" title={email}>{email}</span>
          <form
            action={async () => {
              'use server'
              await signOut({ redirectTo: '/admin/login' })
            }}
          >
            <button type="submit" className="btn-outline w-full justify-center text-xs">
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-8 min-w-0">{children}</main>
    </div>
  )
}
