'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface TimelineItemProps {
  children: ReactNode
  isLast?: boolean
  delay?: number
}

export function TimelineItem({ children, isLast = false, delay = 0 }: TimelineItemProps) {
  return (
    <motion.div
      className="relative pl-8"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Vertical line */}
      {!isLast && (
        <span
          className="absolute left-[7px] top-5 bottom-0 w-px"
          style={{ background: 'linear-gradient(to bottom, var(--border-accent), var(--border))' }}
        />
      )}
      {/* Dot */}
      <span
        className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 z-10"
        style={{
          background: 'var(--bg)',
          borderColor: 'var(--accent)',
          boxShadow: '0 0 8px var(--glow)',
        }}
      />
      {children}
    </motion.div>
  )
}

interface TimelineProps {
  children: ReactNode
  className?: string
}

export default function Timeline({ children, className = '' }: TimelineProps) {
  return (
    <div className={`flex flex-col gap-8 ${className}`}>
      {children}
    </div>
  )
}
