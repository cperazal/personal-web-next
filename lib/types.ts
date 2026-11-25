// ─── Shared primitive ────────────────────────────────────────────────────────
export interface ImageAsset {
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
  foto?: ImageAsset | null
  /** Downloadable CV per language (one PDF per language) */
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
  imagen?: ImageAsset | null
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
  imagen?: ImageAsset | null
}

export interface ProjectItem {
  id: string
  titulo: string
  empresa?: string | null
  url?: string | null
  descripcion: string
  imagen?: ImageAsset | null
  tecnologias?: string[]
  /* Case study fields (optional). A project gets its own page at
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
  imagen?: ImageAsset | null
  archivo?: { url: string; title: string } | null
  thumbnails?: ImageAsset | null
}

// ─── Locale ───────────────────────────────────────────────────────────────────
export type Locale = 'es-419' | 'en-US'
