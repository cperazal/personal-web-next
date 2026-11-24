import { createClient } from 'contentful'
import type {
  Locale,
  PersonalInfo,
  Skill,
  ExperienceItem,
  EducationItem,
  ProjectItem,
  CertificadoItem,
  ImageAsset,
} from './types'
import { hasCaseStudy } from './projects'
export { hasCaseStudy }

// ─── Client factory ───────────────────────────────────────────────────────────
// Supports both NEXT_PUBLIC_ (client-safe) and server-only env var names.
function getClient() {
  const space =
    process.env.NEXT_PUBLIC_CONTENTFUL_ID_SPACE ??
    process.env.CONTENTFUL_ID_SPACE
  const accessToken =
    process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN ??
    process.env.CONTENTFUL_ACCESS_TOKEN

  if (!space || !accessToken) {
    throw new Error(
      'Missing Contentful credentials. Set NEXT_PUBLIC_CONTENTFUL_ID_SPACE and NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN (or their non-prefixed equivalents) in your .env file.'
    )
  }

  return createClient({ space, accessToken })
}

// ─── Asset helper ─────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapAsset(asset: any): ImageAsset | null {
  if (!asset?.fields?.file?.url) return null
  return {
    url: `https:${asset.fields.file.url}`,
    title: asset.fields.title ?? '',
    width: asset.fields.file.details?.image?.width ?? undefined,
    height: asset.fields.file.details?.image?.height ?? undefined,
  }
}

// ─── Personal information ─────────────────────────────────────────────────────
export async function getPersonalInfo(locale: Locale = 'en-US'): Promise<PersonalInfo[]> {
  const client = getClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await (client as any).getEntries({
    content_type: 'personal_information',
    locale,
  })
  // The CV link is not localized, but its file is (en-US / es-419).
  // Fetch the asset with all locales so both versions are always available.
  const cvId: string | undefined = res.items[0]?.fields?.cv?.sys?.id
  let cv: PersonalInfo['cv'] = null
  if (cvId) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const asset = await (client as any).getAsset(cvId, { locale: '*' })
      const files = asset?.fields?.file ?? {}
      const toUrl = (f?: { url?: string }) => (f?.url ? `https:${f.url}` : null)
      const en = toUrl(files['en-US'])
      cv = { en, es: toUrl(files['es-419']) ?? en }
    } catch {
      cv = null
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return res.items.map((item: any): PersonalInfo => ({
    nombre: item.fields.nombre ?? '',
    descripcion: item.fields.descripcion ?? '',
    github: item.fields.github ?? '',
    linkedin: item.fields.linkedin ?? '',
    facebook: item.fields.facebook ?? null,
    twitter: item.fields.twitter ?? null,
    ubicacion: item.fields.ubicacion ?? '',
    telefono: item.fields.telefono ?? null,
    correo: item.fields.correo ?? '',
    web: item.fields.web ?? null,
    foto: mapAsset(item.fields.foto),
    cv,
  }))
}

// ─── Software / Skills ────────────────────────────────────────────────────────
export async function getSkills(): Promise<Skill[]> {
  const client = getClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await (client as any).getEntries({ content_type: 'software' })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return res.items.map((item: any): Skill => ({
    id: item.sys.id,
    nombre: item.fields.nombre ?? '',
    url_icono: item.fields.url_icono ?? '',
    nivel: typeof item.fields.nivel === 'number' ? item.fields.nivel : 0,
  }))
}

