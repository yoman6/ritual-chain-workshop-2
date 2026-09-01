'use client'
import { useState } from 'react'
import { parseEther } from 'viem'
import { useAccount } from 'wagmi'
import { ExternalLink } from 'lucide-react'
import type { Market } from '@/lib/types'
import { GlowButton } from '@/components/ui/GlowButton'
import { GlowCard } from '@/components/ui/GlowCard'
import { Confetti } from '@/components/ui/Confetti'
import { useToast } from '@/components/ui/Toast'
import { useBet } from '@/hooks/useBet'
import { useAppMode } from '@/contexts/AppModeContext'
import { previewPayout, formatRitual, explorerTx } from '@/lib/utils'

interface BettingPanelProps {
  market: Market
}

export function BettingPanel({ market }: BettingPanelProps) {
  const { mode }                      = useAppMode()
  const { isConnected }               = useAccount()
  const { placeBet, isPending, reset } = useBet()
  const { toast }                     = useToast()

  const [isYes, setIsYes]       = useState(true)
  const [amountStr, setAmountStr] = useState('')
  const [confetti, setConfetti]  = useState(false)
  const [lastHash, setLastHash]  = useState<string>()

  const canBet = market.state === 0
  const amount = amountStr ? (() => { try { return parseEther(amountStr) } catch { return 0n } })() : 0n

  const payout = amount > 0n
    ? previewPayout(amount, market.totalYes, market.totalNo, isYes)
    : 0n

  const otherSideEmpty = isYes
    ? market.totalNo === 0n
    : market.totalYes === 0n

  const needsWallet = mode === 'live' && !isConnected

  const handleBet = async () => {
    if (amount === 0n) return
    try {
      const hash = await placeBet(market.id, isYes, amount)
      if (hash) {
        setLastHash(hash as string)
        setConfetti(true)
        setTimeout(() => setConfetti(false), 100)
        toast.success(`✓ Stake placed — ${amountStr} RITUAL on ${isYes ? 'YES' : 'NO'}`, { txHash: hash as string })
        setAmountStr('')
        reset()
      }
    } catch {
      // error already in state via hook
    }
  }

  const borderColor = isYes ? '#3b82f640' : '#f43f5e40'

  return (
    <GlowCard style={{ border: `1px solid ${borderColor}`, transition: 'border-color 300ms' }}>
      <Confetti trigger={confetti} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '16px', color: '#f0f1ff' }}>
          Place Your Stake
        </div>

        {/* YES / NO toggle */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {([true, false] as const).map(side => (
            <button
              key={String(side)}
              onClick={() => setIsYes(side)}
              style={{
                flex: 1, padding: '10px', borderRadius: '10px',
                border: `1px solid ${side ? '#3b82f6' : '#f43f5e'}${isYes === side ? 'ff' : '30'}`,
                background: isYes === side
                  ? (side ? '#3b82f620' : '#f43f5e20')
                  : 'transparent',
                color: side ? '#3b82f6' : '#f43f5e',
                fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '15px',
                cursor: 'pointer', transition: 'all 200ms',
              }}
            >
              {side ? 'YES' : 'NO'}
            </button>
          ))}
        </div>

        {/* Amount input */}
        <div style={{ position: 'relative' }}>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amountStr}
            onChange={e => setAmountStr(e.target.value)}
            placeholder="0.00"
            disabled={!canBet}
            style={{
              width: '100%', padding: '12px 70px 12px 16px',
              background: '#08091a', border: '1px solid #1e2245', borderRadius: '10px',
              color: '#f0f1ff', fontFamily: 'var(--font-mono)', fontSize: '16px',
              outline: 'none', boxSizing: 'border-box',
            }}
          />
          <span style={{
            position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
            fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#454878',
          }}>
            RITUAL
          </span>
        </div>

        {/* Payout preview */}
        {payout > 0n && (
          <div style={{
            padding: '10px 14px', background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.12)',
            borderRadius: '8px', fontFamily: 'var(--font-body)', fontSize: '13px', color: '#9196c0',
          }}>
            If <strong style={{ color: isYes ? '#3b82f6' : '#f43f5e' }}>{isYes ? 'YES' : 'NO'}</strong> wins:{' '}
            <strong style={{ color: '#6366f1', fontFamily: 'var(--font-mono)' }}>
              ~{formatRitual(payout, 4)} RITUAL
            </strong>
          </div>
        )}

        {/* Other side empty warning */}
        {otherSideEmpty && amount > 0n && (
          <div style={{
            padding: '8px 12px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: '8px', fontFamily: 'var(--font-body)', fontSize: '12px', color: '#f59e0b',
          }}>
            ⚠ No one on the other side yet — you would take the entire pool if you win.
          </div>
        )}

        {/* Market closed message */}
        {!canBet && (
          <div style={{
            padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid #1e2245',
            borderRadius: '8px', fontFamily: 'var(--font-body)', fontSize: '13px', color: '#454878',
            textAlign: 'center',
          }}>
            Staking is closed for this signal.
          </div>
        )}

        {/* Bet button */}
        {canBet && (
          <GlowButton
            variant={isYes ? 'primary' : 'danger'}
            fullWidth
            loading={isPending}
            disabled={amount === 0n || needsWallet}
            onClick={handleBet}
          >
            {isPending
              ? (mode === 'demo' ? 'SIMULATING...' : 'CONFIRMING IN WALLET...')
              : needsWallet
              ? 'CONNECT WALLET TO STAKE'
              : `STAKE ${isYes ? 'YES' : 'NO'}${amountStr ? ` — ${amountStr} RITUAL` : ''}`
            }
          </GlowButton>
        )}

        {/* Success hash */}
        {lastHash && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#454878' }}>
            <span>{lastHash.slice(0, 18)}…</span>
            <a href={explorerTx(lastHash)} target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1', display: 'flex' }}>
              View on Explorer <ExternalLink size={11} style={{ marginLeft: '3px' }} />
            </a>
          </div>
        )}
      </div>
    </GlowCard>
  )
}
