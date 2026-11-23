import type { ReactNode } from 'react'

interface SectionWrapperProps {
  id: string
  children: ReactNode
  className?: string
}

// Plain <section>: the content inside each section already has its own
// entrance animations, so the section itself is never hidden. This keeps
// the text visible in the initial HTML (better LCP and no-JS fallback).
export default function SectionWrapper({ id, children, className = '' }: SectionWrapperProps) {
  return (
    <section id={id} className={className}>
      {children}
    </section>
  )
}
