'use server'

import { asc, eq, getTableColumns, inArray, sql } from 'drizzle-orm'
import { del } from '@vercel/blob'
import { getDb, schema as s } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/require-admin'
import { revalidateSite } from '@/lib/revalidate'
import { ENTITIES, type EntityDef, slugify } from './entities'

/* ─── Entity → table ────────────────────────────────────────────────────────── */
const TABLES = {
  profile: s.profile,
  experience: s.experiences,
  education: s.education,
  projects: s.projects,
  certificates: s.certificates,
  skills: s.skills,
} as const

type EntitySlug = keyof typeof TABLES
type Row = Record<string, unknown>
export type ActionResult = { ok: true; id?: string } | { ok: false; error: string }

function resolve(entity: string) {
  const def = ENTITIES[entity] as EntityDef | undefined
  const table = TABLES[entity as EntitySlug]
  if (!def || !table) throw new Error(`Unknown entity: ${entity}`)
  return { def, table }
}

/** Refresh every public page that shows content */
function refreshSite() {
  revalidateSite()
}

const BLOB_HOST = '.public.blob.vercel-storage.com'
const isOurBlob = (u: unknown): u is string => typeof u === 'string' && u.includes(BLOB_HOST)

/** Deletes Blob files that are no longer referenced (best effort) */
async function deleteBlobs(urls: unknown[]) {
  const ours = urls.filter(isOurBlob)
  if (ours.length) await del(ours).catch((e) => console.error('[admin] blob delete failed', e))
}

function fileColumns(def: EntityDef): string[] {
  return def.fields
    .filter((f) => f.kind === 'image' || f.kind === 'file')
    .flatMap((f) => [f.key, f.en, f.es].filter((k): k is string => Boolean(k)))
}

/* ─── Validation & coercion ─────────────────────────────────────────────────── */
function clean(def: EntityDef, table: (typeof TABLES)[EntitySlug], input: Row): { values: Row } | { error: string } {
  const columns = getTableColumns(table) as Record<string, { notNull: boolean }>
  const values: Row = {}

  for (const f of def.fields) {
    const keys = [f.key, f.en, f.es].filter((k): k is string => Boolean(k))
    for (const key of keys) {
      const raw = input[key]
      const notNull = columns[key]?.notNull ?? false
      let v: unknown

      switch (f.kind) {
        case 'tags':
          v = Array.isArray(raw) ? raw.map((t) => String(t).trim()).filter(Boolean) : []
          break
        case 'number': {
          const n = Number(raw)
          if (raw === '' || raw == null || Number.isNaN(n)) v = 0
          else v = Math.min(f.max ?? n, Math.max(f.min ?? n, Math.round(n)))
          break
        }
        case 'slug': {
          const str = typeof raw === 'string' ? slugify(raw) : ''
          v = str || null
          break
        }
        default: {
          const str = typeof raw === 'string' ? raw.trim() : ''
          if (f.kind === 'url' && str && !/^https?:\/\//i.test(str)) {
            return { error: `"${f.label}" debe empezar con http:// o https://` }
          }
          if (f.kind === 'email' && str && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) {
            return { error: `"${f.label}" no es un email válido` }
          }
          if (f.kind === 'date' && str && !/^\d{4}-\d{2}-\d{2}$/.test(str)) {
            return { error: `"${f.label}" no es una fecha válida` }
          }
          v = str || (notNull ? '' : null)
        }
      }
      // Required: the English (or single) value must be present
      if (f.required && (key === f.key || key === f.en) && (v === '' || v == null)) {
        return { error: `"${f.label}" es obligatorio` }
      }
      values[key] = v
    }
    if (f.altKey) {
      const alt = typeof input[f.altKey] === 'string' ? (input[f.altKey] as string).trim() : ''
      values[f.altKey] = alt || null
    }
  }
  return { values }
}

function friendlyDbError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e)
  if (/unique|duplicate/i.test(msg)) return 'Ya existe otro registro con ese slug. Usa uno distinto.'
  console.error('[admin] db error', e)
  return 'No se pudo guardar. Revisa los datos e inténtalo de nuevo.'
}

