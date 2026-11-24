'use client'

import { useEffect, useState } from 'react'
import { Check, Facebook, Link2, Linkedin, MessageCircle, Share2, Twitter } from 'lucide-react'

interface Props {
  url: string
  title: string
  labels: { share: string; copy: string; copied: string }
}

export default function ShareButtons({ url, title, labels }: Props) {
  const [copied, setCopied] = useState(false)
  const [canNativeShare, setCanNativeShare] = useState(false)
  useEffect(() => setCanNativeShare(typeof navigator !== 'undefined' && 'share' in navigator), [])

  const u = encodeURIComponent(url)
  const text = encodeURIComponent(title)
  const links = [
    { name: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, Icon: Linkedin },
    { name: 'X', href: `https://twitter.com/intent/tweet?url=${u}&text=${text}&via=cperazal`, Icon: Twitter },
    { name: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, Icon: Facebook },
    { name: 'WhatsApp', href: `https://wa.me/?text=${text}%20${u}`, Icon: MessageCircle },
  ]

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard blocked: ignore */
    }
  }

  const btn = 'inline-flex items-center justify-center rounded-lg transition-colors'
  const style = { width: 40, height: 40, border: '1px solid var(--border)', color: 'var(--text-secondary)', background: 'var(--bg-card)' }

  return (
    <div className="flex flex-wrap items-center" style={{ gap: '0.5rem' }}>
      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)', marginRight: '0.5rem' }}>
        {labels.share}
      </span>
      {links.map(({ name, href, Icon }) => (
        <a key={name} href={href} target="_blank" rel="noopener noreferrer" aria-label={name} className={btn} style={style}>
          <Icon size={17} />
        </a>
      ))}
      <button type="button" onClick={copy} aria-label={labels.copy} className={btn} style={style}>
        {copied ? <Check size={17} /> : <Link2 size={17} />}
      </button>
      {canNativeShare && (
        <button
          type="button"
          aria-label={labels.share}
          className={`${btn} md:hidden`}
          style={style}
          onClick={() => navigator.share({ title, url }).catch(() => {})}
        >
          <Share2 size={17} />
        </button>
      )}
      <span role="status" className="sr-only">{copied ? labels.copied : ''}</span>
    </div>
  )
}
