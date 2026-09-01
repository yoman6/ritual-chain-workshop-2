'use client'
import type { MarketState } from '@/lib/types'

interface MarketStateBadgeProps { state: MarketState; large?: boolean }

const CONFIG = {
  0: { label: 'LIVE',     color: '#6366f1', icon: '●' },
  1: { label: 'LOCKED',   color: '#f59e0b', icon: '◐' },
  2: { label: 'SETTLING', color: '#f97316', icon: '◌', spin: true },
  3: { label: 'SETTLED',  color: '#6366f1', icon: '✓' },
  4: { label: 'VOID',     color: '#666680', icon: '✕' },
} as const

export function MarketStateBadge({ state, large = false }: MarketStateBadgeProps) {
  const cfg = CONFIG[state]
  return (
    <span style={{
      background:   `${cfg.color}18`,
      border:       `1px solid ${cfg.color}40`,
      color:        cfg.color,
      borderRadius: '999px',
      padding:      large ? '6px 14px' : '3px 10px',
      fontSize:     large ? '13px' : '11px',
      fontFamily:   'var(--font-mono)',
      display:      'inline-flex',
      alignItems:   'center',
      gap:          '5px',
      fontWeight:   600,
      letterSpacing: '0.05em',
    }}>
      <span style={'spin' in cfg && cfg.spin ? { display: 'inline-block', animation: 'spin 1s linear infinite' } : {}}>
        {cfg.icon}
      </span>
      {cfg.label}
    </span>
  )
}
