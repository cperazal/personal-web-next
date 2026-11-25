/**
 * One-off migration: Contentful (published content) → Neon + Vercel Blob.
 *
 *   node --env-file=.env.local --env-file=.env --import tsx scripts/migrate-from-contentful.ts
 *
 * Safe to re-run: rows are upserted by `legacy_id` (the Contentful entry id) and
 * files are uploaded to deterministic Blob paths with overwrite enabled.
 * Contentful is only read, never modified.
 */
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { put } from '@vercel/blob'
import * as s from '../lib/db/schema'

const SPACE = process.env.CONTENTFUL_ID_SPACE || process.env.NEXT_PUBLIC_CONTENTFUL_ID_SPACE
const TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN || process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN
if (!SPACE || !TOKEN || !process.env.DATABASE_URL || !process.env.BLOB_READ_WRITE_TOKEN) {
  throw new Error('Missing CONTENTFUL_*, DATABASE_URL or BLOB_READ_WRITE_TOKEN')
}

const db = drizzle(neon(process.env.DATABASE_URL), { schema: s })
const EN = 'en-US'
const ES = 'es-419'

/* eslint-disable @typescript-eslint/no-explicit-any */
type Localized<T = any> = Record<string, T> | undefined

async function cf(path: string): Promise<any> {
  const res = await fetch(`https://cdn.contentful.com/spaces/${SPACE}${path}${path.includes('?') ? '&' : '?'}access_token=${TOKEN}`)
  if (!res.ok) throw new Error(`Contentful ${path} → ${res.status}`)
  return res.json()
}

const en = <T = any>(f: Localized<T>): T | undefined => f?.[EN]
/** Spanish value, falling back to English like Contentful's locale fallback */
const es = <T = any>(f: Localized<T>): T | undefined => f?.[ES] ?? f?.[EN]
const day = (v?: string | null) => (v ? v.slice(0, 10) : null)

/* ─── Assets → Vercel Blob ─────────────────────────────────────────────────── */
const assetsById = new Map<string, any>()
const uploaded = new Map<string, string>() // `${assetId}:${locale}` → blob url
let uploadCount = 0

