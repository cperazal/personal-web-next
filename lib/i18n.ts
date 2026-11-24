import type { Locale } from './types'

/* ─── URL languages ──────────────────────────────────────────────────────────
 * English lives at "/" and Spanish at "/es". Internally both are served by the
 * app/[lang] route: middleware rewrites "/" → "/en" so the URL stays clean.
 */
export const SITE_URL = 'https://carlosperaza.dev'

export const LANGS = ['en', 'es'] as const
export type Lang = (typeof LANGS)[number]

export function isLang(value: string): value is Lang {
  return (LANGS as readonly string[]).includes(value)
}

/** Contentful locale for each URL language */
export const CONTENTFUL_LOCALE: Record<Lang, Locale> = {
  en: 'en-US',
  es: 'es-419',
}

/** URL language for each Contentful locale */
export function langFromLocale(locale: Locale): Lang {
  return locale === 'es-419' ? 'es' : 'en'
}

/** Public path of the home page in each language */
export const HOME_PATH: Record<Lang, string> = {
  en: '/',
  es: '/es',
}

/** Absolute URL of the home page in each language */
export const HOME_URL: Record<Lang, string> = {
  en: SITE_URL,
  es: `${SITE_URL}/es`,
}

/** Public path of any page in a language: localePath('es', '/projects/x') → '/es/projects/x' */
export function localePath(lang: Lang, path: string): string {
  const clean = path === '/' ? '' : path
  return lang === 'es' ? `/es${clean}` : clean || '/'
}

/** Same page in the other language, from a public pathname */
export function switchLangPath(pathname: string, target: Lang): string {
  const base = pathname === '/es' ? '/' : pathname.startsWith('/es/') ? pathname.slice(3) : pathname
  return localePath(target, base)
}

/** Absolute URL of any page in a language */
export function absoluteUrl(lang: Lang, path: string): string {
  const p = localePath(lang, path)
  return p === '/' ? SITE_URL : `${SITE_URL}${p}`
}

/** hreflang map for any page path (e.g. '/projects/x') */
export function hreflangFor(path: string) {
  return { en: absoluteUrl('en', path), es: absoluteUrl('es', path), 'x-default': absoluteUrl('en', path) }
}

/** hreflang map shared by metadata and sitemap */
export const HREFLANG = {
  en: HOME_URL.en,
  es: HOME_URL.es,
  'x-default': HOME_URL.en,
}

/* ─── Per-language SEO copy (keep descriptions under ~155 characters) ─────── */
export const SEO: Record<
  Lang,
  { title: string; description: string; ogLocale: string; jobTitle: string; homeLabel: string }
> = {
  en: {
    title: 'Carlos Peraza — Software Engineer | Tech Lead',
    description:
      'Software Engineer and Tech Lead in Costa Rica with 9+ years building APIs and web apps with .NET, React, and Python. Now building AI agents and MCP.',
    ogLocale: 'en_US',
    jobTitle: 'Software Engineer | Tech Lead',
    homeLabel: 'Home',
  },
  es: {
    title: 'Carlos Peraza — Ingeniero de Software | Tech Lead',
    description:
      'Ingeniero de software y Tech Lead en Costa Rica con 9+ años creando APIs y aplicaciones web con .NET, React y Python. Hoy creo agentes de IA y MCP.',
    ogLocale: 'es_LA',
    jobTitle: 'Ingeniero de Software | Tech Lead',
    homeLabel: 'Inicio',
  },
}

/** RSS feed per language: /feed.xml and /es/feed.xml */
export const feedUrl = (lang: Lang) => `${SITE_URL}${lang === 'es' ? '/es' : ''}/feed.xml`
