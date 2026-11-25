'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocale } from '@/context/locale-context'

const LABELS = {
  en: { toLight: 'Switch to light mode', toDark: 'Switch to dark mode' },
  es: { toLight: 'Cambiar a modo claro', toDark: 'Cambiar a modo oscuro' },
}

/** Light/dark switch. `lang` overrides the site locale (the admin is always Spanish). */
export default function ThemeToggle({ lang }: { lang?: 'en' | 'es' }) {
  const { resolvedTheme, setTheme } = useTheme()
  const { locale } = useLocale()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="w-9 h-9" aria-hidden="true" />

  const isDark = resolvedTheme !== 'light'
  const t = LABELS[lang ?? (locale === 'es-419' ? 'es' : 'en')]
  const label = isDark ? t.toLight : t.toDark

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={label}
      title={label}
      className="flex items-center justify-center w-9 h-9 rounded-lg transition-colors duration-200 shrink-0"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        color: isDark ? '#fbbf24' : '#64748b',
        cursor: 'pointer',
      }}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}
