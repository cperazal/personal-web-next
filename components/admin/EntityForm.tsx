'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Check, Loader2, Save } from 'lucide-react'
import { ENTITIES, slugify, type FieldDef } from '@/lib/admin/entities'
import { saveEntity } from '@/lib/admin/actions'
import { FieldShell, FileInput, ImageInput, TagsInput } from './fields'

type Values = Record<string, unknown>
type Lang = 'en' | 'es'

const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v))

export default function EntityForm({
  entity,
  id,
  initial,
}: {
  entity: string
  id: string | null
  initial: Values
}) {
  const def = ENTITIES[entity]
  const router = useRouter()
  const [values, setValues] = useState<Values>(initial)
  const [lang, setLang] = useState<Lang>('en')
  const justCreated = useSearchParams().get('saved') === '1'
  const [status, setStatus] = useState<{ type: 'ok' | 'error'; text: string } | null>(
    justCreated ? { type: 'ok', text: 'Creado. La web ya está actualizada.' } : null
  )
  const [pending, startTransition] = useTransition()
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.slug))

  const set = (key: string, v: unknown) => {
    setStatus(null)
    setValues((prev) => {
      const next = { ...prev, [key]: v }
      // Auto-slug from the source field until the slug is edited by hand
      const slugField = def.fields.find((f) => f.kind === 'slug')
      if (slugField?.from === key && !slugTouched && slugField.key) {
        next[slugField.key] = slugify(str(v))
      }
      return next
    })
  }

  const groups = useMemo(() => {
    const map = new Map<string, FieldDef[]>()
    for (const f of def.fields) {
      const g = f.group ?? ''
      map.set(g, [...(map.get(g) ?? []), f])
    }
    return [...map.entries()]
  }, [def])

  const hasBilingual = def.fields.some((f) => f.en)
  /** Spanish fields left empty (the site falls back to English) */
  const missingEs = def.fields.filter((f) => f.es && !str(values[f.es]).trim() && str(values[f.en!]).trim()).length

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const res = await saveEntity(entity, id, values).catch(
        () => ({ ok: false, error: 'Error de conexión con el servidor. Inténtalo de nuevo.' }) as const
      )
      if (!res.ok) {
        setStatus({ type: 'error', text: res.error })
        return
      }
      setStatus({ type: 'ok', text: 'Guardado. La web ya está actualizada.' })
      if (!id && !def.singleton && res.id) router.replace(`/admin/${def.slug}/${res.id}?saved=1`)
      router.refresh()
    })
  }

  const renderInput = (f: FieldDef) => {
    const key = (f.en ? (lang === 'en' ? f.en : f.es) : f.key)!
    const inputId = `f-${key}`
    const folder = def.slug
    const value = values[key]

    let control: React.ReactNode
    switch (f.kind) {
      case 'textarea':
        control = (
          <textarea
            id={inputId}
            className="admin-input"
            rows={f.rows ?? 4}
            value={str(value)}
            onChange={(e) => set(key, e.target.value)}
            placeholder={f.placeholder}
          />
        )
        break
      case 'tags':
        control = <TagsInput id={inputId} value={Array.isArray(value) ? (value as string[]) : []} onChange={(v) => set(key, v)} />
        break
      case 'image':
        control = (
          <ImageInput
            folder={folder}
            value={(value as string) ?? null}
            alt={f.altKey ? (values[f.altKey] as string) : undefined}
            onChange={(url) => set(key, url)}
            onAltChange={f.altKey ? (a) => set(f.altKey!, a) : undefined}
          />
        )
        break
      case 'file':
        control = <FileInput folder={folder} value={(value as string) ?? null} onChange={(url) => set(key, url)} />
        break
      case 'slug':
        control = (
          <div className="flex items-center gap-2">
            <input
              id={inputId}
              className="admin-input font-mono"
              value={str(value)}
              onChange={(e) => {
                setSlugTouched(true)
                set(key, slugify(e.target.value))
              }}
              placeholder="se-genera-desde-el-titulo"
            />
            {f.from && (
              <button
                type="button"
                className="btn-outline text-xs whitespace-nowrap"
                onClick={() => {
                  setSlugTouched(false)
                  set(key, slugify(str(values[f.from!])))
                }}
              >
                Desde el título
              </button>
            )}
          </div>
        )
        break
      default:
        control = (
          <input
            id={inputId}
            className="admin-input"
            type={f.kind === 'number' ? 'number' : f.kind === 'date' ? 'date' : f.kind === 'email' ? 'email' : f.kind === 'url' ? 'url' : 'text'}
            min={f.min}
            max={f.max}
            value={str(value)}
            onChange={(e) => set(key, e.target.value)}
            placeholder={f.placeholder}
          />
        )
    }

    return (
      <FieldShell
        key={f.label}
        label={f.label}
        help={f.help}
        required={f.required}
        htmlFor={inputId}
        badge={f.en ? <span className="admin-lang-badge">{lang.toUpperCase()}</span> : undefined}
      >
        {control}
      </FieldShell>
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6 max-w-3xl">
      {/* Sticky toolbar */}
      <div
        className="sticky top-0 z-10 flex flex-wrap items-center gap-3 py-3 -mt-3"
        style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}
      >
        {!def.singleton && (
          <Link href={`/admin/${def.slug}`} className="btn-outline text-xs">
            <ArrowLeft size={14} /> Volver
          </Link>
        )}
        {hasBilingual && (
          <div className="flex rounded-lg overflow-hidden" role="tablist" aria-label="Idioma" style={{ border: '1px solid var(--border)' }}>
            {(['en', 'es'] as const).map((l) => (
              <button
                key={l}
                type="button"
                role="tab"
                aria-selected={lang === l}
                onClick={() => setLang(l)}
                className="px-3 py-1.5 text-xs font-mono"
                style={{ background: lang === l ? 'var(--accent)' : 'transparent', color: lang === l ? 'var(--bg)' : 'var(--text-secondary)' }}
              >
                {l === 'en' ? 'English' : 'Español'}
              </button>
            ))}
          </div>
        )}
        {hasBilingual && missingEs > 0 && (
          <span className="text-xs" style={{ color: '#fbbf24' }}>
            {missingEs} campo(s) sin traducir al español
          </span>
        )}
        <button type="submit" className="btn-accent text-sm ml-auto" disabled={pending}>
          {pending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Guardar
        </button>
      </div>

      {status && (
        <p
          role={status.type === 'error' ? 'alert' : 'status'}
          className="text-sm rounded-lg px-3 py-2 flex items-center gap-2"
          style={{
            background: status.type === 'ok' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
            color: status.type === 'ok' ? '#86efac' : '#fca5a5',
          }}
        >
          {status.type === 'ok' && <Check size={15} />} {status.text}
        </p>
      )}

      {groups.map(([group, fields]) => (
        <section key={group || 'main'} className="flex flex-col gap-5">
          {group && <h2 className="text-lg font-semibold pt-4" style={{ borderTop: '1px solid var(--border)' }}>{group}</h2>}
          {fields.map(renderInput)}
        </section>
      ))}
    </form>
  )
}
