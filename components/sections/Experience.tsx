'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Calendar, MapPin, Briefcase } from 'lucide-react'
import SectionWrapper from '@/components/ui/SectionWrapper'
import type { ExperienceItem } from '@/lib/types'
import { useLocale } from '@/context/locale-context'
import { getExperience } from '@/lib/contentful'

interface ExperienceProps {
  initialData: ExperienceItem[]
}

export default function Experience({ initialData }: ExperienceProps) {
  const { locale } = useLocale()
  const [data, setData] = useState(initialData)
  const isMounted = useRef(false)

  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return }
    getExperience(locale).then(setData)
  }, [locale])

  return (
    <SectionWrapper id="experience">
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
            {locale === 'es-419' ? '03 / Experiencia' : '03 / Experience'}
          </p>
          <h2 className="section-heading">
            {locale === 'es-419' ? (
              <>Trayectoria <span>laboral</span></>
            ) : (
              <>Work <span>experience</span></>
            )}
          </h2>
        </motion.div>

        {/* Timeline list — dot column is isolated from card column */}
        <div className="relative">
          {/* Vertical connector line behind all items */}
          <div
            className="absolute top-4 bottom-4 w-px"
            style={{
              left: '9px',
              background: 'linear-gradient(to bottom, var(--accent), transparent 90%)',
              opacity: 0.35,
            }}
            aria-hidden="true"
          />

          <div className="flex flex-col gap-6">
            {data.map((exp, i) => (
              <motion.div
                key={exp.id}
                className="flex gap-5"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Left: dot — completely separate from card */}
                <div className="flex-shrink-0 flex flex-col items-center pt-5" style={{ width: '20px' }}>
                  <span
                    className="w-[14px] h-[14px] rounded-full border-2 flex-shrink-0"
                    style={{
                      background: 'var(--bg)',
                      borderColor: 'var(--accent)',
                      boxShadow: '0 0 8px var(--glow)',
                    }}
                  />
                </div>

                {/* Right: card */}
                <div className="glass-card flex-1 flex flex-col gap-5 min-w-0" style={{ padding: '2.5rem', borderRadius: '16px' }}>
                  {/* Header */}
                  <div className="flex flex-col gap-2">
                    <h3
                      className="font-semibold text-lg leading-tight"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {exp.titulo}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      {exp.webEmpresa ? (
                        <a
                          href={exp.webEmpresa}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 font-medium text-sm hover:underline"
                          style={{ color: 'var(--accent)' }}
                        >
                          {exp.empresa}
                          <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span className="font-medium text-sm" style={{ color: 'var(--accent)' }}>
                          {exp.empresa}
                        </span>
                      )}

                      <span style={{ color: 'var(--border)' }}>·</span>

                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <Briefcase size={11} />
                        {exp.modalidad}
                      </span>

                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <MapPin size={11} />
                        {exp.pais}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                      <Calendar size={11} />
                      {exp.fechaInicio}
                      {' — '}
                      {exp.fechaCulminacion ?? (locale === 'es-419' ? 'Presente' : 'Present')}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {exp.descripcion}
                  </p>

                  {/* Technologies */}
                  {exp.tecnologias.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {exp.tecnologias.map((tec) => (
                        <span key={tec} className="tech-chip">
                          {tec}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  )
}
