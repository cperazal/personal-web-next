'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { ExternalLink, Download, Award } from 'lucide-react'
import SectionWrapper from '@/components/ui/SectionWrapper'
import type { CertificadoItem } from '@/lib/types'
import { useLocale } from '@/context/locale-context'
import { getCertificates } from '@/lib/contentful'

interface RewardsProps {
  initialData: CertificadoItem[]
}

export default function Rewards({ initialData }: RewardsProps) {
  const { locale } = useLocale()
  const [data, setData] = useState(initialData)
  const isMounted = useRef(false)

  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return }
    getCertificates(locale).then(setData)
  }, [locale])

  return (
    <SectionWrapper id="rewards">
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
            {locale === 'es-419' ? '07 / Certificaciones' : '07 / Certifications'}
          </p>
          <h2 className="section-heading">
            {locale === 'es-419' ? (
              <>Reconocimientos & <span>Logros</span></>
            ) : (
              <>Awards & <span>Achievements</span></>
            )}
          </h2>
        </motion.div>

        <div>
          {data.map((cert, i) => (
            <motion.article
              key={cert.id}
              className="flex gap-6 py-7"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: (i % 9) * 0.07 }}
            >
              {/* Thumbnail / Icon */}
              <div
                className="shrink-0 w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center"
                style={{ background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                {cert.thumbnails ? (
                  <Image
                    src={cert.thumbnails.url}
                    alt={cert.thumbnails.title || cert.titulo}
                    width={64}
                    height={64}
                    className="object-contain p-1.5"
                  />
                ) : cert.imagen ? (
                  <Image
                    src={cert.imagen.url}
                    alt={cert.imagen.title || cert.titulo}
                    width={64}
                    height={64}
                    className="object-contain p-1.5"
                  />
                ) : (
                  <Award size={26} style={{ color: 'var(--accent)' }} />
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col gap-2 min-w-0 flex-1">
                <h3
                  className="font-semibold text-base leading-snug"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {cert.titulo}
                </h3>
                <span className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
                  {cert.institucion}
                </span>

                {/* Action links */}
                <div className="flex items-center gap-3 mt-1">
                  {cert.url && (
                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="flex items-center gap-1.5 text-xs font-mono transition-colors duration-200"
                      style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--accent)')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
                    >
                      <ExternalLink size={12} />
                      {locale === 'es-419' ? 'Ver certificado' : 'View certificate'}
                    </a>
                  )}
                  {cert.url && cert.archivo && (
                    <span style={{ color: 'var(--border)' }}>·</span>
                  )}
                  {cert.archivo && (
                    <a
                      href={cert.archivo.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      download
                      className="flex items-center gap-1.5 text-xs font-mono transition-colors duration-200"
                      style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--accent)')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
                    >
                      <Download size={12} />
                      {locale === 'es-419' ? 'Descargar' : 'Download'}
                    </a>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </SectionWrapper>
  )
}
