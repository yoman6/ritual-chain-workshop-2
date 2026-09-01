'use client'
import { useReadContract } from 'wagmi'
import { useAppMode } from '@/contexts/AppModeContext'
import { useDemoStore } from '@/lib/demo-store'
import { CONTRACT_ADDRESS } from '@/lib/constants'
import { RITUAL_PREDICT_ABI } from '@/lib/abi'
import type { Market } from '@/lib/types'

export function useMarkets() {
  const { mode } = useAppMode()
  const demoMarkets = useDemoStore(s => s.markets)

  const liveResult = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: RITUAL_PREDICT_ABI,
    functionName: 'getMarkets',
    query: {
      enabled:         mode === 'live' && !!CONTRACT_ADDRESS,
      refetchInterval: 10_000,
    },
  })

  if (mode === 'demo') {
    return { markets: demoMarkets, isLoading: false, isError: false, error: null, refetch: () => {} }
  }

  return {
    markets:   (liveResult.data as Market[] | undefined) ?? [],
    isLoading: liveResult.isLoading,
    isError:   liveResult.isError,
    error:     liveResult.error,
    refetch:   liveResult.refetch,
  }
}
