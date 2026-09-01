'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Copy, Check, ExternalLink, ArrowLeft } from 'lucide-react'
import { useMarket } from '@/hooks/useMarket'
import { useStakes } from '@/hooks/useStakes'
import { useBlockTime } from '@/hooks/useBlockTime'
import { useCurrentBlock } from '@/hooks/useCurrentBlock'
import { useAppMode } from '@/contexts/AppModeContext'
import { MarketStateBadge } from '@/components/markets/MarketStateBadge'
import { OddsBar } from '@/components/markets/OddsBar'
import { BettingPanel } from '@/components/markets/BettingPanel'
import { ResolutionInfo } from '@/components/markets/ResolutionInfo'
import { CountdownTimer } from '@/components/markets/CountdownTimer'
import { ActivityFeed } from '@/components/markets/ActivityFeed'
import { ClaimButton } from '@/components/positions/ClaimButton'
import { GlowCard } from '@/components/ui/GlowCard'
import { GlowButton } from '@/components/ui/GlowButton'
import {
  formatRitual, shortAddr, explorerAddr, explorerTx,
  ruleText, truncateMiddle,
} from '@/lib/utils'
import {
  COMPARATOR_SYM, COMPARATOR_LABELS,
  RETRY_INTERVAL_BLOCKS, MAX_ATTEMPTS
} from '@/lib/constants'

