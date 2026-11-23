import { notFound } from 'next/navigation'

// Any unknown path under "/" or "/es" renders app/[lang]/not-found.tsx
export default function CatchAll() {
  notFound()
}
