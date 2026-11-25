'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ADMIN_SECTIONS } from '@/lib/admin/sections'

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Admin" className="flex md:flex-col gap-1 overflow-x-auto">
      {ADMIN_SECTIONS.map(({ href, label }) => {
        const active = href === '/admin' ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className="px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors"
            style={{
              color: active ? 'var(--accent)' : 'var(--text-secondary)',
              background: active ? 'var(--bg-card)' : 'transparent',
              textDecoration: 'none',
            }}
            aria-current={active ? 'page' : undefined}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
