'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Market, UserStakes } from '@/lib/types'
import { MarketStateBadge } from '@/components/markets/MarketStateBadge'
import { ClaimButton } from './ClaimButton'
import { formatRitual } from '@/lib/utils'

interface PositionCardProps {
  market:  Market
  stakes:  UserStakes
  index?:  number
  onClaim?: () => void
}

export function PositionCard({ market, stakes, index = 0, onClaim }: PositionCardProps) {
  const [claimed, setClaimed] = useState(stakes.alreadySettled)

  const isResolved = market.state === 3
  const isInvalid  = market.state === 4
  const isYesWon   = market.outcome === 1
  const userWon    = isResolved && ((isYesWon && stakes.yes > 0n) || (!isYesWon && stakes.no > 0n))

  const handleSuccess = () => {
    setClaimed(true)
    onClaim?.()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      style={{
        background:   'rgba(255,255,255,0.03)',
        border:       `1px solid ${isResolved && userWon && !claimed ? '#6366f130' : isInvalid ? '#f59e0b20' : '#1e2245'}`,
        borderRadius: '16px',
        padding:      '20px',
        display:      'flex',
        flexDirection:'column',
        gap:          '14px',
      }}
    >
      {/* Header: ID + state + question */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <Link href={`/markets/${market.id}`} style={{ textDecoration: 'none', flex: 1 }}>
          <div style={{
            fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 600, color: '#f0f1ff',
            lineHeight: 1.4,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            cursor: 'pointer',
          }}>
            #{market.id.toString()} · {market.question}
          </div>
        </Link>
        <MarketStateBadge state={market.state} />
      </div>

      {/* Stakes row */}
      <div style={{ display: 'flex', gap: '20px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#454878', marginBottom: '2px' }}>MY YES</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: '#3b82f6' }}>
            {formatRitual(stakes.yes, 4)} RITUAL
          </div>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#454878', marginBottom: '2px' }}>MY NO</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: '#f43f5e' }}>
            {formatRitual(stakes.no, 4)} RITUAL
          </div>
        </div>
      </div>

      {/* Settled outcome */}
      {isResolved && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700,
              color: isYesWon ? '#3b82f6' : '#f43f5e',
              padding: '3px 10px', borderRadius: '999px',
              border: `1px solid ${isYesWon ? '#3b82f640' : '#f43f5e40'}`,
              background: isYesWon ? '#3b82f610' : '#f43f5e10',
            }}>
              {isYesWon ? 'YES WON ✓' : 'NO WON ✗'}
            </span>
          </div>
          {claimed ? (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#454878', padding: '3px 10px', borderRadius: '999px', border: '1px solid #1e2245' }}>
              ✓ Claimed
            </span>
          ) : userWon ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#454878' }}>Claimable</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', color: '#6366f1', fontWeight: 700 }}>
                  {formatRitual(stakes.claimable, 4)} RITUAL
                </div>
              </div>
              <ClaimButton marketId={market.id} type="winnings" onSuccess={handleSuccess} />
            </div>
          ) : (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#454878' }}>
              Lost — 0 RITUAL claimable
            </span>
          )}
        </div>
      )}

      {/* Void refund */}
      {isInvalid && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {claimed ? (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#454878', padding: '3px 10px', borderRadius: '999px', border: '1px solid #1e2245' }}>
              ✓ Claimed
            </span>
          ) : (
            <>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#f59e0b' }}>Refundable</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', color: '#f59e0b', fontWeight: 700 }}>
                  {formatRitual(stakes.claimable, 4)} RITUAL
                </div>
              </div>
              <ClaimButton marketId={market.id} type="refund" onSuccess={handleSuccess} />
            </>
          )}
        </div>
      )}
    </motion.div>
  )
}
