import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { PostSummary } from '@/lib/data/blog'
import { BLOG_COPY } from '@/lib/blog-copy'
import { localePath, type Lang } from '@/lib/i18n'
import PostCard from '@/components/blog/PostCard'

/** "Latest articles" on the home page: internal links that help the blog rank */
export default function LatestPosts({ posts, lang }: { posts: PostSummary[]; lang: Lang }) {
  if (!posts.length) return null
  const t = BLOG_COPY[lang]
  return (
    <section id="blog" aria-labelledby="latest-posts-heading">
      <div className="container-section">
        <div className="flex flex-wrap items-end justify-between" style={{ gap: '1rem', marginBottom: '2.5rem' }}>
          <div>
            <p className="font-mono text-xs tracking-widest uppercase" style={{ color: 'var(--accent)', marginBottom: '0.5rem' }}>
              Blog
            </p>
            <h2 id="latest-posts-heading" className="section-heading">
              {lang === 'es' ? (<>Últimos <span>artículos</span></>) : (<>Latest <span>articles</span></>)}
            </h2>
          </div>
          <Link href={localePath(lang, '/blog')} className="inline-flex items-center font-mono text-sm" style={{ color: 'var(--accent)', textDecoration: 'none', gap: '0.4rem' }}>
            {t.allPosts} <ArrowRight size={15} />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3" style={{ gap: '1.5rem' }}>
          {posts.slice(0, 3).map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      </div>
    </section>
  )
}
