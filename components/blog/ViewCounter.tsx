'use client'

import { useEffect, useState } from 'react'
import { Eye } from 'lucide-react'

/** Counts one view per browser session and shows the total */
export default function ViewCounter({ postId, locale }: { postId: string; locale: 'en-US' | 'es-419' }) {
  const [views, setViews] = useState<number | null>(null)

  useEffect(() => {
    const key = `viewed:${postId}`
    let seen = false
    try {
      seen = sessionStorage.getItem(key) === '1'
    } catch {
      /* storage blocked */
    }
    fetch(`/api/views/${postId}`, { method: seen ? 'GET' : 'POST' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (typeof d?.views === 'number') setViews(d.views)
        try {
          sessionStorage.setItem(key, '1')
        } catch {
          /* ignore */
        }
      })
      .catch(() => {})
  }, [postId])

  if (views === null) return null
  const label = locale === 'es-419' ? (views === 1 ? 'vista' : 'vistas') : views === 1 ? 'view' : 'views'
  return (
    <span className="inline-flex items-center" style={{ gap: '0.3rem' }}>
      <Eye size={13} aria-hidden /> {views.toLocaleString(locale)} {label}
    </span>
  )
}
