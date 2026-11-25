'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Check, ExternalLink, Loader2, Send, Save, Undo2 } from 'lucide-react'
import { savePost, type PostInput } from '@/lib/admin/post-actions'
import { slugify } from '@/lib/admin/entities'
import { FieldShell, ImageInput, TagsInput } from './fields'
import MarkdownEditor from './MarkdownEditor'

type Lang = 'en' | 'es'
const SUFFIX = { en: 'En', es: 'Es' } as const
const LABEL = { en: 'English', es: 'Español' } as const

/** ISO → value for <input type="datetime-local"> in the browser's timezone */
const toLocalInput = (iso: string | null | undefined) => {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export interface PostEditorInitial extends PostInput {
  id: string | null
  status: 'draft' | 'published'
}

export default function PostEditor({ initial }: { initial: PostEditorInitial }) {
  const router = useRouter()
  const justCreated = useSearchParams().get('saved') === '1'
  const [id, setId] = useState(initial.id)
  const [status, setStatus] = useState(initial.status)
  const [form, setForm] = useState<PostInput>({ ...initial, publishedAt: toLocalInput(initial.publishedAt) })
  const [lang, setLang] = useState<Lang>('en')
  const [slugTouched, setSlugTouched] = useState({ en: Boolean(initial.slugEn), es: Boolean(initial.slugEs) })
  const [dirty, setDirty] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(
    justCreated ? { type: 'ok', text: 'Guardado.' } : null
  )
  const [pending, startTransition] = useTransition()

  // Warn before leaving with unsaved changes
  useEffect(() => {
    if (!dirty) return
    const handler = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  const k = <B extends 'title' | 'slug' | 'excerpt' | 'content' | 'coverAlt'>(base: B, l: Lang = lang) =>
    `${base}${SUFFIX[l]}` as `${B}${'En' | 'Es'}`

  const set = <K extends keyof PostInput>(key: K, value: PostInput[K]) => {
    setDirty(true)
    setMessage(null)
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      // Auto-slug from the title of the same language until edited by hand
      for (const l of ['en', 'es'] as const) {
        if (key === k('title', l) && !slugTouched[l]) next[k('slug', l)] = slugify(String(value))
      }
      return next
    })
  }

  const complete = (l: Lang) => Boolean(form[k('title', l)].trim() && form[k('content', l)].trim() && form[k('excerpt', l)].trim())
  const title = form[k('title')]
  const slug = form[k('slug')]
  const excerpt = form[k('excerpt')]
  const path = `${lang === 'es' ? '/es' : ''}/blog/${slug || 'slug'}`
  const words = useMemo(() => form[k('content')].split(/\s+/).filter(Boolean).length, [form, lang]) // eslint-disable-line react-hooks/exhaustive-deps

  const submit = (nextStatus: 'draft' | 'published') =>
    startTransition(async () => {
      const payload: PostInput = {
        ...form,
        publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : '',
      }
      const res = await savePost(id, payload, nextStatus).catch(() => ({ ok: false as const, error: 'Error de conexión con el servidor.' }))
      if (!res.ok) {
        setMessage({ type: 'error', text: res.error })
        return
      }
      setDirty(false)
      setStatus(res.status)
      setMessage({
        type: 'ok',
        text: res.status === 'published' ? 'Publicado. El blog ya está actualizado.' : 'Borrador guardado (no visible en el sitio).',
      })
      if (!id) {
        setId(res.id)
        router.replace(`/admin/posts/${res.id}?saved=1`)
      }
      router.refresh()
    })

  const excerptLen = excerpt.length
  const excerptColor = excerptLen === 0 ? 'var(--text-secondary)' : excerptLen < 70 || excerptLen > 155 ? '#fbbf24' : '#86efac'

  return (
    <div className="flex flex-col gap-6 max-w-[1400px]">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 py-3 -mt-3" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
        <Link href="/admin/posts" className="btn-outline text-xs">
          <ArrowLeft size={14} /> Posts
        </Link>
        <div className="flex rounded-lg overflow-hidden" role="tablist" aria-label="Idioma" style={{ border: '1px solid var(--border)' }}>
          {(['en', 'es'] as const).map((l) => (
            <button
              key={l}
              type="button"
              role="tab"
              aria-selected={lang === l}
              onClick={() => setLang(l)}
              className="px-3 py-1.5 text-xs font-mono flex items-center gap-1.5"
              style={{ background: lang === l ? 'var(--accent)' : 'transparent', color: lang === l ? 'var(--bg)' : 'var(--text-secondary)' }}
            >
              {LABEL[l]} {complete(l) && <Check size={12} />}
            </button>
          ))}
        </div>
        <span
          className="text-xs font-mono px-2 py-1 rounded"
          style={{ background: status === 'published' ? 'rgba(34,197,94,0.15)' : 'rgba(251,191,36,0.15)', color: status === 'published' ? '#86efac' : '#fbbf24' }}
        >
          {status === 'published' ? 'Publicado' : 'Borrador'}
        </span>
        {dirty && <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Cambios sin guardar</span>}

        <div className="flex flex-wrap gap-2 ml-auto">
          {status === 'published' && id && slug && complete(lang) && (
            <a href={path} target="_blank" rel="noreferrer" className="btn-outline text-xs">
              <ExternalLink size={14} /> Ver
            </a>
          )}
          {status === 'published' ? (
            <>
              <button type="button" className="btn-outline text-xs" disabled={pending} onClick={() => submit('draft')}>
                <Undo2 size={14} /> Pasar a borrador
              </button>
              <button type="button" className="btn-accent text-sm" disabled={pending} onClick={() => submit('published')}>
                {pending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Guardar cambios
              </button>
            </>
          ) : (
            <>
              <button type="button" className="btn-outline text-xs" disabled={pending} onClick={() => submit('draft')}>
                <Save size={14} /> Guardar borrador
              </button>
              <button type="button" className="btn-accent text-sm" disabled={pending} onClick={() => submit('published')}>
                {pending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Publicar
              </button>
            </>
          )}
        </div>
      </div>

      {message && (
        <p
          role={message.type === 'error' ? 'alert' : 'status'}
          className="text-sm rounded-lg px-3 py-2"
          style={{
            background: message.type === 'ok' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
            color: message.type === 'ok' ? '#86efac' : '#fca5a5',
          }}
        >
          {message.text}
        </p>
      )}

      <div className="grid xl:grid-cols-[1fr_340px] gap-8">
        {/* Main column: language-specific fields */}
        <div className="flex flex-col gap-5 min-w-0">
          <FieldShell label="Título" htmlFor="post-title" required badge={<span className="admin-lang-badge">{lang.toUpperCase()}</span>}>
            <input
              id="post-title"
              className="admin-input text-lg font-semibold"
              value={title}
              onChange={(e) => set(k('title'), e.target.value)}
              placeholder={lang === 'es' ? 'Cómo conecté sistemas internos con IA usando MCP' : 'How I connected internal systems to AI with MCP'}
            />
          </FieldShell>

          <FieldShell label="Slug (URL)" htmlFor="post-slug" help={`URL: carlosperaza.dev${path}`}>
            <div className="flex items-center gap-2">
              <input
                id="post-slug"
                className="admin-input font-mono"
                value={slug}
                onChange={(e) => {
                  setSlugTouched((s) => ({ ...s, [lang]: true }))
                  set(k('slug'), slugify(e.target.value))
                }}
              />
              <button
                type="button"
                className="btn-outline text-xs whitespace-nowrap"
                onClick={() => {
                  setSlugTouched((s) => ({ ...s, [lang]: false }))
                  set(k('slug'), slugify(title))
                }}
              >
                Desde el título
              </button>
            </div>
            {status === 'published' && slug !== (lang === 'en' ? initial.slugEn : initial.slugEs) && (lang === 'en' ? initial.slugEn : initial.slugEs) && (
              <p className="admin-help" style={{ color: '#fbbf24' }}>
                Cambiaste el slug de un post publicado: la URL anterior redirigirá automáticamente a la nueva.
              </p>
            )}
          </FieldShell>

          <FieldShell
            label="Resumen (meta descripción)"
            htmlFor="post-excerpt"
            help="Lo que Google muestra bajo el título y lo que se ve al compartir. Ideal: 70–155 caracteres."
            badge={<span className="admin-help" style={{ color: excerptColor }}>{excerptLen}/155</span>}
          >
            <textarea id="post-excerpt" className="admin-input" rows={3} value={excerpt} onChange={(e) => set(k('excerpt'), e.target.value)} />
          </FieldShell>

          <FieldShell label="Contenido" htmlFor="post-content" badge={<span className="admin-help">{words} palabras · ~{Math.max(1, Math.round(words / 200))} min</span>}>
            <MarkdownEditor id="post-content" value={form[k('content')]} onChange={(v) => set(k('content'), v)} folder="posts" />
          </FieldShell>
        </div>

        {/* Side column: shared settings + SEO previews */}
        <aside className="flex flex-col gap-5">
          <FieldShell label="Portada (opcional)" help="Se muestra arriba del artículo y en el listado del blog. Al compartir se usa siempre la imagen generada (abajo).">
            <ImageInput
              folder="posts"
              value={form.coverUrl}
              alt={form[k('coverAlt')]}
              onChange={(url) => set('coverUrl', url)}
              onAltChange={(a) => set(k('coverAlt'), a)}
            />
          </FieldShell>

          <FieldShell label="Tags" help="3–5 temas: MCP, AI Agents, .NET, CI/CD…">
            <TagsInput value={form.tags} onChange={(v) => set('tags', v)} />
          </FieldShell>

          <FieldShell label="Fecha de publicación" htmlFor="post-date" help="Vacía = se usa el momento en que publicas. Una fecha futura lo programa.">
            <input id="post-date" type="datetime-local" className="admin-input" value={form.publishedAt} onChange={(e) => set('publishedAt', e.target.value)} />
          </FieldShell>

          {/* Google preview */}
          <div className="flex flex-col gap-2">
            <p className="admin-label">Vista previa en Google</p>
            <div className="rounded-lg p-4" style={{ background: '#fff' }}>
              <p className="text-xs truncate" style={{ color: '#202124' }}>carlosperaza.dev › {lang === 'es' ? 'es › blog' : 'blog'}</p>
              <p className="text-lg leading-snug truncate" style={{ color: '#1a0dab' }}>{title || 'Título del post'} | carlosperaza.dev</p>
              <p className="text-sm leading-snug" style={{ color: '#4d5156' }}>
                {(excerpt || 'El resumen aparecerá aquí.').slice(0, 160)}
                {excerpt.length > 160 ? '…' : ''}
              </p>
            </div>
          </div>

          {/* Social preview (LinkedIn / X / WhatsApp) */}
          <div className="flex flex-col gap-2">
            <p className="admin-label">Vista previa al compartir (LinkedIn)</p>
            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <div className="flex flex-col justify-between p-4" style={{ aspectRatio: '1200 / 630', background: 'linear-gradient(135deg, #0c132b, #1a2440)' }}>
                <span className="text-[10px]" style={{ color: '#E3E3E3' }}>carlosperaza.dev / Blog</span>
                <span className="font-bold leading-tight" style={{ fontSize: 15 }}>{title || 'Título del post'}</span>
                <span className="text-[10px] line-clamp-2" style={{ color: '#b8b8c6' }}>{excerpt}</span>
                <span className="text-[10px]" style={{ color: '#8b8b9a' }}>Carlos Peraza · {form.tags.slice(0, 3).join(' · ')}</span>
              </div>
              <div className="p-3" style={{ background: 'var(--surface-2)' }}>
                <p className="text-sm font-semibold truncate">{title || 'Título del post'}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>carlosperaza.dev</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
