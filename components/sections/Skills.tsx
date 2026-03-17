'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import SectionWrapper from '@/components/ui/SectionWrapper'
import SkillBar from '@/components/ui/SkillBar'
import type { Skill } from '@/lib/types'
import { useLocale } from '@/context/locale-context'
import { getSkills } from '@/lib/contentful'

interface SkillsProps {
  initialData: Skill[]
}

export default function Skills({ initialData }: SkillsProps) {
  const { locale } = useLocale()
  const [data, setData] = useState(initialData)
  const isMounted = useRef(false)

  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return }
    getSkills().then(setData)
  }, [locale])

  // Sort by level descending
  const sorted = [...data].sort((a, b) => b.nivel - a.nivel)

  return (
    <SectionWrapper id="skills">
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
            {locale === 'es-419' ? '04 / Habilidades' : '04 / Skills'}
          </p>
          <h2 className="section-heading">
            {locale === 'es-419' ? (
              <>Stack <span>técnico</span></>
            ) : (
              <>Technical <span>stack</span></>
            )}
          </h2>
        </motion.div>

        {/* Skills grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((skill, i) => (
            <motion.div
              key={skill.id}
              className="glass-card p-4"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: (i % 12) * 0.04 }}
            >
              <SkillBar
                name={skill.nombre}
                level={skill.nivel}
                iconUrl={skill.url_icono}
                delay={(i % 12) * 0.04}
              />
            </motion.div>
          ))}
        </div>

        {/* Icon strip at the bottom */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 mt-12 pt-8"
          style={{ borderTop: '1px solid var(--border)' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          aria-hidden="true"
        >
          {sorted.slice(0, 18).map((skill) => (
            <div
              key={`icon-${skill.id}`}
              className="flex flex-col items-center gap-1.5 group"
              title={skill.nombre}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={skill.url_icono}
                alt={skill.nombre}
                className="w-8 h-8 object-contain opacity-50 group-hover:opacity-100 transition-opacity duration-200"
                loading="lazy"
              />
              <span
                className="text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: 'var(--text-secondary)' }}
              >
                {skill.nombre}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </SectionWrapper>
  )
}
