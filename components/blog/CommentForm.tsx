'use client'

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { Loader2, Send } from 'lucide-react'

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string
      reset: (id?: string) => void
      remove: (id?: string) => void
    }
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

function loadTurnstile(): Promise<void> {
  if (window.turnstile) return Promise.resolve()
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`)
  return new Promise((resolve, reject) => {
    const script = existing ?? document.createElement('script')
    script.addEventListener('load', () => resolve())
    script.addEventListener('error', () => reject(new Error('turnstile')))
    if (!existing) {
      script.src = SCRIPT_SRC
      script.async = true
      document.head.appendChild(script)
    }
  })
}

type Labels = {
  leaveComment: string
  yourName: string
  yourComment: string
  send: string
  sending: string
  moderationNote: string
  thanks: string
  errCaptcha: string
  errRate: string
  errGeneric: string
  errFields: string
}

export default function CommentForm({ postId, lang, labels }: { postId: string; lang: 'en' | 'es'; labels: Labels }) {
  const [name, setName] = useState('')
  const [body, setBody] = useState('')
  const [website, setWebsite] = useState('') // honeypot
  const [token, setToken] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle')
  const [error, setError] = useState<string | null>(null)
  const widgetRef = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string | null>(null)
  const started = useRef(false)

  // Load the captcha only when the visitor starts writing (keeps the article fast)
  const startCaptcha = useCallback(async () => {
    if (started.current) return
    started.current = true
    try {
      await loadTurnstile()
      if (widgetRef.current && window.turnstile && !widgetId.current) {
        widgetId.current = window.turnstile.render(widgetRef.current, {
          sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
          theme: 'dark',
          language: lang,
          callback: (t: string) => setToken(t),
          'expired-callback': () => setToken(''),
          'error-callback': () => setToken(''),
        })
      }
    } catch {
      started.current = false
    }
  }, [lang])

  useEffect(() => () => {
    if (widgetId.current) window.turnstile?.remove(widgetId.current)
  }, [])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (name.trim().length < 2 || body.trim().length < 3) {
      setError(labels.errFields)
      return
    }
    if (!token) {
      startCaptcha()
      setError(labels.errCaptcha)
      return
    }
    setState('sending')
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, lang, name, body, token, website }),
      })
      if (res.ok) {
        setState('done')
        return
      }
      const data = await res.json().catch(() => ({}))
      setError(data.error === 'captcha' ? labels.errCaptcha : data.error === 'rate' ? labels.errRate : labels.errGeneric)
    } catch {
      setError(labels.errGeneric)
    }
    // A token can be used only once
    setToken('')
    if (widgetId.current) window.turnstile?.reset(widgetId.current)
    setState('idle')
  }

  if (state === 'done') {
    return (
      <p role="status" className="glass-card text-sm" style={{ padding: '1.25rem', color: '#86efac' }}>
        {labels.thanks}
      </p>
    )
  }

  const input = {
    width: '100%',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '0.5rem',
    padding: '0.65rem 0.85rem',
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
  } as const

  return (
    <form onSubmit={onSubmit} className="glass-card flex flex-col" style={{ padding: '1.5rem', gap: '1rem' }} noValidate>
      <h3 className="font-semibold">{labels.leaveComment}</h3>
      <label className="flex flex-col" style={{ gap: '0.4rem' }}>
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{labels.yourName}</span>
        <input value={name} onChange={(e) => setName(e.target.value)} onFocus={startCaptcha} maxLength={60} autoComplete="name" required style={input} />
      </label>
      <label className="flex flex-col" style={{ gap: '0.4rem' }}>
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{labels.yourComment}</span>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} onFocus={startCaptcha} rows={4} maxLength={2000} required style={{ ...input, resize: 'vertical' }} />
      </label>
      {/* Honeypot: hidden from people, tempting for bots */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </label>
      </div>
      <div ref={widgetRef} style={{ minHeight: started.current ? 65 : 0 }} />
      {error && <p role="alert" className="text-sm" style={{ color: '#fca5a5' }}>{error}</p>}
      <div className="flex flex-wrap items-center justify-between" style={{ gap: '0.75rem' }}>
        <p className="text-xs" style={{ color: 'var(--text-secondary)', maxWidth: '28rem' }}>{labels.moderationNote}</p>
        <button type="submit" className="btn-accent" disabled={state === 'sending'}>
          {state === 'sending' ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          {state === 'sending' ? labels.sending : labels.send}
        </button>
      </div>
    </form>
  )
}
