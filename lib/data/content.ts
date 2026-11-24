import 'server-only'
import { unstable_cache } from 'next/cache'
import { asc, eq, sql } from 'drizzle-orm'
import { getDb, schema as s } from '@/lib/db'
import { hasCaseStudy } from '@/lib/projects'
import type {
  CertificadoItem,
  EducationItem,
  ExperienceItem,
  ImageAsset,
  Locale,
  PersonalInfo,
  ProjectItem,
  Skill,
} from '@/lib/types'

/* ─── Caching ─────────────────────────────────────────────────────────────────
 * Every public query is cached under the "content" tag. The admin panel calls
 * revalidateTag(CONTENT_TAG) after each save, so changes show up immediately;
 * the hourly revalidate is only a safety net.
 */
export const CONTENT_TAG = 'content'
const cached = <A extends unknown[], R>(fn: (...args: A) => Promise<R>, key: string) =>
  unstable_cache(fn, [key], { tags: [CONTENT_TAG], revalidate: 3600 })

const isEs = (locale: Locale) => locale === 'es-419'
/** Spanish text with English fallback (same behavior Contentful had) */
const pick = (locale: Locale, en: string | null, es: string | null) =>
  (isEs(locale) ? es || en : en || es) ?? ''

const image = (url: string | null, title: string | null): ImageAsset | null =>
  url ? { url, title: title ?? '' } : null

/* ─── Profile ─────────────────────────────────────────────────────────────── */
export const getPersonalInfo = cached(async (locale: Locale = 'en-US'): Promise<PersonalInfo[]> => {
  const rows = await getDb().select().from(s.profile).limit(1)
  return rows.map((p) => ({
    nombre: p.name,
    descripcion: pick(locale, p.bioEn, p.bioEs),
    github: p.github ?? '',
    linkedin: p.linkedin ?? '',
    facebook: p.facebook,
    twitter: p.twitter,
    ubicacion: p.location,
    telefono: p.phone,
    correo: p.email,
    web: p.website,
    foto: image(p.photoUrl, p.photoAlt),
    cv: p.cvEnUrl || p.cvEsUrl ? { en: p.cvEnUrl, es: p.cvEsUrl ?? p.cvEnUrl } : null,
  }))
}, 'personal-info')

/* ─── Skills ──────────────────────────────────────────────────────────────── */
export const getSkills = cached(async (): Promise<Skill[]> => {
  const rows = await getDb()
    .select()
    .from(s.skills)
    .where(eq(s.skills.isActive, true))
    .orderBy(asc(s.skills.sortOrder))
  return rows.map((r) => ({ id: r.id, nombre: r.name, url_icono: r.iconUrl, nivel: r.level }))
}, 'skills')

/* ─── Experience ──────────────────────────────────────────────────────────── */
export const getExperience = cached(async (locale: Locale = 'en-US'): Promise<ExperienceItem[]> => {
  const rows = await getDb()
    .select()
    .from(s.experiences)
    .where(eq(s.experiences.isActive, true))
    .orderBy(asc(s.experiences.sortOrder))
  return rows.map((r) => ({
    id: r.id,
    titulo: pick(locale, r.titleEn, r.titleEs),
    empresa: r.company,
    webEmpresa: r.companyUrl,
    pais: r.country,
    modalidad: pick(locale, r.modeEn, r.modeEs),
    fechaInicio: r.startDate,
    fechaCulminacion: r.endDate,
    descripcion: pick(locale, r.descriptionEn, r.descriptionEs),
    imagen: image(r.imageUrl, r.imageAlt),
    tecnologias: r.technologies,
  }))
}, 'experience')

