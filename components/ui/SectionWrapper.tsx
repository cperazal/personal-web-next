'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import type { ReactNode } from 'react'

interface SectionWrapperProps {
  id: string
  children: ReactNode
  className?: string
  delay?: number
}

export default function SectionWrapper({
  id,
  children,
  className = '',
  delay = 0,
}: SectionWrapperProps) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.07 })

  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      initial={{ opacity: 0, y: 48 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  )
}