// ─── Experience ───────────────────────────────────────────────────────────────
export async function getExperience(locale: Locale = 'en-US'): Promise<ExperienceItem[]> {
  const client = getClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await (client as any).getEntries({
    content_type: 'experienciaLaboral',
    locale,
    order: '-fields.fechaInicio',
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return res.items.map((item: any): ExperienceItem => ({
    id: item.sys.id,
    titulo: item.fields.titulo ?? '',
    empresa: item.fields.empresa ?? '',
    webEmpresa: item.fields.webEmpresa ?? null,
    pais: item.fields.pais ?? '',
    modalidad: item.fields.modalidad ?? '',
    fechaInicio: item.fields.fechaInicio ?? '',
    fechaCulminacion: item.fields.fechaCulminacion ?? null,
    descripcion: item.fields.descripcion ?? '',
    imagen: mapAsset(item.fields.imagen),
    tecnologias: Array.isArray(item.fields.tecnologias) ? item.fields.tecnologias : [],
  })).sort((a: ExperienceItem, b: ExperienceItem) => {
    // Current jobs first, then most recent end date, then most recent start date
    const endA = a.fechaCulminacion ?? '9999-12-31'
    const endB = b.fechaCulminacion ?? '9999-12-31'
    if (endA !== endB) return endB.localeCompare(endA)
    return b.fechaInicio.localeCompare(a.fechaInicio)
  })
}

// ─── Education ────────────────────────────────────────────────────────────────
export async function getEducation(locale: Locale = 'en-US'): Promise<EducationItem[]> {
  const client = getClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await (client as any).getEntries({
    content_type: 'educacion',
    locale,
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return res.items.map((item: any): EducationItem => ({
    id: item.sys.id,
    titulo: item.fields.titulo ?? '',
    institucion: item.fields.institucion ?? '',
    url: item.fields.url ?? null,
    pais: item.fields.pais ?? '',
    fechaDeInicio: item.fields.fechaDeInicio ?? '',
    fechaDeCulminacion: item.fields.fechaDeCulminacion ?? null,
    imagen: mapAsset(item.fields.imagen),
  }))
}

// ─── Projects ─────────────────────────────────────────────────────────────────
export async function getProjects(locale: Locale = 'en-US'): Promise<ProjectItem[]> {
  const client = getClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await (client as any).getEntries({
    content_type: 'proyectos',
    locale,
  })
  return res.items.map(mapProject)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProject(item: any): ProjectItem {
  return {
    id: item.sys.id,
    titulo: item.fields.titulo ?? '',
    empresa: item.fields.empresa ?? null,
    url: item.fields.url ?? null,
    descripcion: item.fields.descripcion ?? '',
    imagen: mapAsset(item.fields.imagen),
    tecnologias: Array.isArray(item.fields.tecnologias) ? item.fields.tecnologias : [],
    slug: item.fields.slug ?? null,
    rol: item.fields.rol ?? null,
    fecha: item.fields.fecha ?? null,
    problema: item.fields.problema ?? null,
    solucion: item.fields.solucion ?? null,
    resultado: item.fields.resultado ?? null,
    updatedAt: item.sys.updatedAt ?? null,
  }
}

/** Projects that have their own case-study page (used for static params and sitemap) */
export async function getCaseStudies(locale: Locale = 'en-US'): Promise<ProjectItem[]> {
  try {
    return (await getProjects(locale)).filter(hasCaseStudy)
  } catch {
    return []
  }
}

/** A single case study by slug (there are only a few projects, so filter in memory) */
export async function getProjectBySlug(
  slug: string,
  locale: Locale = 'en-US'
): Promise<ProjectItem | null> {
  const projects = await getCaseStudies(locale)
  return projects.find((p) => p.slug === slug) ?? null
}

// ─── Certificates / Rewards ───────────────────────────────────────────────────
export async function getCertificates(locale: Locale = 'en-US'): Promise<CertificadoItem[]> {
  const client = getClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await (client as any).getEntries({
    content_type: 'certificados',
    locale,
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return res.items.map((item: any): CertificadoItem => ({
    id: item.sys.id,
    titulo: item.fields.titulo ?? '',
    institucion: item.fields.institucion ?? '',
    url: item.fields.url ?? null,
    imagen: mapAsset(item.fields.imagen),
    archivo: item.fields.archivo?.fields?.file
      ? { url: `https:${item.fields.archivo.fields.file.url}`, title: item.fields.archivo.fields.title ?? '' }
      : null,
    thumbnails: mapAsset(item.fields.thumbnails),
  }))
}

// ─── Last content update (for sitemap lastmod) ────────────────────────────────
// Returns the most recent `sys.updatedAt` among the content types shown on the
// home page, so the sitemap reports when the content really changed.
const HOME_CONTENT_TYPES = [
  'personal_information',
  'experienciaLaboral',
  'educacion',
  'proyectos',
  'certificados',
]

export async function getLastContentUpdate(): Promise<Date | null> {
  try {
    const client = getClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await (client as any).getEntries({
      'sys.contentType.sys.id[in]': HOME_CONTENT_TYPES.join(','),
      order: '-sys.updatedAt',
      select: 'sys.updatedAt',
      limit: 1,
    })
    const updatedAt: string | undefined = res.items[0]?.sys?.updatedAt
    return updatedAt ? new Date(updatedAt) : null
  } catch {
    return null
  }
}
