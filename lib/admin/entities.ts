/* ─── Admin content model (client-safe: no database imports) ──────────────────
 * Each section of the admin panel is described here once: its fields, how they
 * map to database columns and how rows are shown in the list. The generic list,
 * form and server actions are driven by this config.
 */

export type FieldKind =
  | 'text'
  | 'textarea'
  | 'url'
  | 'email'
  | 'date'
  | 'number'
  | 'tags'
  | 'image'
  | 'file'
  | 'slug'

export interface FieldDef {
  kind: FieldKind
  label: string
  /** Column for single-language fields */
  key?: string
  /** Columns for bilingual fields (shown in EN / ES tabs) */
  en?: string
  es?: string
  /** For images: column that stores the alt text */
  altKey?: string
  required?: boolean
  help?: string
  placeholder?: string
  rows?: number
  min?: number
  max?: number
  /** For slug fields: the column the slug is generated from */
  from?: string
  /** Visual group heading inside the form */
  group?: string
}

export interface EntityDef {
  /** URL segment: /admin/<slug> */
  slug: string
  label: string
  singular: string
  /** Singletons (profile) have a form but no list */
  singleton?: boolean
  fields: FieldDef[]
  /** Columns shown in the list */
  list: { title: string; subtitle?: (row: Record<string, unknown>) => string; image?: string }
}

const range = (r: Record<string, unknown>) =>
  [r.startDate, r.endDate ?? 'Actual'].filter(Boolean).join(' → ')

const image = (label = 'Imagen'): FieldDef => ({
  kind: 'image',
  label,
  key: 'imageUrl',
  altKey: 'imageAlt',
})

