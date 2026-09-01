'use client'
import { useState } from 'react'
import { GlowButton } from '@/components/ui/GlowButton'
import { Confetti } from '@/components/ui/Confetti'
import { useToast } from '@/components/ui/Toast'
import { useClaimWinnings } from '@/hooks/useClaimWinnings'
import { useClaimRefund } from '@/hooks/useClaimRefund'
import { explorerTx } from '@/lib/utils'
import { ExternalLink } from 'lucide-react'

interface ClaimButtonProps {
  marketId:  bigint
  type:      'winnings' | 'refund'
  onSuccess?: () => void
}

export function ClaimButton({ marketId, type, onSuccess }: ClaimButtonProps) {
  const { toast }                                          = useToast()
  const { claim,  isPending: claimPending  }               = useClaimWinnings()
  const { refund, isPending: refundPending }               = useClaimRefund()
  const [confetti, setConfetti]                            = useState(false)
  const [txHash,   setTxHash]                              = useState<string>()

  const isPending = type === 'winnings' ? claimPending : refundPending

  const handleClick = async () => {
    try {
      const hash = type === 'winnings'
        ? await claim(marketId)
        : await refund(marketId)

      if (hash) {
        setTxHash(hash as string)
        setConfetti(true)
        setTimeout(() => setConfetti(false), 100)
        toast.success(
          type === 'winnings' ? '🎉 Winnings claimed!' : '✓ Refund claimed!',
          { txHash: hash as string }
        )
        onSuccess?.()
      }
    } catch {
      toast.error(type === 'winnings' ? 'Claim failed' : 'Refund failed')
    }
  }

  return (
    <>
      <Confetti trigger={confetti} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <GlowButton
          variant={type === 'winnings' ? 'primary' : 'warning'}
          loading={isPending}
          onClick={handleClick}
          size="sm"
        >
          {isPending
            ? (type === 'winnings' ? 'CLAIMING...' : 'REFUNDING...')
            : (type === 'winnings' ? 'CLAIM WINNINGS' : 'CLAIM REFUND')
          }
        </GlowButton>
        {txHash && (
          <a
            href={explorerTx(txHash)}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#6366f1', fontSize: '11px', fontFamily: 'var(--font-mono)' }}
          >
            {txHash.slice(0, 14)}… <ExternalLink size={10} />
          </a>
        )}
      </div>
    </>
  )
}