/* ─── Actions ───────────────────────────────────────────────────────────────── */
export async function saveEntity(entity: string, id: string | null, input: Row): Promise<ActionResult> {
  await requireAdmin()
  const { def, table } = resolve(entity)
  const result = clean(def, table, input)
  if ('error' in result) return { ok: false, error: result.error }
  const db = getDb()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = table as any

  try {
    if (def.singleton) {
      const [existing] = await db.select().from(t).limit(1)
      if (existing) {
        await db.update(t).set(result.values).where(eq(t.id, (existing as Row).id as string))
        await deleteBlobs(fileColumns(def).filter((k) => (existing as Row)[k] !== result.values[k]).map((k) => (existing as Row)[k]))
        refreshSite()
        return { ok: true, id: (existing as Row).id as string }
      }
      const [created] = await db.insert(t).values(result.values).returning({ id: t.id })
      refreshSite()
      return { ok: true, id: created.id }
    }

    if (id) {
      const [existing] = await db.select().from(t).where(eq(t.id, id))
      if (!existing) return { ok: false, error: 'El registro ya no existe.' }
      await db.update(t).set(result.values).where(eq(t.id, id))
      await deleteBlobs(fileColumns(def).filter((k) => (existing as Row)[k] !== result.values[k]).map((k) => (existing as Row)[k]))
      refreshSite()
      return { ok: true, id }
    }

    // New items go to the top of the list
    const [{ min }] = await db.select({ min: sql<number>`coalesce(min(${t.sortOrder}), 0)` }).from(t)
    const [created] = await db
      .insert(t)
      .values({ ...result.values, sortOrder: Number(min) - 1 })
      .returning({ id: t.id })
    refreshSite()
    return { ok: true, id: created.id }
  } catch (e) {
    return { ok: false, error: friendlyDbError(e) }
  }
}

export async function deleteEntity(entity: string, id: string): Promise<ActionResult> {
  await requireAdmin()
  const { def, table } = resolve(entity)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = table as any
  const deleted = (await getDb().delete(t).where(eq(t.id, id)).returning()) as Row[]
  const existing = deleted[0]
  if (existing) await deleteBlobs(fileColumns(def).map((k) => existing[k]))
  refreshSite()
  return { ok: true }
}

export async function setActive(entity: string, id: string, isActive: boolean): Promise<ActionResult> {
  await requireAdmin()
  const { table } = resolve(entity)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = table as any
  await getDb().update(t).set({ isActive }).where(eq(t.id, id))
  refreshSite()
  return { ok: true }
}

/** Saves a new order: ids[0] is shown first on the site */
export async function reorder(entity: string, ids: string[]): Promise<ActionResult> {
  await requireAdmin()
  const { table } = resolve(entity)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = table as any
  const db = getDb()
  const existing = await db.select({ id: t.id }).from(t).where(inArray(t.id, ids))
  if (existing.length !== ids.length) return { ok: false, error: 'La lista cambió. Recarga la página.' }
  // One UPDATE with a CASE expression keeps the new order consistent
  const cases = sql.join(
    ids.map((id, i) => sql`when ${t.id} = ${id} then ${i}`),
    sql` `
  )
  try {
    await db.update(t).set({ sortOrder: sql`(case ${cases} end)::integer` }).where(inArray(t.id, ids))
  } catch (e) {
    return { ok: false, error: friendlyDbError(e) }
  }
  refreshSite()
  return { ok: true }
}

/* ─── Reads used by the admin pages ─────────────────────────────────────────── */
export async function listEntity(entity: string): Promise<Row[]> {
  await requireAdmin()
  const { table } = resolve(entity)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = table as any
  return getDb().select().from(t).orderBy(asc(t.sortOrder))
}

export async function getEntity(entity: string, id?: string): Promise<Row | null> {
  await requireAdmin()
  const { def, table } = resolve(entity)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = table as any
  const db = getDb()
  const [row] = def.singleton
    ? await db.select().from(t).limit(1)
    : await db.select().from(t).where(eq(t.id, id as string))
  return (row as Row) ?? null
}