export const ENTITIES: Record<string, EntityDef> = {
  profile: {
    slug: 'profile',
    label: 'Perfil',
    singular: 'perfil',
    singleton: true,
    list: { title: 'name' },
    fields: [
      { kind: 'text', label: 'Nombre', key: 'name', required: true },
      { kind: 'text', label: 'Titular', en: 'headlineEn', es: 'headlineEs', help: 'Ej.: Software Engineer | Tech Lead' },
      { kind: 'textarea', label: 'Biografía', en: 'bioEn', es: 'bioEs', rows: 6 },
      { kind: 'tags', label: 'Aptitudes', en: 'skillsEn', es: 'skillsEs', help: 'Escribe y pulsa Enter' },
      { kind: 'image', label: 'Foto', key: 'photoUrl', altKey: 'photoAlt' },
      { kind: 'file', label: 'CV (PDF)', en: 'cvEnUrl', es: 'cvEsUrl' },
      { kind: 'text', label: 'Ubicación', key: 'location', group: 'Contacto' },
      { kind: 'email', label: 'Email', key: 'email', group: 'Contacto' },
      { kind: 'text', label: 'Teléfono', key: 'phone', group: 'Contacto' },
      { kind: 'text', label: 'Usuario', key: 'username', group: 'Redes', placeholder: '@cperazal' },
      { kind: 'url', label: 'Web', key: 'website', group: 'Redes' },
      { kind: 'url', label: 'GitHub', key: 'github', group: 'Redes' },
      { kind: 'url', label: 'LinkedIn', key: 'linkedin', group: 'Redes' },
      { kind: 'url', label: 'X / Twitter', key: 'twitter', group: 'Redes' },
      { kind: 'url', label: 'Facebook', key: 'facebook', group: 'Redes' },
    ],
  },

  experience: {
    slug: 'experience',
    label: 'Experiencia',
    singular: 'experiencia',
    list: { title: 'titleEn', subtitle: (r) => `${r.company} · ${range(r)}`, image: 'imageUrl' },
    fields: [
      { kind: 'text', label: 'Cargo', en: 'titleEn', es: 'titleEs', required: true },
      { kind: 'text', label: 'Empresa', key: 'company', required: true },
      { kind: 'url', label: 'Web de la empresa', key: 'companyUrl' },
      { kind: 'text', label: 'País', key: 'country' },
      { kind: 'text', label: 'Modalidad', en: 'modeEn', es: 'modeEs', placeholder: 'Remote / Remoto' },
      { kind: 'date', label: 'Fecha de inicio', key: 'startDate', required: true },
      { kind: 'date', label: 'Fecha de fin', key: 'endDate', help: 'Déjala vacía si es tu trabajo actual' },
      { kind: 'textarea', label: 'Descripción', en: 'descriptionEn', es: 'descriptionEs', rows: 6 },
      { kind: 'tags', label: 'Tecnologías', key: 'technologies' },
      image('Logo'),
    ],
  },

  education: {
    slug: 'education',
    label: 'Educación',
    singular: 'estudio',
    list: { title: 'institutionEn', subtitle: (r) => `${r.degreeEn ?? ''} · ${range(r)}`, image: 'imageUrl' },
    fields: [
      { kind: 'text', label: 'Institución', en: 'institutionEn', es: 'institutionEs', required: true },
      { kind: 'text', label: 'Título', en: 'degreeEn', es: 'degreeEs' },
      { kind: 'date', label: 'Fecha de inicio', key: 'startDate' },
      { kind: 'date', label: 'Fecha de fin', key: 'endDate' },
      { kind: 'url', label: 'Web', key: 'url' },
      { kind: 'text', label: 'País', key: 'country' },
      image('Logo'),
    ],
  },

  projects: {
    slug: 'projects',
    label: 'Proyectos',
    singular: 'proyecto',
    list: {
      title: 'titleEn',
      subtitle: (r) => [r.client, r.slug ? `Caso de estudio: /projects/${r.slug}` : null].filter(Boolean).join(' · '),
      image: 'imageUrl',
    },
    fields: [
      { kind: 'text', label: 'Título', en: 'titleEn', es: 'titleEs', required: true },
      { kind: 'textarea', label: 'Descripción corta', en: 'descriptionEn', es: 'descriptionEs', rows: 3 },
      { kind: 'url', label: 'URL del proyecto', key: 'url' },
      { kind: 'tags', label: 'Tecnologías', key: 'technologies' },
      image(),
      {
        kind: 'slug',
        label: 'Slug',
        key: 'slug',
        from: 'titleEn',
        group: 'Caso de estudio',
        help: 'La página /projects/<slug> solo existe si hay slug y solución',
      },
      { kind: 'text', label: 'Rol', en: 'roleEn', es: 'roleEs', group: 'Caso de estudio' },
      { kind: 'text', label: 'Cliente / empresa', key: 'client', group: 'Caso de estudio' },
      { kind: 'date', label: 'Fecha', key: 'date', group: 'Caso de estudio' },
      { kind: 'textarea', label: 'Problema', en: 'problemEn', es: 'problemEs', rows: 5, group: 'Caso de estudio' },
      { kind: 'textarea', label: 'Solución', en: 'solutionEn', es: 'solutionEs', rows: 6, group: 'Caso de estudio' },
      { kind: 'textarea', label: 'Resultado', en: 'resultEn', es: 'resultEs', rows: 4, group: 'Caso de estudio' },
    ],
  },

  certificates: {
    slug: 'certificates',
    label: 'Certificados',
    singular: 'certificado',
    list: { title: 'titleEn', subtitle: (r) => String(r.issuerEn ?? ''), image: 'thumbnailUrl' },
    fields: [
      { kind: 'text', label: 'Título', en: 'titleEn', es: 'titleEs', required: true },
      { kind: 'text', label: 'Emisor', en: 'issuerEn', es: 'issuerEs' },
      { kind: 'textarea', label: 'Descripción', en: 'descriptionEn', es: 'descriptionEs', rows: 3 },
      { kind: 'url', label: 'URL', key: 'url' },
      { kind: 'file', label: 'Archivo (PDF)', en: 'fileEnUrl', es: 'fileEsUrl' },
      { kind: 'image', label: 'Miniatura', key: 'thumbnailUrl' },
      image(),
    ],
  },

  skills: {
    slug: 'skills',
    label: 'Skills',
    singular: 'skill',
    list: { title: 'name', subtitle: (r) => `Nivel ${r.level}`, image: 'iconUrl' },
    fields: [
      { kind: 'text', label: 'Nombre', key: 'name', required: true },
      { kind: 'url', label: 'URL del ícono (SVG)', key: 'iconUrl', help: 'Por ejemplo, un ícono de devicon en jsDelivr' },
      { kind: 'number', label: 'Nivel (0–100)', key: 'level', min: 0, max: 100 },
    ],
  },
}

export const LIST_ENTITIES = Object.values(ENTITIES).filter((e) => !e.singleton)

/** All database columns a form writes for this entity */
export function entityColumns(def: EntityDef): string[] {
  return def.fields.flatMap((f) => [f.key, f.en, f.es, f.altKey].filter((k): k is string => Boolean(k)))
}

/** URL-safe slug from any text: "Integración BCR .NET" → "integracion-bcr-net" */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}
