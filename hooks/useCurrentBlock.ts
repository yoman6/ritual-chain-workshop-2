'use client'
import { useBlockNumber } from 'wagmi'
import { useAppMode } from '@/contexts/AppModeContext'
import { ritualChain } from '@/lib/chains'
import { DEMO_CURRENT_BLOCK } from '@/lib/constants'

export function useCurrentBlock(): bigint {
  const { mode } = useAppMode()

  // ⚠ Use refetchInterval — NOT watch: true (deprecated in wagmi v2)
  const result = useBlockNumber({
    chainId: ritualChain.id,
    query: {
      enabled:         mode === 'live',
      refetchInterval: mode === 'live' ? 2_000 : false,
    },
  })

  if (mode === 'demo') return DEMO_CURRENT_BLOCK
  return result.data ?? DEMO_CURRENT_BLOCK
}
