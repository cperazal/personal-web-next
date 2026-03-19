'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

interface SkillBarProps {
  name: string
  level: number
  iconUrl?: string
  delay?: number
}

export default function SkillBar({ name, level, iconUrl, delay = 0 }: SkillBarProps) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 })

  return (
    <div ref={ref} className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {iconUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={iconUrl}
              alt={name}
              className="w-5 h-5 object-contain flex-shrink-0"
              loading="lazy"
            />
          )}
          <span
            className="text-sm font-medium truncate"
            style={{ color: 'var(--text-primary)' }}
          >
            {name}
          </span>
        </div>
        <span
          className="text-xs font-mono flex-shrink-0"
          style={{ color: 'var(--accent)' }}
        >
          {level}%
        </span>
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: 'var(--border)' }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'var(--accent)' }}
          initial={{ width: 0 }}
          animate={inView ? { width: `${level}%` } : { width: 0 }}
          transition={{ duration: 1.1, delay: delay + 0.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  )
}
