'use client'
import { useEffect, useState } from 'react'
import { useAppMode } from '@/contexts/AppModeContext'

export function DemoBanner() {
  const { mode } = useAppMode()
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('sandbox-banner-dismissed') === '1') {
      setDismissed(true)
    }
  }, [])

  const dismiss = () => {
    setDismissed(true)
    sessionStorage.setItem('sandbox-banner-dismissed', '1')
  }

  if (mode !== 'demo' || dismissed) return null

  return (
    <div style={{
      background: 'rgba(99,102,241,0.05)',
      borderBottom: '1px solid rgba(99,102,241,0.12)',
      padding: '8px 24px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      fontFamily: 'var(--font-body)', fontSize: '13px', color: '#9196c0',
    }}>
      <span>
        <span style={{ color: '#6366f1', fontWeight: 600 }}>SANDBOX</span>
        {' '}— Synthetic data only. No real transactions needed. Explore the full protocol freely.
      </span>
      <button
        onClick={dismiss}
        style={{ color: '#454878', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: '0 4px' }}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  )
}
