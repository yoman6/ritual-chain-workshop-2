'use client'
import { execBalanceHealth, formatRitual } from '@/lib/utils'

export function HealthBadge({ balance }: { balance: bigint }) {
  const level = execBalanceHealth(balance)
  const config = {
    healthy:  { color: '#6366f1', label: 'Healthy',                         anim: undefined },
    warning:  { color: '#f59e0b', label: 'Low — top up soon',               anim: 'accentPulse 2s ease-in-out infinite' },
    critical: { color: '#f43f5e', label: 'Critical — resolutions may fail', anim: 'pulseRed 0.8s ease-in-out infinite' },
  }[level]

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      fontFamily: 'var(--font-body)', fontSize: '13px', color: config.color,
    }}>
      <span style={{
        width: '8px', height: '8px', borderRadius: '50%',
        background: config.color, display: 'inline-block',
        animation: config.anim,
      }} />
      {config.label} ({formatRitual(balance, 4)} RITUAL)
    </span>
  )
}
