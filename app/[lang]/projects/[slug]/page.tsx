import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { getCaseStudies, getProjectBySlug } from '@/lib/data/content'
import {
  CONTENTFUL_LOCALE,
  SEO,
  SITE_URL,
  absoluteUrl,
  hreflangFor,
  isLang,
  localePath,
  type Lang,
} from '@/lib/i18n'

// Static at build time, regenerated in the background at most once a minute (ISR).
// New case studies published in Contentful are rendered on first visit.
export const revalidate = 3600

type Params = Promise<{ lang: string; slug: string }>

const COPY = {
  en: {
    home: 'Home',
    projects: 'Projects',
    back: 'Back to projects',
    problem: 'The problem',
    solution: 'The solution',
    result: 'The result',
    tech: 'Technologies',
    role: 'Role',
    client: 'Client',
    date: 'Year',
    visit: 'Visit project',
  },
  es: {
    home: 'Inicio',
    projects: 'Proyectos',
    back: 'Volver a proyectos',
    problem: 'El problema',
    solution: 'La solución',
    result: 'El resultado',
    tech: 'Tecnologías',
    role: 'Rol',
    client: 'Cliente',
    date: 'Año',
    visit: 'Ver proyecto',
  },
} as const

export async function generateStaticParams({ params }: { params: { lang: string } }) {
  const lang: Lang = isLang(params.lang) ? params.lang : 'en'
  const projects = await getCaseStudies(CONTENTFUL_LOCALE[lang])
  return projects.map((p) => ({ slug: p.slug as string }))
}

async function loadProject(params: Params) {
  const { lang: rawLang, slug } = await params
  if (!isLang(rawLang)) notFound()
  const lang: Lang = rawLang
  const project = await getProjectBySlug(slug, CONTENTFUL_LOCALE[lang])
  if (!project) notFound()
  return { lang, slug, project }
}

/** Plain-text excerpt for meta descriptions (under ~155 characters) */
function excerpt(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return `${clean.slice(0, max - 1).replace(/\s+\S*$/, '')}…`
}

/** Splits long text from Contentful into paragraphs */
function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p key={i} className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {p}
          </p>
        ))}
    </>
  )
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, slug, project } = await loadProject(params)
  const path = `/projects/${slug}`
  const description = excerpt(project.descripcion || project.problema || '')
  const title = `${project.titulo} — ${lang === 'es' ? 'Caso de estudio' : 'Case study'}`
  const image = project.imagen?.url ?? '/og-image.jpg'

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(lang, path),
      languages: hreflangFor(path),
    },
    openGraph: {
      type: 'article',
      url: absoluteUrl(lang, path),
      title,
      description,
      locale: SEO[lang].ogLocale,
      siteName: 'carlosperaza.dev',
      authors: ['Carlos Peraza'],
      images: [{ url: image, alt: project.imagen?.title || project.titulo }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

export default async function ProjectPage({ params }: { params: Params }) {
  const { lang, slug, project } = await loadProject(params)
  const t = COPY[lang]
  const path = `/projects/${slug}`
  const url = absoluteUrl(lang, path)
  const year = project.fecha ? project.fecha.slice(0, 4) : null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CreativeWork',
        '@id': `${url}#project`,
        name: project.titulo,
        headline: project.titulo,
        description: project.descripcion,
        url,
        inLanguage: lang,
        author: { '@id': `${SITE_URL}/#person` },
        creator: { '@id': `${SITE_URL}/#person` },
        keywords: project.tecnologias?.join(', '),
        ...(project.imagen ? { image: project.imagen.url } : {}),
        ...(project.fecha ? { dateCreated: project.fecha } : {}),
        ...(project.updatedAt ? { dateModified: project.updatedAt } : {}),
        ...(project.url ? { sameAs: project.url } : {}),
        ...(project.empresa ? { sourceOrganization: { '@type': 'Organization', name: project.empresa } } : {}),
      },
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: project.titulo,
        inLanguage: lang,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        mainEntity: { '@id': `${url}#project` },
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: t.home, item: absoluteUrl(lang, '/') },
            { '@type': 'ListItem', position: 2, name: t.projects, item: `${absoluteUrl(lang, '/')}#projects` },
            { '@type': 'ListItem', position: 3, name: project.titulo, item: url },
          ],
        },
      },
    ],
  }

  const sections = [
    { title: t.problem, text: project.problema },
    { title: t.solution, text: project.solucion },
    { title: t.result, text: project.resultado },
  ].flatMap((s) => (s.text ? [{ title: s.title, text: s.text }] : []))

  return (
    <article className="container-section" style={{ maxWidth: '48rem', paddingTop: '8rem' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="font-mono text-xs mb-8" style={{ color: 'var(--text-secondary)' }}>
        <Link href={localePath(lang, '/')} style={{ color: 'inherit' }}>{t.home}</Link>
        {' / '}
        <Link href={`${localePath(lang, '/')}#projects`} style={{ color: 'inherit' }}>{t.projects}</Link>
        {' / '}
        <span style={{ color: 'var(--accent)' }}>{project.titulo}</span>
      </nav>

      {/* Header */}
      <header className="flex flex-col gap-4 mb-10">
        <h1 className="section-heading" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.15 }}>
          {project.titulo}
        </h1>
        <p className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {project.descripcion}
        </p>

        <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm font-mono mt-2">
          {project.rol && (
            <div>
              <dt style={{ color: 'var(--text-secondary)' }}>{t.role}</dt>
              <dd style={{ color: 'var(--text-primary)' }}>{project.rol}</dd>
            </div>
          )}
          {project.empresa && (
            <div>
              <dt style={{ color: 'var(--text-secondary)' }}>{t.client}</dt>
              <dd style={{ color: 'var(--text-primary)' }}>{project.empresa}</dd>
            </div>
          )}
          {year && (
            <div>
              <dt style={{ color: 'var(--text-secondary)' }}>{t.date}</dt>
              <dd style={{ color: 'var(--text-primary)' }}>{year}</dd>
            </div>
          )}
        </dl>

        {project.url && (
          <a
            href={project.url}
            target="_blank"
            rel="noreferrer noopener"
            className="btn-outline w-fit mt-2"
          >
            {t.visit}
            <ExternalLink size={15} />
          </a>
        )}
      </header>

      {/* Image */}
      {project.imagen && (
        <div
          className="relative rounded-xl overflow-hidden mb-12"
          style={{ aspectRatio: '2 / 1', border: '1px solid var(--border)', background: 'var(--surface-2)' }}
        >
          <Image
            src={project.imagen.url}
            alt={project.imagen.title || project.titulo}
            fill
            className="object-contain p-6"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
        </div>
      )}

      {/* Problem / Solution / Result */}
      <div className="flex flex-col gap-10">
        {sections.map((s) => (
          <section key={s.title} className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              {s.title}
            </h2>
            <Paragraphs text={s.text} />
          </section>
        ))}

        {project.tecnologias && project.tecnologias.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              {t.tech}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {project.tecnologias.map((tec) => (
                <li key={tec} className="tech-chip">{tec}</li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* Back */}
      <Link
        href={`${localePath(lang, '/')}#projects`}
        className="inline-flex items-center gap-2 font-mono text-sm mt-16"
        style={{ color: 'var(--accent)', textDecoration: 'none' }}
      >
        <ArrowLeft size={15} />
        {t.back}
      </Link>
    </article>
  )
}
