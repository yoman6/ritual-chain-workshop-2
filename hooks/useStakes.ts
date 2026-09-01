'use client'
import { useReadContract, useAccount } from 'wagmi'
import { useAppMode } from '@/contexts/AppModeContext'
import { useDemoStore } from '@/lib/demo-store'
import { CONTRACT_ADDRESS } from '@/lib/constants'
import { RITUAL_PREDICT_ABI } from '@/lib/abi'
import type { UserStakes, Market } from '@/lib/types'

export function useStakes(marketId: bigint, market?: Market) {
  const { mode }    = useAppMode()
  const { address } = useAccount()
  const demoStakes  = useDemoStore(s => s.userStakes)

  const liveResult = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: RITUAL_PREDICT_ABI,
    functionName: 'stakesOf',
    args: [marketId, address!],
    query: {
      enabled:         mode === 'live' && !!CONTRACT_ADDRESS && !!address,
      refetchInterval: 5_000,
    },
  })

  if (mode === 'demo') {
    const d = demoStakes[marketId.toString()] ?? { yes: 0n, no: 0n, settled: false }
    let claimable = 0n
    if (market && !d.settled) {
      if (market.state === 3) {        // Resolved — mirrors contract _payout formula exactly
        const isYes      = market.outcome === 1
        const userStake  = isYes ? d.yes : d.no
        const winningPool = isYes ? market.totalYes : market.totalNo
        const totalPool   = market.totalYes + market.totalNo
        // Direct formula: stake × totalPool ÷ winningPool
        // (totalYes/totalNo already include this stake — do NOT add it again)
        claimable = winningPool > 0n ? (userStake * totalPool) / winningPool : 0n
      } else if (market.state === 4) { // Invalid — full stake refundable
        claimable = d.yes + d.no
      }
    }
    return {
      stakes: {
        yes: d.yes, no: d.no, alreadySettled: d.settled, claimable,
      } as UserStakes,
      isLoading: false,
    }
  }

  // Live mode: viem returns named outputs as an object: { yes, no, alreadySettled, claimable }
  // The contract's stakesOf() returns the correct claimable via _payout() — trust it directly.
  const data = liveResult.data as { yes: bigint; no: bigint; alreadySettled: boolean; claimable: bigint } | undefined
  return {
    stakes: data
      ? { yes: data.yes, no: data.no, alreadySettled: data.alreadySettled, claimable: data.claimable } as UserStakes
      : undefined,
    isLoading: liveResult.isLoading,
  }
}
