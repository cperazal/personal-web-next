'use client'

import { MotionConfig } from 'framer-motion'
import type { ReactNode } from 'react'

// Respect the visitor's "reduce motion" OS setting: Framer Motion then skips
// movement (transform) animations site-wide.
export default function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
