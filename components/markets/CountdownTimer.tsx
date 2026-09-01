'use client'
import { useCurrentBlock } from '@/hooks/useCurrentBlock'
import { blockCountdown } from '@/lib/utils'

interface CountdownTimerProps {
  targetBlock:  bigint
  blockTimeMs:  bigint
  label:        string
}

export function CountdownTimer({ targetBlock, blockTimeMs, label }: CountdownTimerProps) {
  const currentBlock = useCurrentBlock()
  const blocksLeft   = targetBlock > currentBlock ? targetBlock - currentBlock : 0n

  const text     = blockCountdown(targetBlock, currentBlock, blockTimeMs)
  const urgent   = blocksLeft > 0n && blocksLeft <= 300n
  const critical = blocksLeft > 0n && blocksLeft <= 50n

  const color = critical ? '#ff3366' : urgent ? '#ffaa00' : '#a0a0a0'
  const anim  = critical
    ? 'pulseRed 0.8s ease-in-out infinite'
    : urgent
    ? 'pulseAmber 1.2s ease-in-out infinite'
    : undefined

  return (
    <span
      title={`Block #${targetBlock.toLocaleString()} — ${blocksLeft.toLocaleString()} blocks remaining`}
      style={{
        fontFamily: 'var(--font-mono)', fontSize: '13px', color,
        animation: anim,
        cursor: 'help',
      }}
    >
      ⏱ {label}: {text}
    </span>
  )
}