export default function MarketDetailPage() {
  const params       = useParams()
  const { mode }     = useAppMode()
  const id           = params?.id as string
  const blockTimeMs  = useBlockTime()
  const currentBlock = useCurrentBlock()

  const { market, isLoading, isError } = useMarket(id)
  const { stakes }                     = useStakes(BigInt(id ?? 0), market)

  const [copied, setCopied] = useState(false)

  const share = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[200, 80, 48, 100].map((h, i) => <div key={i} className="skeleton" style={{ height: h }} />)}
          </div>
          <div className="skeleton" style={{ height: '280px', borderRadius: '16px' }} />
        </div>
      </div>
    )
  }

  if (isError || !market) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontSize: '48px' }}>🔮</div>
        <h2 style={{ fontFamily: 'var(--font-heading)', color: '#fff' }}>Market #{id} not found</h2>
        <Link href="/markets"><GlowButton variant="outline">← All Markets</GlowButton></Link>
      </div>
    )
  }

  const retryIntervalSec = Number(BigInt(RETRY_INTERVAL_BLOCKS) * blockTimeMs) / 1000

  const hasPosition = stakes && (stakes.yes > 0n || stakes.no > 0n)
  const totalPool   = market.totalYes + market.totalNo

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}
      className="page-enter"
    >
      {/* Back + share */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Link href="/markets" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9196c0', fontFamily: 'var(--font-body)', fontSize: '14px', textDecoration: 'none' }}>
          <ArrowLeft size={16} /> All Signals
        </Link>
        <button
          onClick={share}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', color: copied ? '#6366f1' : '#454878', background: 'none', border: '1px solid #1e2245', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '13px', transition: 'all 200ms' }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'SHARE ↗'}
        </button>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)', gap: '32px' }}>
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* State + attempts */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <MarketStateBadge state={market.state} large />
            {market.state === 2 && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#f97316' }}>
                Attempt {market.attempts}/{MAX_ATTEMPTS}
              </span>
            )}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#2d3270', marginLeft: 'auto' }}>
              #{market.id.toString()}
            </span>
          </div>

          {/* Question */}
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(22px,4vw,32px)', fontWeight: 700, color: '#f0f1ff', margin: 0, lineHeight: 1.3 }}>
            {market.question}
          </h1>

          {/* Odds bar */}
          <OddsBar totalYes={market.totalYes} totalNo={market.totalNo} height={48} showLabels />

          {/* Totals */}
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#454878', marginBottom: '2px' }}>YES POOL</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '22px', fontWeight: 700, color: '#3b82f6' }}>
                {formatRitual(market.totalYes, 4)}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#454878', marginBottom: '2px' }}>NO POOL</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '22px', fontWeight: 700, color: '#f43f5e' }}>
                {formatRitual(market.totalNo, 4)}
              </div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#454878', marginBottom: '2px' }}>TOTAL POOL</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '22px', fontWeight: 700, color: '#6366f1' }}>
                {formatRitual(totalPool, 4)} RITUAL
              </div>
            </div>
          </div>

          {/* Resolution result / invalid reason */}
          <ResolutionInfo market={market} />
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <BettingPanel market={market} />

          {/* My position */}
          {hasPosition && stakes && (
            <GlowCard padding="20px">
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '14px', color: '#454878', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '14px' }}>
                My Position
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1e2245' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#454878' }}>YES stake</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: '#3b82f6' }}>{formatRitual(stakes.yes, 4)} RITUAL</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1e2245' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#454878' }}>NO stake</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: '#f43f5e' }}>{formatRitual(stakes.no, 4)} RITUAL</span>
                </div>
                {(market.state === 3 || market.state === 4) && !stakes.alreadySettled && stakes.claimable > 0n && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#454878' }}>Claimable</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 700, color: '#6366f1' }}>
                        {formatRitual(stakes.claimable, 4)} RITUAL
                      </div>
                    </div>
                    <ClaimButton
                      marketId={market.id}
                      type={market.state === 4 ? 'refund' : 'winnings'}
                    />
                  </div>
                )}
                {stakes.alreadySettled && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#454878', padding: '4px 12px', border: '1px solid #1e2245', borderRadius: '999px', display: 'inline-block', marginTop: '4px' }}>
                    ✓ Claimed
                  </span>
                )}
              </div>
            </GlowCard>
          )}
        </div>
      </div>

      {/* BOTTOM — Resolution Rule */}
      <GlowCard style={{ marginTop: '32px' }} padding="24px">
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, color: '#f0f1ff', margin: '0 0 20px' }}>
          Settlement Rule
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {/* Oracle URL */}
          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#454878', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Oracle URL</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#9196c0', wordBreak: 'break-all' }}>
                {truncateMiddle(market.oracleUrl, 42)}
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(market.oracleUrl)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#454878', flexShrink: 0 }}
              >
                <Copy size={12} />
              </button>
            </div>
          </div>

          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#454878', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>jq Path</div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: '#6366f1' }}>{market.jsonPath}</span>
          </div>

          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#454878', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Target</div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 700, color: '#f0f1ff' }}>{market.target.toLocaleString()}</span>
          </div>

          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#454878', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Comparator</div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: '#f0f1ff' }}>
              {COMPARATOR_SYM[market.comparator]} — {COMPARATOR_LABELS[market.comparator]}
            </span>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ padding: '12px 16px', background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: '8px', fontFamily: 'var(--font-body)', fontSize: '13px', color: '#9196c0' }}>
              📋 {ruleText(market)}
            </div>
          </div>

          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#454878', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Close Block</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#f0f1ff' }}>#{market.closeBlock.toLocaleString()}</div>
            <CountdownTimer targetBlock={market.closeBlock} blockTimeMs={blockTimeMs} label="Closes in" />
          </div>

          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#454878', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Settle Block</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#f0f1ff' }}>#{market.resolveBlock.toLocaleString()}</div>
            <CountdownTimer targetBlock={market.resolveBlock} blockTimeMs={blockTimeMs} label="Settles in" />
          </div>

          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#454878', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Schedule ID</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#9196c0' }}>#{market.scheduleId.toString()}</span>
              <a
                href={`https://explorer.ritualfoundation.org`}
                target="_blank" rel="noopener noreferrer"
                style={{ color: '#454878', display: 'flex' }}
              >
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#454878', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Retry Interval</div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#9196c0' }}>
              {RETRY_INTERVAL_BLOCKS} blocks (~{retryIntervalSec.toFixed(0)}s)
            </span>
          </div>

          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#454878', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Creator</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#9196c0' }}>{shortAddr(market.creator)}</span>
              <a href={explorerAddr(market.creator)} target="_blank" rel="noopener noreferrer" style={{ color: '#454878', display: 'flex' }}>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </GlowCard>

      {/* Activity Feed */}
      <GlowCard style={{ marginTop: '24px' }} padding="24px">
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, color: '#f0f1ff', margin: '0 0 16px' }}>
          Stake Activity
        </h3>
        <ActivityFeed marketId={market.id} />
      </GlowCard>

      {/* Mobile stacking */}
      <style>{`
        @media (max-width: 768px) {
          .market-cols { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </motion.div>
  )
}
