import Image from 'next/image'
import Link from 'next/link'
import type { PostSummary } from '@/lib/data/blog'
import { BLOG_COPY, formatDate } from '@/lib/blog-copy'
import { localePath } from '@/lib/i18n'

export default function PostCard({ post, priority = false }: { post: PostSummary; priority?: boolean }) {
  const t = BLOG_COPY[post.lang]
  const href = localePath(post.lang, `/blog/${post.slug}`)
  return (
    <article className="glass-card overflow-hidden flex flex-col h-full">
      {post.coverUrl && (
        <Link href={href} className="relative block" style={{ aspectRatio: '1200 / 630' }} tabIndex={-1} aria-hidden>
          <Image
            src={post.coverUrl}
            alt={post.coverAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 384px"
            priority={priority}
          />
        </Link>
      )}
      <div className="flex flex-col flex-1" style={{ padding: '1.5rem', gap: '0.75rem' }}>
        <p className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, post.lang)}</time> · {t.minRead(post.readingTime)}
        </p>
        <h2 className="text-lg font-semibold leading-snug">
          <Link href={href} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
            {post.title}
          </Link>
        </h2>
        {post.excerpt && (
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {post.excerpt}
          </p>
        )}
        {post.tags.length > 0 && (
          <ul className="flex flex-wrap gap-2" style={{ marginTop: 'auto' }}>
            {post.tags.map((tag) => (
              <li key={tag} className="tech-chip">{tag}</li>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}
