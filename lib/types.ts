// ─── Shared primitive ────────────────────────────────────────────────────────
export interface ContentfulImage {
  url: string
  title: string
  width?: number
  height?: number
}

// ─── Content types ────────────────────────────────────────────────────────────

export interface PersonalInfo {
  nombre: string
  descripcion: string
  github: string
  linkedin: string
  facebook?: string | null
  twitter?: string | null
  ubicacion: string
  telefono?: string | null
  correo: string
  web?: string | null
  foto?: ContentfulImage | null
  /** Downloadable CV per language (the CV asset's file is localized in Contentful) */
  cv?: { en: string | null; es: string | null } | null
}

export interface Skill {
  id: string
  nombre: string
  url_icono: string
  nivel: number // 0–100
}

export interface ExperienceItem {
  id: string
  titulo: string
  empresa: string
  webEmpresa?: string | null
  pais: string
  modalidad: string
  fechaInicio: string
  fechaCulminacion?: string | null
  descripcion: string
  imagen?: ContentfulImage | null
  tecnologias: string[]
}

export interface EducationItem {
  id: string
  titulo: string
  institucion: string
  url?: string | null
  pais: string
  fechaDeInicio: string
  fechaDeCulminacion?: string | null
  imagen?: ContentfulImage | null
}

export interface ProjectItem {
  id: string
  titulo: string
  empresa?: string | null
  url?: string | null
  descripcion: string
  imagen?: ContentfulImage | null
  tecnologias?: string[]
  /* Case study fields (optional in Contentful). A project gets its own page at
     /projects/[slug] only when it has a slug and a solution. */
  slug?: string | null
  rol?: string | null
  fecha?: string | null
  problema?: string | null
  solucion?: string | null
  resultado?: string | null
  updatedAt?: string | null
}

export interface CertificadoItem {
  id: string
  titulo: string
  institucion: string
  url?: string | null
  imagen?: ContentfulImage | null
  archivo?: { url: string; title: string } | null
  thumbnails?: ContentfulImage | null
}

// ─── Locale ───────────────────────────────────────────────────────────────────
export type Locale = 'es-419' | 'en-US'
