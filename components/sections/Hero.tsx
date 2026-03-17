'use client'

import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TypeAnimation } from 'react-type-animation'
import { Github, Linkedin, Facebook, Twitter, Globe, ArrowDown, Mail } from 'lucide-react'
import type { PersonalInfo, Skill } from '@/lib/types'
import { useLocale } from '@/context/locale-context'
import { getPersonalInfo, getSkills } from '@/lib/contentful'
import { useState } from 'react'

interface HeroProps {
  initialPersonalInfo: PersonalInfo[]
  initialSkills: Skill[]
}

const SOCIAL_ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  github: Github,
  linkedin: Linkedin,
  facebook: Facebook,
  twitter: Twitter,
  web: Globe,
  correo: Mail,
}

const TYPEWRITER_SEQUENCE = [
  'Software Engineer',
  1800,
  'Backend Integration',
  1800,
  'Web Scraping',
  1800,
  'AI Integration',
  1800,
  'WhatsApp API Cloud',
  1800,
]

// ─── Floating icons config ────────────────────────────────────────────────────
/** Master toggle — set to false to remove all floating icons from the background */
const SHOW_FLOATING_ICONS = true

/**
 * Names of skills to show as floating icons (must match `nombre` in Contentful,
 * case-insensitive). Remove or add names freely.
 * Set to [] to automatically use the top 12 skills sorted by level.
 */
const FLOATING_ICON_NAMES: string[] = [
  'JavaScript',
  'React',
  'Next js',
  'Python',
  'C#',
  'Git',
]

export default function Hero({ initialPersonalInfo, initialSkills }: HeroProps) {
  const { locale } = useLocale()
  const [personalInfo, setPersonalInfo] = useState(initialPersonalInfo)
  const [skills, setSkills] = useState(initialSkills)
  const [floatingMounted, setFloatingMounted] = useState(false)
  const isMounted = useRef(false)

  useEffect(() => {
    setFloatingMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return }
    getPersonalInfo(locale).then(setPersonalInfo)
    getSkills().then(setSkills)
  }, [locale])

  const person = personalInfo[0]
  if (!person) return null

  const socials: { key: string; href: string }[] = [
    ...(person.github ? [{ key: 'github', href: person.github }] : []),
    ...(person.linkedin ? [{ key: 'linkedin', href: person.linkedin }] : []),
    ...(person.facebook ? [{ key: 'facebook', href: person.facebook }] : []),
    ...(person.twitter ? [{ key: 'twitter', href: person.twitter }] : []),
  ]

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  // Build the floating icons list based on config
  let heroIcons: Skill[] = []
  if (SHOW_FLOATING_ICONS) {
    if (FLOATING_ICON_NAMES.length > 0) {
      const lowerNames = FLOATING_ICON_NAMES.map(n => n.toLowerCase())
      const filtered = skills.filter(s => lowerNames.includes(s.nombre.toLowerCase()))
      // preserve order defined in FLOATING_ICON_NAMES
      heroIcons = FLOATING_ICON_NAMES
        .map(name => filtered.find(s => s.nombre.toLowerCase() === name.toLowerCase()))
        .filter((s): s is Skill => s !== undefined)
    } else {
      heroIcons = [...skills].sort((a, b) => b.nivel - a.nivel).slice(0, 12)
    }
  }

  return (
    <section
      id="hero"
      className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden"
      style={{ paddingTop: '70px' }}
    >
      {/* Background radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(ellipse 80% 60% at 50% 0%, var(--glow) 0%, transparent 70%)`,
          opacity: 0.6,
        }}
        aria-hidden="true"
      />

      {/* Floating skill icons — client-only to avoid floating-point hydration mismatch */}
      {floatingMounted && SHOW_FLOATING_ICONS && heroIcons.length > 0 && (
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {heroIcons.map((skill, i) => {
          const angle = (i / heroIcons.length) * 2 * Math.PI
          // Distribute around edges
          const rx = 42 + (i % 3) * 6
          const ry = 35 + (i % 4) * 5
          const cx = 50 + rx * Math.cos(angle)
          const cy = 50 + ry * Math.sin(angle)
          const delay = i * 0.25
          const duration = 3 + (i % 3)

          return (
            <motion.div
              key={skill.id}
              className="absolute"
              style={{ left: `${cx}%`, top: `${cy}%`, animationDelay: `${delay}s` }}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={skill.url_icono}
                alt={skill.nombre}
                title={skill.nombre}
                className="w-8 h-8 object-contain opacity-30 hover:opacity-80 transition-opacity duration-300"
                style={{ filter: 'drop-shadow(0 0 6px var(--glow))' }}
                loading="lazy"
              />
            </motion.div>
          )
        })}
      </div>
      )}

      {/* Main content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center gap-6">
        {/* Greeting */}
        <motion.p
          className="font-mono text-sm tracking-widest uppercase"
          style={{ color: 'var(--accent)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {locale === 'es-419' ? '👋 Hola, soy' : '👋 Hi there, I\'m'}
        </motion.p>

        {/* Name */}
        <motion.h1
          className="font-bold tracking-tight"
          style={{
            fontSize: 'clamp(2.8rem, 7vw, 5rem)',
            lineHeight: 1.1,
            color: 'var(--text-primary)',
          }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          {person.nombre}
        </motion.h1>

        {/* Typewriter role */}
        <motion.div
          className="font-mono font-semibold"
          style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
            color: 'var(--accent)',
            minHeight: '2em',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <TypeAnimation
            sequence={TYPEWRITER_SEQUENCE}
            wrapper="span"
            cursor={true}
            repeat={Infinity}
            speed={55}
          />
        </motion.div>

        {/* Description */}
        <motion.p
          className="max-w-xl leading-relaxed"
          style={{
            color: 'var(--text-secondary)',
            fontSize: 'clamp(0.9rem, 1.5vw, 1.05rem)',
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {person.descripcion}
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.75 }}
        >
          <button
            className="btn-accent"
            onClick={() => scrollToSection('projects')}
          >
            {locale === 'es-419' ? 'Ver mi trabajo' : 'See my work'}
            <ArrowDown size={15} />
          </button>
          <button
            className="btn-outline"
            onClick={() => scrollToSection('contact')}
          >
            {locale === 'es-419' ? 'Contáctame' : 'Contact me'}
            <Mail size={15} />
          </button>
        </motion.div>

        {/* Social icons */}
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          {socials.map(({ key, href }) => {
            const Icon = SOCIAL_ICON_MAP[key]
            if (!Icon) return null
            return (
              <motion.a
                key={key}
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={key}
                className="flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                }}
                whileHover={{
                  scale: 1.12,
                  borderColor: 'var(--accent)',
                  color: 'var(--accent)',
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon size={18} />
              </motion.a>
            )
          })}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
          scroll
        </span>
        <motion.div
          className="w-px h-10"
          style={{ background: 'linear-gradient(to bottom, var(--accent), transparent)' }}
          animate={{ scaleY: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.div>
    </section>
  )
}
