'use client'

import { useEffect, useRef, useState, type ClipboardEvent, type DragEvent } from 'react'
import { upload } from '@vercel/blob/client'
import { Bold, Code, Heading2, Heading3, ImagePlus, Italic, Link2, List, ListOrdered, Loader2, Quote, SquareCode, Table } from 'lucide-react'
import { previewMarkdown } from '@/lib/admin/post-actions'

interface Props {
  id: string
  value: string
  onChange: (v: string) => void
  folder: string
  placeholder?: string
}

type Edit = { before: string; after?: string; placeholder?: string; block?: boolean }

const ACTIONS: { label: string; Icon: typeof Bold; edit: Edit }[] = [
  { label: 'Título H2', Icon: Heading2, edit: { before: '## ', placeholder: 'Título de sección', block: true } },
  { label: 'Subtítulo H3', Icon: Heading3, edit: { before: '### ', placeholder: 'Subtítulo', block: true } },
  { label: 'Negrita', Icon: Bold, edit: { before: '**', after: '**', placeholder: 'texto' } },
  { label: 'Cursiva', Icon: Italic, edit: { before: '_', after: '_', placeholder: 'texto' } },
  { label: 'Enlace', Icon: Link2, edit: { before: '[', after: '](https://)', placeholder: 'texto del enlace' } },
  { label: 'Código en línea', Icon: Code, edit: { before: '`', after: '`', placeholder: 'código' } },
  { label: 'Bloque de código', Icon: SquareCode, edit: { before: '```csharp\n', after: '\n```', placeholder: '// código', block: true } },
  { label: 'Lista', Icon: List, edit: { before: '- ', placeholder: 'elemento', block: true } },
  { label: 'Lista numerada', Icon: ListOrdered, edit: { before: '1. ', placeholder: 'elemento', block: true } },
  { label: 'Cita', Icon: Quote, edit: { before: '> ', placeholder: 'cita', block: true } },
  {
    label: 'Tabla',
    Icon: Table,
    edit: { before: '| Columna | Columna |\n|---|---|\n| ', after: ' | valor |', placeholder: 'valor', block: true },
  },
]

/** Markdown editor with toolbar, image upload (button, paste, drop) and live preview */
export default function MarkdownEditor({ id, value, onChange, folder, placeholder }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState('')
  const [previewing, setPreviewing] = useState(false)
  const [mobileTab, setMobileTab] = useState<'write' | 'preview'>('write')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debounced server-side preview (same renderer as the public article)
  useEffect(() => {
    if (!value.trim()) {
      setPreview('')
      return
    }
    setPreviewing(true)
    const t = setTimeout(() => {
      previewMarkdown(value)
        .then(setPreview)
        .catch(() => setPreview('<p>No se pudo generar la vista previa.</p>'))
        .finally(() => setPreviewing(false))
    }, 500)
    return () => clearTimeout(t)
  }, [value])

  const apply = ({ before, after = '', placeholder: ph = '', block }: Edit) => {
    const el = ref.current
    if (!el) return
    const { selectionStart: start, selectionEnd: end } = el
    const selected = value.slice(start, end) || ph
    // Block elements start on their own line
    const needsNewline = block && start > 0 && value[start - 1] !== '\n'
    const prefix = (needsNewline ? '\n' : '') + before
    const next = value.slice(0, start) + prefix + selected + after + value.slice(end)
    onChange(next)
    requestAnimationFrame(() => {
      el.focus()
      const s = start + prefix.length
      el.setSelectionRange(s, s + selected.length)
    })
  }

  const insertAtCursor = (text: string) => {
    const el = ref.current
    const pos = el?.selectionStart ?? value.length
    const next = value.slice(0, pos) + text + value.slice(pos)
    onChange(next)
    requestAnimationFrame(() => el?.setSelectionRange(pos + text.length, pos + text.length))
  }

  const uploadImages = async (files: File[]) => {
    const images = files.filter((f) => f.type.startsWith('image/'))
    if (!images.length) return
    setUploading(true)
    setError(null)
    try {
      for (const file of images) {
        if (file.size > 10 * 1024 * 1024) throw new Error(`"${file.name}" supera 10 MB`)
        const name = file.name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9._-]+/g, '-') || 'imagen.png'
        const blob = await upload(`${folder}/${name}`, file, { access: 'public', handleUploadUrl: '/api/admin/upload' })
        const alt = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ')
        insertAtCursor(`\n![${alt}](${blob.url})\n`)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo subir la imagen')
    } finally {
      setUploading(false)
    }
  }

  const onPaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const files = [...e.clipboardData.files]
    if (files.some((f) => f.type.startsWith('image/'))) {
      e.preventDefault()
      uploadImages(files)
    }
  }
  const onDrop = (e: DragEvent<HTMLTextAreaElement>) => {
    const files = [...e.dataTransfer.files]
    if (files.length) {
      e.preventDefault()
      uploadImages(files)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 rounded-lg p-1" style={{ border: '1px solid var(--border)', background: 'var(--surface-2)' }}>
        {ACTIONS.map(({ label, Icon, edit }) => (
          <button key={label} type="button" className="admin-icon-btn" title={label} aria-label={label} onClick={() => apply(edit)}>
            <Icon size={16} />
          </button>
        ))}
        <button type="button" className="admin-icon-btn" title="Insertar imagen" aria-label="Insertar imagen" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            uploadImages([...(e.target.files ?? [])])
            e.target.value = ''
          }}
        />
        <div className="flex lg:hidden ml-auto rounded-md overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {(['write', 'preview'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setMobileTab(tab)}
              className="px-3 py-1 text-xs"
              style={{ background: mobileTab === tab ? 'var(--accent)' : 'transparent', color: mobileTab === tab ? 'var(--bg)' : 'var(--text-secondary)' }}
            >
              {tab === 'write' ? 'Escribir' : 'Vista previa'}
            </button>
          ))}
        </div>
      </div>

      {/* Editor + preview */}
      <div className="grid lg:grid-cols-2 gap-3">
        <textarea
          id={id}
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onPaste={onPaste}
          onDrop={onDrop}
          spellCheck
          placeholder={placeholder ?? 'Escribe en Markdown. Pega o arrastra imágenes aquí.'}
          className={`admin-input font-mono text-sm min-h-[560px] ${mobileTab === 'preview' ? 'hidden lg:block' : ''}`}
          style={{ lineHeight: 1.7, resize: 'vertical' }}
        />
        <div
          className={`rounded-lg overflow-auto min-h-[560px] max-h-[80vh] p-5 ${mobileTab === 'write' ? 'hidden lg:block' : ''}`}
          style={{ border: '1px solid var(--border)', background: 'var(--bg)' }}
          aria-live="polite"
        >
          {previewing && <p className="admin-help mb-2">Actualizando vista previa…</p>}
          {preview ? (
            <div className="prose-blog" dangerouslySetInnerHTML={{ __html: preview }} />
          ) : (
            <p className="admin-help">La vista previa aparece aquí, igual a como se verá en el blog.</p>
          )}
        </div>
      </div>
      {error && <p className="admin-error">{error}</p>}
      <p className="admin-help">
        Atajos: pega una imagen (Ctrl+V) o arrástrala al texto para subirla. Los bloques de código con lenguaje (```csharp) se resaltan.
      </p>
    </div>
  )
}
