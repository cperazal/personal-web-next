'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Locale } from '@/lib/types'

// ─── Cookie helpers (no external dep) ────────────────────────────────────────
function getLocaleCookie(): Locale | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/(?:^|;\s*)locale=([^;]*)/)
  const val = match ? decodeURIComponent(match[1]) : null
  return val === 'es-419' || val === 'en-US' ? val : null
}

function setLocaleCookie(value: Locale): void {
  if (typeof document !== 'undefined') {
    const maxAge = 365 * 24 * 60 * 60
    document.cookie = `locale=${encodeURIComponent(value)};path=/;max-age=${maxAge};SameSite=Lax`
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface LocaleContextValue {
  locale: Locale
  setLocale: (lang: Locale) => void
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'en-US',
  setLocale: () => {},
})

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en-US')

  useEffect(() => {
    const saved = getLocaleCookie()
    if (saved) setLocaleState(saved)
  }, [])

  const setLocale = (lang: Locale) => {
    setLocaleState(lang)
    setLocaleCookie(lang)
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext)
}
