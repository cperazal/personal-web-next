'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { Locale } from '@/lib/types'
import { langFromLocale, switchLangPath } from '@/lib/i18n'

// The language comes from the URL ("/" = English, "/es" = Spanish), so the
// server renders the right language and each version has its own indexable URL.
// Switching language loads the other URL, keeping the current #section.
// app/[lang]/layout.tsx is the root layout (it sets <html lang>), so changing
// language is a full page load either way; a plain navigation lets the browser
// restore the #section natively.

interface LocaleContextValue {
  locale: Locale
  setLocale: (lang: Locale) => void
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'en-US',
  setLocale: () => {},
})

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const setLocale = (next: Locale) => {
    if (next === locale) return
    const target = switchLangPath(window.location.pathname, langFromLocale(next))
    window.location.assign(`${target}${window.location.hash}`)
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
