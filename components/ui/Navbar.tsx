'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Github } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { useLocale } from '@/context/locale-context'

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

  const scrollTo = useCallback((href: string) => {
    const id = href.replace('#', '')
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    setMobileOpen(false)
  }, [])

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
              style={{ color: 'rgba(255,255,255,0.55)', transition: 'color 0.2s' }}
              className="group-hover:text-white!"
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

            {/* ThemeToggle hidden — re-enable by removing the hidden class */}
            <div className="hidden" aria-hidden="true"><ThemeToggle /></div>

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
            {/* Drawer */}
            <motion.div
              key="drawer"
              className="fixed top-[70px] right-0 bottom-0 w-72 z-50 md:hidden flex flex-col py-8 px-5"
              style={{ background: 'var(--surface)', borderLeft: '1px solid var(--border)' }}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 32 }}
            >
              {/* Nav links */}
              <nav className="flex flex-col gap-1 flex-1">
                {NAV_LINKS.map(({ href, label }) => {
                  const id = href.replace('#', '')
                  const isActive = activeSection === id
                  return (
                    <button
                      key={href}
                      onClick={() => scrollTo(href)}
                      className="flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-left transition-colors duration-200"
                      style={{
                        background: isActive ? 'var(--bg-card)' : 'transparent',
                        color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                        border: 'none',
                        cursor: 'pointer',
                        width: '100%',
                      }}
                    >
                      {label[locale]}
                      {isActive && (
                        <motion.span
                          layoutId="mobile-nav-dot"
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: 'var(--accent)' }}
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        />
                      )}
                    </button>
                  )
                })}
              </nav>

              {/* Divider */}
              <div style={{ height: '1px', background: 'var(--border)', marginBlock: '1.5rem' }} />

              {/* Language toggle — same pill style as desktop */}
              <div className="flex items-center gap-1 px-1">
                <span className="text-xs font-mono mr-3" style={{ color: 'var(--text-secondary)' }}>
                  Lang
                </span>
                {(['en-US', 'es-419'] as const).map((lang) => {
                  const isActive = locale === lang
                  return (
                    <button
                      key={lang}
                      onClick={() => setLocale(lang)}
                      className="relative w-10 h-8 text-xs font-mono font-bold tracking-widest transition-colors duration-200"
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
                          layoutId="mobile-lang-pill"
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
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
