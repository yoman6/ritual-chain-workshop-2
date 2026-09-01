'use client'
import { motion } from 'framer-motion'
import { Spinner } from './Spinner'

type Variant = 'primary' | 'outline' | 'danger' | 'warning' | 'ghost'

interface GlowButtonProps {
  variant?:   Variant
  size?:      'sm' | 'md' | 'lg'
  loading?:   boolean
  disabled?:  boolean
  onClick?:   () => void
  children:   React.ReactNode
  fullWidth?: boolean
  type?:      'button' | 'submit'
  style?:     React.CSSProperties
}

const STYLES: Record<Variant, React.CSSProperties> = {
  primary: { background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', fontWeight: 700, border: 'none' },
  outline: { background: 'transparent', color: '#6366f1', border: '1px solid #6366f1' },
  danger:  { background: 'linear-gradient(135deg, #f43f5e, #e11d48)', color: '#fff', border: 'none' },
  warning: { background: 'transparent', color: '#f59e0b', border: '1px solid #f59e0b' },
  ghost:   { background: 'transparent', color: '#9196c0', border: 'none' },
}

const SIZES: Record<string, React.CSSProperties> = {
  sm: { padding: '8px 16px',  fontSize: '13px', borderRadius: '8px' },
  md: { padding: '12px 24px', fontSize: '15px', borderRadius: '12px' },
  lg: { padding: '16px 32px', fontSize: '17px', borderRadius: '14px' },
}

export function GlowButton({
  variant = 'primary', size = 'md', loading = false, disabled = false,
  onClick, children, fullWidth = false, type = 'button', style,
}: GlowButtonProps) {
  const isDisabled = disabled || loading

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.02, boxShadow: variant === 'primary' ? '0 0 30px rgba(99,102,241,0.5)' : undefined } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      style={{
        ...STYLES[variant],
        ...SIZES[size],
        width:       fullWidth ? '100%' : undefined,
        opacity:     isDisabled ? 0.4 : 1,
        cursor:      isDisabled ? 'not-allowed' : 'pointer',
        display:     'inline-flex',
        alignItems:  'center',
        justifyContent: 'center',
        gap:         '8px',
        transition:  'all 200ms',
        fontFamily:  'var(--font-body)',
        fontWeight:  600,
        letterSpacing: '0.03em',
        ...style,
      }}
    >
      {loading && <Spinner size={14} />}
      {children}
    </motion.button>
  )
}
