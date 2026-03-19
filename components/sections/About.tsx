'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Mail, Globe } from 'lucide-react'
import SectionWrapper from '@/components/ui/SectionWrapper'
import type { PersonalInfo } from '@/lib/types'
import { useLocale } from '@/context/locale-context'
import { getPersonalInfo } from '@/lib/contentful'

interface AboutProps {
  initialData: PersonalInfo[]
}

const STATS = (locale: string) => [
  { label: locale === 'es-419' ? 'Años de experiencia' : 'Years of experience', value: `${new Date().getFullYear() - 2019}+` },
  { label: locale === 'es-419' ? 'Proyectos completados' : 'Projects completed', value: '50+' },
  { label: locale === 'es-419' ? 'Tecnologías' : 'Technologies', value: '20+' },
]

export default function About({ initialData }: AboutProps) {
  const { locale } = useLocale()
  const [data, setData] = useState(initialData)
  const isMounted = useRef(false)

  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return }
    getPersonalInfo(locale).then(setData)
  }, [locale])

  const person = data[0]
  if (!person) return null

  return (
    <SectionWrapper id="about">
      <div className="container-section">
        {/* Heading */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <p className="font-mono text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--accent)' }}>
            {locale === 'es-419' ? '01 / Sobre Mí' : '01 / About Me'}
          </p>
          <h2 className="section-heading">
            {locale === 'es-419' ? (
              <>¿Quién <span>soy</span>?</>
            ) : (
              <>Who <span>am I</span>?</>
            )}
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-[1fr_280px] gap-12 lg:gap-16 items-start">
          {/* Bio */}
          <motion.div
            className="flex flex-col gap-6"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <p
              className="leading-relaxed text-base"
              style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}
            >
              {person.descripcion}
            </p>

            {/* Contact info */}
            <div className="flex flex-col gap-3 pt-2">
              {person.ubicacion && (
                <div className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <MapPin size={15} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  {person.ubicacion}
                </div>
              )}
              {person.correo && (
                <div className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <Mail size={15} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <a
                    href={`mailto:${person.correo}`}
                    className="hover:underline transition-colors"
                    style={{ color: 'inherit' }}
                  >
                    {person.correo}
                  </a>
                </div>
              )}
              {person.web && (
                <div className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <Globe size={15} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <a
                    href={person.web}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                    style={{ color: 'inherit' }}
                  >
                    {person.web}
                  </a>
                </div>
              )}
            </div>
          </motion.div>

          {/* Stats grid */}
          <motion.div
            className="flex flex-col gap-4"
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {STATS(locale).map(({ label, value }, i) => (
              <motion.div
                key={label}
                className="glass-card p-5 text-center"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.25 + i * 0.1 }}
              >
                <span
                  className="block text-3xl font-bold font-mono mb-1"
                  style={{ color: 'var(--accent)' }}
                >
                  {value}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  )
}