async function assetUrl(link: any, locale = EN): Promise<{ url: string; alt: string } | null> {
  const id = link?.sys?.id
  const asset = id ? assetsById.get(id) : null
  if (!asset) return null
  const file = asset.fields.file?.[locale] ?? asset.fields.file?.[EN]
  if (!file?.url) return null
  const fileLocale = asset.fields.file?.[locale] ? locale : EN
  const key = `${id}:${fileLocale}`
  const alt = asset.fields.title?.[locale] ?? asset.fields.title?.[EN] ?? ''
  if (uploaded.has(key)) return { url: uploaded.get(key)!, alt }

  const res = await fetch(`https:${file.url}`)
  if (!res.ok) throw new Error(`Download failed ${file.url} → ${res.status}`)
  const body = Buffer.from(await res.arrayBuffer())
  const ext = (file.fileName as string).split('.').pop()?.toLowerCase() ?? 'bin'
  const base = (file.fileName as string)
    .replace(/\.[^.]+$/, '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
  const blob = await put(`migrated/${id}-${fileLocale}-${base}.${ext}`, body, {
    access: 'public',
    contentType: file.contentType,
    addRandomSuffix: false,
    allowOverwrite: true,
  })
  uploaded.set(key, blob.url)
  uploadCount++
  return { url: blob.url, alt }
}

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
async function entries(type: string) {
  const r = await cf(`/entries?content_type=${type}&locale=*&limit=1000`)
  return r.items as any[]
}

const counts: Record<string, { contentful: number; neon: number }> = {}

async function main() {
  const assets = await cf('/assets?locale=*&limit=1000')
  for (const a of assets.items) assetsById.set(a.sys.id, a)
  console.log(`Assets in Contentful: ${assets.items.length}`)

  /* Profile */
  const people = await entries('personal_information')
  for (const p of people) {
    const f = p.fields
    const photo = await assetUrl(en(f.foto))
    const cvEn = await assetUrl(en(f.cv), EN)
    const cvEs = await assetUrl(en(f.cv), ES)
    const values = {
      legacyId: p.sys.id,
      name: en(f.nombre) ?? '',
      headlineEn: en(f.profesion) ?? '',
      headlineEs: es(f.profesion) ?? '',
      bioEn: en(f.descripcion) ?? '',
      bioEs: es(f.descripcion) ?? '',
      location: en(f.ubicacion) ?? '',
      email: en(f.correo) ?? '',
      phone: en(f.telefono) ?? null,
      username: en(f.username) ?? null,
      website: en(f.web) ?? null,
      github: en(f.github) ?? null,
      linkedin: en(f.linkedin) ?? null,
      twitter: en(f.twitter) ?? null,
      facebook: en(f.facebook) ?? null,
      skillsEn: en(f.aptitudes) ?? [],
      skillsEs: es(f.aptitudes) ?? [],
      photoUrl: photo?.url ?? null,
      photoAlt: photo?.alt ?? null,
      cvEnUrl: cvEn?.url ?? null,
      cvEsUrl: cvEs?.url ?? null,
    }
    await db.insert(s.profile).values(values).onConflictDoUpdate({ target: s.profile.legacyId, set: values })
  }
  counts.profile = { contentful: people.length, neon: (await db.select().from(s.profile)).length }

  /* Experience — keep the current site order: current jobs first, then most recent */
  const jobs = (await entries('experienciaLaboral')).sort((a, b) => {
    const endA = day(en(a.fields.fechaCulminacion)) ?? '9999-12-31'
    const endB = day(en(b.fields.fechaCulminacion)) ?? '9999-12-31'
    if (endA !== endB) return endB.localeCompare(endA)
    return (day(en(b.fields.fechaInicio)) ?? '').localeCompare(day(en(a.fields.fechaInicio)) ?? '')
  })
  for (const [i, e] of jobs.entries()) {
    const f = e.fields
    const img = await assetUrl(en(f.imagen))
    const values = {
      legacyId: e.sys.id,
      sortOrder: i,
      titleEn: en(f.titulo) ?? '',
      titleEs: es(f.titulo) ?? '',
      company: en(f.empresa) ?? '',
      companyUrl: en(f.webEmpresa) ?? null,
      country: en(f.pais) ?? '',
      modeEn: en(f.modalidad) ?? '',
      modeEs: es(f.modalidad) ?? '',
      startDate: day(en(f.fechaInicio)) ?? '1970-01-01',
      endDate: day(en(f.fechaCulminacion)),
      descriptionEn: en(f.descripcion) ?? '',
      descriptionEs: es(f.descripcion) ?? '',
      technologies: en(f.tecnologias) ?? [],
      imageUrl: img?.url ?? null,
      imageAlt: img?.alt ?? null,
    }
    await db.insert(s.experiences).values(values).onConflictDoUpdate({ target: s.experiences.legacyId, set: values })
  }
  counts.experiences = { contentful: jobs.length, neon: (await db.select().from(s.experiences)).length }

  /* Education — same order the site shows today (Contentful default order) */
  const schools = await entries('educacion')
  for (const [i, e] of schools.entries()) {
    const f = e.fields
    const img = await assetUrl(en(f.imagen))
    const values = {
      legacyId: e.sys.id,
      sortOrder: i,
      institutionEn: en(f.institucion) ?? '',
      institutionEs: es(f.institucion) ?? '',
      degreeEn: en(f.titulo) ?? '',
      degreeEs: es(f.titulo) ?? '',
      startDate: day(en(f.fechaDeInicio)),
      endDate: day(en(f.fechaDeCulminacion)),
      url: en(f.url) ?? null,
      country: en(f.pais) ?? '',
      imageUrl: img?.url ?? null,
      imageAlt: img?.alt ?? null,
    }
    await db.insert(s.education).values(values).onConflictDoUpdate({ target: s.education.legacyId, set: values })
  }
  counts.education = { contentful: schools.length, neon: (await db.select().from(s.education)).length }

  /* Projects */
  const projectList = await entries('proyectos')
  for (const [i, e] of projectList.entries()) {
    const f = e.fields
    const img = await assetUrl(en(f.imagen))
    const values = {
      legacyId: e.sys.id,
      sortOrder: i,
      titleEn: en(f.titulo) ?? '',
      titleEs: es(f.titulo) ?? '',
      slug: en(f.slug) ?? null,
      url: en(f.url) ?? null,
      descriptionEn: en(f.descripcion) ?? '',
      descriptionEs: es(f.descripcion) ?? '',
      technologies: en(f.tecnologias) ?? [],
      imageUrl: img?.url ?? null,
      imageAlt: img?.alt ?? null,
      roleEn: en(f.rol) ?? null,
      roleEs: es(f.rol) ?? null,
      client: en(f.empresa) ?? null,
      date: day(en(f.fecha)),
      problemEn: en(f.problema) ?? null,
      problemEs: es(f.problema) ?? null,
      solutionEn: en(f.solucion) ?? null,
      solutionEs: es(f.solucion) ?? null,
      resultEn: en(f.resultado) ?? null,
      resultEs: es(f.resultado) ?? null,
    }
    await db.insert(s.projects).values(values).onConflictDoUpdate({ target: s.projects.legacyId, set: values })
  }
  counts.projects = { contentful: projectList.length, neon: (await db.select().from(s.projects)).length }

  /* Certificates (the PDF file is localized) */
  const certs = await entries('certificados')
  for (const [i, e] of certs.entries()) {
    const f = e.fields
    const fileEn = await assetUrl(en(f.archivo), EN)
    const fileEs = await assetUrl(es(f.archivo), ES)
    const img = await assetUrl(en(f.imagen))
    const thumb = await assetUrl(en(f.thumbnails))
    const values = {
      legacyId: e.sys.id,
      sortOrder: i,
      titleEn: en(f.titulo) ?? '',
      titleEs: es(f.titulo) ?? '',
      descriptionEn: en(f.descripcion) ?? '',
      descriptionEs: es(f.descripcion) ?? '',
      fileEnUrl: fileEn?.url ?? null,
      fileEsUrl: fileEs?.url ?? null,
      imageUrl: img?.url ?? null,
      imageAlt: img?.alt ?? null,
      thumbnailUrl: thumb?.url ?? null,
    }
    await db.insert(s.certificates).values(values).onConflictDoUpdate({ target: s.certificates.legacyId, set: values })
  }
  counts.certificates = { contentful: certs.length, neon: (await db.select().from(s.certificates)).length }

  /* Skills (icons are external URLs, nothing to upload) */
  const software = await entries('software')
  for (const [i, e] of software.entries()) {
    const f = e.fields
    const values = {
      legacyId: e.sys.id,
      sortOrder: i,
      name: en(f.nombre) ?? '',
      iconUrl: en(f.url_icono) ?? '',
      level: typeof en(f.nivel) === 'number' ? en(f.nivel) : 0,
    }
    await db.insert(s.skills).values(values).onConflictDoUpdate({ target: s.skills.legacyId, set: values })
  }
  counts.skills = { contentful: software.length, neon: (await db.select().from(s.skills)).length }

  console.log(`Files uploaded to Blob: ${uploadCount}`)
  console.table(counts)
  const mismatch = Object.entries(counts).filter(([, c]) => c.contentful !== c.neon)
  if (mismatch.length) {
    console.error('Count mismatch:', mismatch.map(([k]) => k).join(', '))
    process.exit(1)
  }
  console.log('Migration OK')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