/* ─── Education ───────────────────────────────────────────────────────────── */
export const getEducation = cached(async (locale: Locale = 'en-US'): Promise<EducationItem[]> => {
  const rows = await getDb()
    .select()
    .from(s.education)
    .where(eq(s.education.isActive, true))
    .orderBy(asc(s.education.sortOrder))
  return rows.map((r) => ({
    id: r.id,
    titulo: pick(locale, r.degreeEn, r.degreeEs),
    institucion: pick(locale, r.institutionEn, r.institutionEs),
    url: r.url,
    pais: r.country,
    fechaDeInicio: r.startDate ?? '',
    fechaDeCulminacion: r.endDate,
    imagen: image(r.imageUrl, r.imageAlt),
  }))
}, 'education')

/* ─── Projects ────────────────────────────────────────────────────────────── */
type ProjectRow = typeof s.projects.$inferSelect

function mapProject(r: ProjectRow, locale: Locale): ProjectItem {
  const opt = (en: string | null, es: string | null) => pick(locale, en, es) || null
  return {
    id: r.id,
    titulo: pick(locale, r.titleEn, r.titleEs),
    empresa: r.client,
    url: r.url,
    descripcion: pick(locale, r.descriptionEn, r.descriptionEs),
    imagen: image(r.imageUrl, r.imageAlt),
    tecnologias: r.technologies,
    slug: r.slug,
    rol: opt(r.roleEn, r.roleEs),
    fecha: r.date,
    problema: opt(r.problemEn, r.problemEs),
    solucion: opt(r.solutionEn, r.solutionEs),
    resultado: opt(r.resultEn, r.resultEs),
    updatedAt: r.updatedAt.toISOString(),
  }
}

export const getProjects = cached(async (locale: Locale = 'en-US'): Promise<ProjectItem[]> => {
  const rows = await getDb()
    .select()
    .from(s.projects)
    .where(eq(s.projects.isActive, true))
    .orderBy(asc(s.projects.sortOrder))
  return rows.map((r) => mapProject(r, locale))
}, 'projects')

/** Projects that have their own case-study page (static params and sitemap) */
export async function getCaseStudies(locale: Locale = 'en-US'): Promise<ProjectItem[]> {
  return (await getProjects(locale)).filter(hasCaseStudy)
}

export async function getProjectBySlug(slug: string, locale: Locale = 'en-US'): Promise<ProjectItem | null> {
  return (await getCaseStudies(locale)).find((p) => p.slug === slug) ?? null
}

/* ─── Certificates ────────────────────────────────────────────────────────── */
export const getCertificates = cached(async (locale: Locale = 'en-US'): Promise<CertificadoItem[]> => {
  const rows = await getDb()
    .select()
    .from(s.certificates)
    .where(eq(s.certificates.isActive, true))
    .orderBy(asc(s.certificates.sortOrder))
  return rows.map((r) => {
    const fileUrl = isEs(locale) ? r.fileEsUrl || r.fileEnUrl : r.fileEnUrl || r.fileEsUrl
    const title = pick(locale, r.titleEn, r.titleEs)
    return {
      id: r.id,
      titulo: title,
      institucion: pick(locale, r.issuerEn, r.issuerEs),
      url: r.url,
      imagen: image(r.imageUrl, r.imageAlt),
      archivo: fileUrl ? { url: fileUrl, title } : null,
      thumbnails: image(r.thumbnailUrl, title),
    }
  })
}, 'certificates')

/* ─── Last content update (sitemap lastmod) ───────────────────────────────── */
// The cache stores JSON, so the date travels as an ISO string
const lastContentUpdateIso = cached(async (): Promise<string | null> => {
  const tables = [s.profile, s.experiences, s.education, s.projects, s.certificates]
  const results = await Promise.all(
    tables.map((t) =>
      getDb()
        .select({ max: sql<string | null>`max(${t.updatedAt})` })
        .from(t)
    )
  )
  const times = results
    .map((r) => r[0]?.max)
    .filter((d): d is string => Boolean(d))
    .map((d) => new Date(d).getTime())
  return times.length ? new Date(Math.max(...times)).toISOString() : null
}, 'last-content-update')

export async function getLastContentUpdate(): Promise<Date | null> {
  const iso = await lastContentUpdateIso()
  return iso ? new Date(iso) : null
}

export { hasCaseStudy }
