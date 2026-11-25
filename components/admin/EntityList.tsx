'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowDown, ArrowUp, GripVertical, Pencil, Plus, Trash2 } from 'lucide-react'
import { ENTITIES } from '@/lib/admin/entities'
import { deleteEntity, reorder, setActive } from '@/lib/admin/actions'

type Row = Record<string, unknown> & { id: string; isActive: boolean }

export default function EntityList({ entity, rows: initialRows }: { entity: string; rows: Row[] }) {
  const def = ENTITIES[entity]
  const router = useRouter()
  const [rows, setRows] = useState(initialRows)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, rollback?: Row[]) =>
    startTransition(async () => {
      const res = await fn().catch(() => ({ ok: false, error: 'Error de conexión con el servidor. Inténtalo de nuevo.' }))
      if (!res.ok) {
        setError(res.error ?? 'Algo salió mal.')
        if (rollback) setRows(rollback)
      } else {
        setError(null)
        router.refresh()
      }
    })

  const move = (from: number, to: number) => {
    if (to < 0 || to >= rows.length || from === to) return
    const prev = rows
    const next = [...rows]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    setRows(next)
    run(() => reorder(entity, next.map((r) => r.id)), prev)
  }

  const toggle = (row: Row) => {
    const prev = rows
    setRows(rows.map((r) => (r.id === row.id ? { ...r, isActive: !r.isActive } : r)))
    run(() => setActive(entity, row.id, !row.isActive), prev)
  }

  const remove = (row: Row) => {
    const title = String(row[def.list.title] ?? '')
    if (!confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) return
    const prev = rows
    setRows(rows.filter((r) => r.id !== row.id))
    run(() => deleteEntity(entity, row.id), prev)
  }

  return (
    <div className="flex flex-col gap-4 max-w-4xl">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">{def.label}</h1>
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{rows.length}</span>
        <Link href={`/admin/${def.slug}/new`} className="btn-accent text-sm ml-auto">
          <Plus size={15} /> Nuevo {def.singular}
        </Link>
      </div>
      <p className="admin-help">Arrastra para cambiar el orden en la web. Los inactivos no se muestran en el sitio.</p>

      {error && <p role="alert" className="admin-error">{error}</p>}

      <ul className="flex flex-col gap-2" aria-busy={pending}>
        {rows.map((row, i) => {
          const title = String(row[def.list.title] ?? '(sin título)')
          const subtitle = def.list.subtitle?.(row)
          const img = def.list.image ? (row[def.list.image] as string | null) : null
          return (
            <li
              key={row.id}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null) move(dragIndex, i)
                setDragIndex(null)
              }}
              onDragEnd={() => setDragIndex(null)}
              className="glass-card flex items-center gap-3 p-3"
              style={{ opacity: row.isActive ? 1 : 0.55, outline: dragIndex === i ? '1px dashed var(--accent)' : undefined }}
            >
              <GripVertical size={16} className="cursor-grab shrink-0" style={{ color: 'var(--text-secondary)' }} aria-hidden />
              <div className="w-12 h-12 rounded-md overflow-hidden shrink-0 flex items-center justify-center" style={{ background: 'var(--surface-2)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {img ? <img src={img} alt="" className="w-full h-full object-contain" /> : null}
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/admin/${def.slug}/${row.id}`} className="font-medium block truncate" style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                  {title}
                </Link>
                {subtitle && <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>}
              </div>

              <label className="flex items-center gap-2 text-xs cursor-pointer shrink-0" style={{ color: 'var(--text-secondary)' }}>
                <input type="checkbox" checked={row.isActive} onChange={() => toggle(row)} className="accent-current" />
                {row.isActive ? 'Activo' : 'Inactivo'}
              </label>
              <div className="flex items-center gap-1 shrink-0">
                <button type="button" className="admin-icon-btn" aria-label="Subir" onClick={() => move(i, i - 1)} disabled={i === 0}>
                  <ArrowUp size={15} />
                </button>
                <button type="button" className="admin-icon-btn" aria-label="Bajar" onClick={() => move(i, i + 1)} disabled={i === rows.length - 1}>
                  <ArrowDown size={15} />
                </button>
                <Link href={`/admin/${def.slug}/${row.id}`} className="admin-icon-btn" aria-label="Editar">
                  <Pencil size={15} />
                </Link>
                <button type="button" className="admin-icon-btn" aria-label="Eliminar" onClick={() => remove(row)}>
                  <Trash2 size={15} />
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
