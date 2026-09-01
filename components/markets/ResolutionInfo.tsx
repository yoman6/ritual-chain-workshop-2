'use client'
import type { Market } from '@/lib/types'
import { COMPARATOR_SYM } from '@/lib/constants'

export function ResolutionInfo({ market }: { market: Market }) {
  const sym = COMPARATOR_SYM[market.comparator]

  if (market.state === 3) {
    // Settled
    const isYes = market.outcome === 1
    const border = isYes ? '#3b82f6' : '#f43f5e'
    const outcomeLabel = isYes ? 'YES ✓' : 'NO ✗'
    const outcomeColor = isYes ? '#3b82f6' : '#f43f5e'

    return (
      <div style={{
        border: `1px solid ${border}30`,
        background: `${border}08`,
        borderRadius: '12px',
        padding: '16px',
        fontFamily: 'var(--font-body)',
      }}>
        <div style={{ fontSize: '13px', color: '#454878', marginBottom: '8px' }}>Oracle Result</div>
        <div style={{ fontSize: '15px', color: '#9196c0', lineHeight: 1.6 }}>
          Oracle returned:{' '}
          <strong style={{ color: '#f0f1ff', fontFamily: 'var(--font-mono)' }}>
            {market.observedValue.toLocaleString()}
          </strong>
          {' '}→ Compared{' '}
          <span style={{ fontFamily: 'var(--font-mono)', color: '#f0f1ff' }}>
            {sym} {market.target.toLocaleString()}
          </span>
          {' '}→{' '}
          <strong style={{ color: outcomeColor, fontSize: '16px' }}>{outcomeLabel}</strong>
        </div>
      </div>
    )
  }

  if (market.state === 4) {
    // Void
    return (
      <div style={{
        border: '1px solid #f43f5e30',
        background: '#f43f5e08',
        borderRadius: '12px',
        padding: '16px',
        fontFamily: 'var(--font-body)',
      }}>
        <div style={{ fontSize: '13px', color: '#f43f5e', marginBottom: '8px', fontWeight: 600 }}>
          ✕ Signal Voided
        </div>
        <div style={{ fontSize: '14px', color: '#9196c0', lineHeight: 1.6 }}>
          {market.invalidReason}
        </div>
        <div style={{ marginTop: '8px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#454878' }}>
          {market.attempts} / 3 settlement attempts failed
        </div>
      </div>
    )
  }

  return null
}
