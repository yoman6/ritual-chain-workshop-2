'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { PositionCard } from '@/components/positions/PositionCard'
import { GlowButton } from '@/components/ui/GlowButton'
import { useMarkets } from '@/hooks/useMarkets'
import { useStakes } from '@/hooks/useStakes'
import { useAppMode } from '@/contexts/AppModeContext'
import { useDemoStore } from '@/lib/demo-store'
import type { Market, UserStakes } from '@/lib/types'
import { formatRitual } from '@/lib/utils'

// Inner component for live mode — reads stakes per market via hook
function LivePositionRow({ market, index }: { market: Market; index: number }) {
  const { stakes } = useStakes(market.id, market)
  if (!stakes || (stakes.yes === 0n && stakes.no === 0n)) return null
  return <PositionCard market={market} stakes={stakes} index={index} />
}

export default function PositionsPage() {
  const { mode }         = useAppMode()
  const { markets }      = useMarkets()
  const { isConnected }  = useAccount()
  const demoStakes       = useDemoStore(s => s.userStakes)

  const totalClaimable = (() => {
    if (mode !== 'demo') return 0n
    let sum = 0n
    for (const [idStr, s] of Object.entries(demoStakes)) {
      if (!s.settled) {
        const m = markets.find(x => x.id.toString() === idStr)
        if (!m) continue
        if (m.state === 3) {
          const won = (m.outcome === 1 && s.yes > 0n) || (m.outcome === 2 && s.no > 0n)
          if (won) {
            const userStake   = m.outcome === 1 ? s.yes : s.no
            const winningPool = m.outcome === 1 ? m.totalYes : m.totalNo
            const total       = m.totalYes + m.totalNo
            if (winningPool > 0n) sum += (userStake * total) / winningPool
          }
        } else if (m.state === 4) {
          sum += s.yes + s.no
        }
      }
    }
    return sum
  })()

  // Demo: filter markets with user stakes
  const demoPositions = mode === 'demo'
    ? markets.filter(m => {
        const s = demoStakes[m.id.toString()]
        return s && (s.yes > 0n || s.no > 0n)
      })
    : []

  const needsWallet = mode === 'live' && !isConnected

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}
      className="page-enter"
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: 800, color: '#f0f1ff', margin: 0, letterSpacing: '-1px' }}>
          MY PORTFOLIO
        </h1>
        {mode === 'demo' && totalClaimable > 0n && (
          <div style={{ padding: '10px 20px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.18)', borderRadius: '12px' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#454878', marginBottom: '2px' }}>Total Claimable</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 700, color: '#6366f1' }}>
              {formatRitual(totalClaimable, 4)} RITUAL
            </div>
          </div>
        )}
      </div>

      {/* Wallet guard for live mode */}
      {needsWallet && (
        <div style={{ textAlign: 'center', padding: '80px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '48px' }}>🔗</div>
          <h2 style={{ fontFamily: 'var(--font-heading)', color: '#f0f1ff', margin: 0 }}>Connect your wallet</h2>
          <p style={{ fontFamily: 'var(--font-body)', color: '#9196c0' }}>Connect your wallet to see your on-chain positions.</p>
        </div>
      )}

      {/* Demo positions */}
      {mode === 'demo' && (
        <>
          {demoPositions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '64px', opacity: 0.4 }}>📊</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', color: '#454878' }}>No positions yet</div>
              <Link href="/markets"><GlowButton>Browse Signals →</GlowButton></Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {demoPositions.map((m, i) => {
                const s   = demoStakes[m.id.toString()]!
                let claimable = 0n
                if (!s.settled) {
                  if (m.state === 3) {
                    const userStake   = m.outcome === 1 ? s.yes : s.no
                    const winningPool = m.outcome === 1 ? m.totalYes : m.totalNo
                    const total       = m.totalYes + m.totalNo
                    claimable = winningPool > 0n ? (userStake * total) / winningPool : 0n
                  } else if (m.state === 4) {
                    claimable = s.yes + s.no
                  }
                }
                const stakes: UserStakes = { yes: s.yes, no: s.no, alreadySettled: s.settled, claimable }
                return <PositionCard key={m.id.toString()} market={m} stakes={stakes} index={i} />
              })}
            </div>
          )}
        </>
      )}

      {/* Live positions */}
      {mode === 'live' && isConnected && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {markets.map((m, i) => (
            <LivePositionRow key={m.id.toString()} market={m} index={i} />
          ))}
          {markets.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '64px', opacity: 0.4 }}>📊</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', color: '#454878' }}>No positions yet</div>
              <Link href="/markets"><GlowButton>Browse Signals →</GlowButton></Link>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
