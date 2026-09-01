'use client'
import { motion } from 'framer-motion'

interface GlowCardProps {
  children:   React.ReactNode
  glowColor?: '#6366f1' | '#f43f5e' | '#f59e0b' | 'none'
  className?: string
  onClick?:   () => void
  hoverable?: boolean
  padding?:   string
  style?:     React.CSSProperties
}

export function GlowCard({
  children,
  glowColor = '#6366f1',
  className = '',
  onClick,
  hoverable = false,
  padding = '24px',
  style,
}: GlowCardProps) {
  const glowShadow = glowColor !== 'none' ? `0 0 30px ${glowColor}20` : undefined

  return (
    <motion.div
      onClick={onClick}
      whileHover={hoverable ? {
        scale: 1.01,
        y: -2,
        boxShadow: glowShadow,
        borderColor: '#2d3270',
      } : {}}
      style={{
        background:     'rgba(255,255,255,0.03)',
        border:         '1px solid #1e2245',
        borderRadius:   '16px',
        backdropFilter: 'blur(20px)',
        padding,
        cursor:     onClick ? 'pointer' : 'default',
        transition: 'all 200ms',
        ...style,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
