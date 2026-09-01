'use client'
import { motion } from 'framer-motion'
import { yesPercent } from '@/lib/utils'

interface OddsBarProps {
  totalYes:    bigint
  totalNo:     bigint
  height?:     number
  showLabels?: boolean
}

export function OddsBar({ totalYes, totalNo, height = 12, showLabels = true }: OddsBarProps) {
  const pct   = yesPercent(totalYes, totalNo)
  const empty = totalYes === 0n && totalNo === 0n

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{
        display: 'flex', borderRadius: '999px', overflow: 'hidden',
        height, background: '#1e2245',
      }}>
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          style={{ background: empty ? '#2d3270' : '#3b82f6', height: '100%', minWidth: 0 }}
        />
        <motion.div
          animate={{ width: `${100 - pct}%` }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          style={{ background: empty ? '#2d3270' : '#f43f5e', height: '100%', minWidth: 0 }}
        />
      </div>
      {showLabels && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: '#3b82f6' }}>{pct >= 5 ? `YES ${pct.toFixed(1)}%` : ''}</span>
          <span style={{ color: '#f43f5e' }}>{(100 - pct) >= 5 ? `NO ${(100 - pct).toFixed(1)}%` : ''}</span>
        </div>
      )}
    </div>
  )
}
