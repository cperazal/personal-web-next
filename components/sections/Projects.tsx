'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { ExternalLink } from 'lucide-react'
import SectionWrapper from '@/components/ui/SectionWrapper'
import type { ProjectItem } from '@/lib/types'
import { useLocale } from '@/context/locale-context'
import { getProjects } from '@/lib/contentful'

interface ProjectsProps {
  initialData: ProjectItem[]
}

function ProjectCard({ project, delay }: { project: ProjectItem; delay: number }) {
  const { locale } = useLocale()

  return (
    <motion.article
      className="flex gap-6"
      style={{ paddingBlock: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Thumbnail */}
      {project.imagen ? (
        <div
          className="flex-shrink-0 rounded-lg overflow-hidden relative"
          style={{
            width: '140px',
            height: '92px',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <Image
            src={project.imagen.url}
            alt={project.imagen.title || project.titulo}
            fill
            className="object-cover"
            sizes="140px"
          />
        </div>
      ) : (
        <div
          className="flex-shrink-0 rounded-lg flex items-center justify-center"
          style={{
            width: '140px',
            height: '92px',
            background: 'var(--surface-2)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
            {locale === 'es-419' ? 'Sin imagen' : 'No image'}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="flex flex-col gap-3 flex-1 min-w-0">
        {/* Title + link */}
        <div className="flex items-center gap-2">
          <h3
            className="font-semibold text-lg leading-snug"
            style={{ color: 'var(--text-primary)' }}
          >
            {project.titulo}
          </h3>
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`Open ${project.titulo}`}
              className="transition-colors duration-200 flex-shrink-0"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--accent)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
            >
              <ExternalLink size={16} />
            </a>
          )}
        </div>

        {/* Description */}
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {project.descripcion}
        </p>

        {/* Tech chips */}
        {project.tecnologias && project.tecnologias.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {project.tecnologias.map((tec) => (
              <span key={tec} className="tech-chip">
                {tec}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  )
}

export default function Projects({ initialData }: ProjectsProps) {
  const { locale } = useLocale()
  const [data, setData] = useState(initialData)
  const isMounted = useRef(false)

  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return }
    getProjects(locale).then(setData)
  }, [locale])

  return (
    <SectionWrapper id="projects">
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
            {locale === 'es-419' ? '05 / Proyectos' : '05 / Projects'}
          </p>
          <h2 className="section-heading">
            {locale === 'es-419' ? (
              <>Proyectos <span>destacados</span></>
            ) : (
              <>Featured <span>projects</span></>
            )}
          </h2>
        </motion.div>

        <div>
          {data.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              delay={(i % 6) * 0.08}
            />
          ))}
        </div>
      </div>
    </SectionWrapper>
  )
}
