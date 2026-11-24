import { signIn } from '@/auth'

export const metadata = { title: 'Iniciar sesión' }

const ERRORS: Record<string, string> = {
  AccessDenied: 'Esa cuenta de Google no tiene acceso a este panel.',
  Configuration: 'Falta configurar el inicio de sesión (variables de entorno de Google/Auth).',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const message = error ? (ERRORS[error] ?? 'No se pudo iniciar sesión. Inténtalo de nuevo.') : null

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card w-full max-w-sm p-8 flex flex-col gap-6 text-center">
        <div>
          <p className="font-mono text-xs tracking-widest uppercase" style={{ color: 'var(--text-secondary)' }}>
            carlosperaza.dev
          </p>
          <h1 className="text-2xl font-bold mt-2">Panel de administración</h1>
        </div>

        {message && (
          <p role="alert" className="text-sm rounded-lg px-3 py-2" style={{ background: 'rgba(239,68,68,0.12)', color: '#fca5a5' }}>
            {message}
          </p>
        )}

        <form
          action={async () => {
            'use server'
            await signIn('google', { redirectTo: '/admin' })
          }}
        >
          <button type="submit" className="btn-accent w-full justify-center">
            Entrar con Google
          </button>
        </form>
      </div>
    </main>
  )
}
