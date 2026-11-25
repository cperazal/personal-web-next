'use client'

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { upload } from '@vercel/blob/client'
import { FileText, ImagePlus, Loader2, Trash2, Upload, X } from 'lucide-react'

/* ─── Layout helpers ────────────────────────────────────────────────────────── */
export function FieldShell({
  label,
  help,
  required,
  htmlFor,
  badge,
  children,
}: {
  label: string
  help?: string
  required?: boolean
  htmlFor?: string
  badge?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="admin-label flex items-center gap-2">
        {label}
        {required && <span style={{ color: 'var(--accent)' }}>*</span>}
        {badge}
      </label>
      {children}
      {help && <p className="admin-help">{help}</p>}
    </div>
  )
}

/* ─── Tags (Enter or comma adds, Backspace removes) ─────────────────────────── */
export function TagsInput({ value, onChange, id }: { value: string[]; onChange: (v: string[]) => void; id?: string }) {
  const [draft, setDraft] = useState('')

  const add = (raw: string) => {
    const items = raw.split(',').map((t) => t.trim()).filter(Boolean)
    if (!items.length) return
    onChange([...value, ...items.filter((t) => !value.includes(t))])
    setDraft('')
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      add(draft)
    } else if (e.key === 'Backspace' && !draft && value.length) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div className="admin-input flex flex-wrap gap-1.5 items-center min-h-[42px]">
      {value.map((tag) => (
        <span key={tag} className="tech-chip inline-flex items-center gap-1">
          {tag}
          <button type="button" aria-label={`Quitar ${tag}`} onClick={() => onChange(value.filter((t) => t !== tag))}>
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => add(draft)}
        className="flex-1 min-w-[120px] bg-transparent outline-none text-sm"
        placeholder={value.length ? '' : 'Escribe y pulsa Enter'}
      />
    </div>
  )
}

/* ─── Upload to Vercel Blob ─────────────────────────────────────────────────── */
async function uploadFile(file: File, folder: string): Promise<string> {
  const safeName = file.name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9._-]+/g, '-')
  const blob = await upload(`${folder}/${safeName}`, file, {
    access: 'public',
    handleUploadUrl: '/api/admin/upload',
  })
  return blob.url
}

function useUploader(folder: string, onUploaded: (url: string) => void) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handle = async (file?: File | null) => {
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setError('El archivo supera 10 MB.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      onUploaded(await uploadFile(file, folder))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo subir el archivo.')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }
  return { busy, error, inputRef, handle }
}

export function ImageInput({
  value,
  alt,
  onChange,
  onAltChange,
  folder,
}: {
  value: string | null
  alt?: string | null
  onChange: (url: string | null) => void
  onAltChange?: (alt: string) => void
  folder: string
}) {
  const id = useId()
  const { busy, error, inputRef, handle } = useUploader(folder, onChange)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4">
        <div
          className="w-28 h-20 rounded-lg overflow-hidden flex items-center justify-center shrink-0"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            handle(e.dataTransfer.files?.[0])
          }}
        >
          {busy ? (
            <Loader2 className="animate-spin" size={20} />
          ) : value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt={alt ?? ''} className="w-full h-full object-contain" />
          ) : (
            <ImagePlus size={22} style={{ color: 'var(--text-secondary)' }} />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-outline text-xs" disabled={busy} onClick={() => inputRef.current?.click()}>
            <Upload size={14} /> {value ? 'Cambiar' : 'Subir imagen'}
          </button>
          {value && (
            <button type="button" className="btn-outline text-xs" onClick={() => onChange(null)}>
              <Trash2 size={14} /> Quitar
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => handle(e.target.files?.[0])}
        />
      </div>
      {onAltChange && value && (
        <input
          className="admin-input"
          value={alt ?? ''}
          onChange={(e) => onAltChange(e.target.value)}
          placeholder="Texto alternativo (describe la imagen, ayuda al SEO)"
        />
      )}
      {error && <p className="admin-error">{error}</p>}
    </div>
  )
}

export function FileInput({
  value,
  onChange,
  folder,
}: {
  value: string | null
  onChange: (url: string | null) => void
  folder: string
}) {
  const { busy, error, inputRef, handle } = useUploader(folder, onChange)
  const name = value ? decodeURIComponent(value.split('/').pop() ?? '') : null

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {value ? (
          <a href={value} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm" style={{ color: 'var(--accent)' }}>
            <FileText size={16} /> {name}
          </a>
        ) : (
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Sin archivo</span>
        )}
        <button type="button" className="btn-outline text-xs" disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />} {value ? 'Reemplazar' : 'Subir PDF'}
        </button>
        {value && (
          <button type="button" className="btn-outline text-xs" onClick={() => onChange(null)}>
            <Trash2 size={14} /> Quitar
          </button>
        )}
        <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={(e) => handle(e.target.files?.[0])} />
      </div>
      {error && <p className="admin-error">{error}</p>}
    </div>
  )
}
