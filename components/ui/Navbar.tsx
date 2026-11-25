'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Github } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useLocale } from '@/context/locale-context'
import { HOME_PATH, langFromLocale, localePath } from '@/lib/i18n'

const NAV_LINKS = [
  { href: '#about', label: { 'en-US': 'About', 'es-419': 'Sobre Mí' } },
  { href: '#experience', label: { 'en-US': 'Experience', 'es-419': 'Experiencia' } },
//   { href: '#skills', label: { 'en-US': 'Skills', 'es-419': 'Skills' } },
  { href: '#projects', label: { 'en-US': 'Projects', 'es-419': 'Proyectos' } },
  { href: '#education', label: { 'en-US': 'Education', 'es-419': 'Educación' } },
  { href: '#contact', label: { 'en-US': 'Contact', 'es-419': 'Contacto' } },
]

const SECTION_IDS = ['hero', 'about', 'experience', 'skills', 'projects', 'education', 'rewards', 'contact']

export default function Navbar() {
  const { locale, setLocale } = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const blogHref = localePath(langFromLocale(locale), '/blog')
  const onBlog = /\/blog(\/|$)/.test(pathname)
  const [activeSection, setActiveSection] = useState('hero')
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Scroll spy
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)

      const scrollY = window.scrollY + 120
      for (let i = SECTION_IDS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTION_IDS[i])
        if (el && el.offsetTop <= scrollY) {
          setActiveSection(SECTION_IDS[i])
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // While the mobile menu is open: lock page scroll and close with Escape
  useEffect(() => {
    if (!mobileOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [mobileOpen])

  const scrollTo = useCallback((href: string) => {
    const id = href.replace('#', '')
    const el = document.getElementById(id)
    setMobileOpen(false)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    // On other pages (e.g. a project page) go back to the home section
    else router.push(`${HOME_PATH[langFromLocale(locale)]}${href}`)
  }, [locale, router])

  return (
    <>
      <motion.header
        className="navbar-glass fixed top-0 left-0 right-0 z-50"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
          transition: 'border-color 0.3s ease',
        }}
      >
        <div
          className="flex items-center justify-between gap-4 px-6 md:px-8"
          style={{ height: '70px', maxWidth: '72rem', margin: '0 auto' }}
        >
          {/* Logo */}
          <a
            href="https://github.com/cperazal"
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center gap-2 font-mono font-bold text-lg tracking-tight shrink-0 group"
            style={{ color: 'var(--accent)', textDecoration: 'none' }}
            aria-label="GitHub profile @cperazal"
          >
            <Github
              size={18}
              style={{ color: 'var(--icon-muted)', transition: 'color 0.2s' }}
              className="group-hover:text-[color:var(--text-primary)]!"
            />
            <span>
              @cperazal
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Site navigation">
            {NAV_LINKS.map(({ href, label }) => {
              const id = href.replace('#', '')
              const isActive = activeSection === id
              return (
                <button
                  key={href}
                  onClick={() => scrollTo(href)}
                  className="relative py-1 text-sm font-medium transition-colors duration-200"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  }}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {label[locale]}
                  {isActive && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-0 right-0 h-px rounded-full"
                      style={{ background: 'var(--accent)' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              )
            })}
            <Link
              href={blogHref}
              className="relative py-1 text-sm font-medium transition-colors duration-200"
              style={{ color: onBlog ? 'var(--accent)' : 'var(--text-secondary)', textDecoration: 'none' }}
              aria-current={onBlog ? 'page' : undefined}
            >
              Blog
            </Link>
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Language toggle */}
            <div
              className="hidden sm:flex items-center relative"
              role="group"
              aria-label="Language selector"
            >
              {(['en-US', 'es-419'] as const).map((lang, i) => {
                const isActive = locale === lang
                return (
                  <button
                    key={lang}
                    onClick={() => setLocale(lang)}
                    className="relative z-10 w-8 h-5 text-xs font-mono font-bold tracking-widest transition-colors duration-200"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: isActive ? 'var(--bg)' : 'var(--text-secondary)',
                      borderRadius: '6px',
                    }}
                    aria-pressed={isActive}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="lang-pill"
                        className="absolute inset-0 rounded-md -z-10"
                        style={{ background: 'var(--accent)' }}
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    {lang === 'en-US' ? 'EN' : 'ES'}
                  </button>
                )
              })}
            </div>

            {/* Light / dark switch (dark is the default) */}
            <ThemeToggle />

            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="flex items-center justify-center w-9 h-9 rounded-lg md:hidden"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
              }}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Overlay */}
            <motion.div
              key="overlay"
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: 'rgba(0,0,0,0.5)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer (inline styles: the public site's CSS reset ignores Tailwind spacing) */}
            <motion.div
              key="drawer"
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label={locale === 'es-419' ? 'Menú' : 'Menu'}
              className="md:hidden"
              style={{
                position: 'fixed',
                top: 70,
                right: 0,
                bottom: 0,
                width: '100%',
                maxWidth: '26rem',
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--surface)',
                borderLeft: '1px solid var(--border)',
                borderTop: '1px solid var(--border)',
                padding: '1.25rem 1.25rem calc(1.5rem + env(safe-area-inset-bottom))',
                overflowY: 'auto',
              }}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 34 }}
            >
              {/* Nav links */}
              <nav aria-label={locale === 'es-419' ? 'Navegación' : 'Navigation'} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {[...NAV_LINKS.map((l) => ({ ...l, isPage: false })), { href: blogHref, label: { 'en-US': 'Blog', 'es-419': 'Blog' }, isPage: true }].map(
                  ({ href, label, isPage }, i) => {
                    const isActive = isPage ? onBlog : !onBlog && activeSection === href.replace('#', '')
                    const itemStyle = {
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.9rem',
                      width: '100%',
                      padding: '0.95rem 1rem',
                      borderRadius: '12px',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      textAlign: 'left' as const,
                      textDecoration: 'none',
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: isActive ? 'var(--border-accent)' : 'transparent',
                      background: isActive ? 'var(--bg-card)' : 'transparent',
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      transition: 'background 0.2s, color 0.2s',
                    }
                    const content = (
                      <>
                        <span className="font-mono" style={{ fontSize: '0.72rem', color: isActive ? 'var(--accent)' : 'var(--text-secondary)', minWidth: '1.5rem' }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span style={{ flex: 1 }}>{label[locale]}</span>
                        {isActive && <span aria-hidden style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--accent)' }} />}
                      </>
                    )
                    return isPage ? (
                      <Link key={href} href={href} onClick={() => setMobileOpen(false)} style={itemStyle} aria-current={isActive ? 'page' : undefined}>
                        {content}
                      </Link>
                    ) : (
                      <button key={href} type="button" onClick={() => scrollTo(href)} style={itemStyle} aria-current={isActive ? 'true' : undefined}>
                        {content}
                      </button>
                    )
                  }
                )}
              </nav>

              {/* Footer: language selector */}
              <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                <p className="font-mono" style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  {locale === 'es-419' ? 'Idioma' : 'Language'}
                </p>
                <div role="group" aria-label="Language selector" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', padding: '0.3rem', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  {(['en-US', 'es-419'] as const).map((lang) => {
                    const isActive = locale === lang
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setLocale(lang)}
                        aria-pressed={isActive}
                        style={{
                          padding: '0.65rem 0',
                          borderRadius: '9px',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.95rem',
                          fontWeight: 600,
                          background: isActive ? 'var(--accent)' : 'transparent',
                          color: isActive ? 'var(--on-accent)' : 'var(--text-secondary)',
                          transition: 'background 0.2s, color 0.2s',
                        }}
                      >
                        {lang === 'en-US' ? 'English' : 'Español'}
                      </button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
