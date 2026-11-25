import Image from 'next/image'
import Link from 'next/link'
import { Github, Linkedin } from 'lucide-react'
import type { Author } from '@/lib/data/content'
import { localePath, type Lang } from '@/lib/i18n'

/** Identity signal for readers, Google and AI engines: who wrote this, with profile links */
export default function AuthorBox({ author, lang, title }: { author: Author; lang: Lang; title: string }) {
  const bio = author.bio.length > 260 ? `${author.bio.slice(0, 257).replace(/\s+\S*$/, '')}…` : author.bio
  return (
    <aside className="glass-card flex flex-col sm:flex-row" style={{ padding: '1.5rem', gap: '1.25rem' }} aria-label={title}>
      {author.photoUrl && (
        <Image
          src={author.photoUrl}
          alt={author.name}
          width={72}
          height={72}
          className="rounded-full object-cover shrink-0"
          style={{ width: 72, height: 72 }}
        />
      )}
      <div className="flex flex-col" style={{ gap: '0.5rem' }}>
        <p className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>{title}</p>
        <p className="font-semibold">
          <Link href={localePath(lang, '/')} rel="author" style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
            {author.name}
          </Link>{' '}
          <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>· {author.headline}</span>
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{bio}</p>
        <div className="flex" style={{ gap: '0.75rem', marginTop: '0.25rem' }}>
          {author.linkedin && (
            <a href={author.linkedin} target="_blank" rel="noopener noreferrer me" aria-label="LinkedIn" style={{ color: 'var(--text-secondary)' }}>
              <Linkedin size={18} />
            </a>
          )}
          {author.github && (
            <a href={author.github} target="_blank" rel="noopener noreferrer me" aria-label="GitHub" style={{ color: 'var(--text-secondary)' }}>
              <Github size={18} />
            </a>
          )}
        </div>
      </div>
    </aside>
  )
}
