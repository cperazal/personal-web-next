import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '404 — Page Not Found',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
        background: 'var(--bg)',
        color: 'var(--text-primary)',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          marginBottom: '1rem',
        }}
      >
        Error 404
      </p>

      <h1
        style={{
          fontSize: 'clamp(2.5rem, 8vw, 5rem)',
          fontWeight: 700,
          lineHeight: 1.1,
          margin: '0 0 1.5rem',
        }}
      >
        Page not found
      </h1>

      <p
        style={{
          fontSize: '1.125rem',
          color: 'var(--text-secondary)',
          maxWidth: '28rem',
          marginBottom: '2.5rem',
          lineHeight: 1.6,
        }}
      >
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <Link
        href="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 2rem',
          borderRadius: '9999px',
          border: '1px solid var(--border-accent)',
          color: 'var(--text-primary)',
          fontSize: '0.9rem',
          fontFamily: 'var(--font-mono)',
          textDecoration: 'none',
          transition: 'background 0.2s, border-color 0.2s',
        }}
      >
        ← Back to Home
      </Link>
    </div>
  )
}
