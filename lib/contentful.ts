import { createClient } from 'contentful'
import type {
  Locale,
  PersonalInfo,
  Skill,
  ExperienceItem,
  EducationItem,
  ProjectItem,
  CertificadoItem,
  ContentfulImage,
} from './types'

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
function mapAsset(asset: any): ContentfulImage | null {
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
  }))
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return res.items.map((item: any): ProjectItem => ({
    id: item.sys.id,
    titulo: item.fields.titulo ?? '',
    empresa: item.fields.empresa ?? null,
    url: item.fields.url ?? null,
    descripcion: item.fields.descripcion ?? '',
    imagen: mapAsset(item.fields.imagen),
    tecnologias: Array.isArray(item.fields.tecnologias) ? item.fields.tecnologias : [],
  }))
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
