'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { ExternalLink, Calendar, MapPin, GraduationCap } from 'lucide-react'
import SectionWrapper from '@/components/ui/SectionWrapper'
import type { EducationItem } from '@/lib/types'
import { useLocale } from '@/context/locale-context'
import { getEducation } from '@/lib/contentful'

interface EducationProps {
  initialData: EducationItem[]
}

export default function Education({ initialData }: EducationProps) {
  const { locale } = useLocale()
  const [data, setData] = useState(initialData)
  const isMounted = useRef(false)

  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return }
    getEducation(locale).then(setData)
  }, [locale])

  return (
    <SectionWrapper id="education">
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
            {locale === 'es-419' ? '06 / Educación' : '06 / Education'}
          </p>
          <h2 className="section-heading">
            {locale === 'es-419' ? (
              <>Formación <span>académica</span></>
            ) : (
              <>Academic <span>background</span></>
            )}
          </h2>
        </motion.div>

        <div className="flex flex-col gap-5">
          {data.map((edu, i) => (
            <motion.div
              key={edu.id}
              className="flex gap-6 py-6"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              {/* Institution logo */}
              <div
                className="shrink-0 w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center"
                style={{ background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                {edu.imagen ? (
                  <Image
                    src={edu.imagen.url}
                    alt={edu.imagen.title || edu.institucion}
                    width={64}
                    height={64}
                    className="object-contain p-2"
                  />
                ) : (
                  <GraduationCap size={26} style={{ color: 'var(--accent)' }} />
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col gap-2 min-w-0 flex-1">
                <h3 className="font-semibold text-base leading-snug" style={{ color: 'var(--text-primary)' }}>
                  {edu.titulo}
                </h3>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  {edu.url ? (
                    <a
                      href={edu.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-sm font-medium hover:underline"
                      style={{ color: 'var(--accent)' }}
                    >
                      {edu.institucion}
                      <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
                      {edu.institucion}
                    </span>
                  )}
                  <span style={{ color: 'var(--border)' }}>·</span>
                  <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <MapPin size={11} />
                    {edu.pais}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                  <Calendar size={11} />
                  {edu.fechaDeInicio}
                  {edu.fechaDeCulminacion && ` — ${edu.fechaDeCulminacion}`}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  )
}
