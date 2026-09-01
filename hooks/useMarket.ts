'use client'
import { useReadContract } from 'wagmi'
import { useAppMode } from '@/contexts/AppModeContext'
import { useDemoStore } from '@/lib/demo-store'
import { CONTRACT_ADDRESS } from '@/lib/constants'
import { RITUAL_PREDICT_ABI } from '@/lib/abi'
import type { Market } from '@/lib/types'

export function useMarket(id: string | number) {
  const { mode } = useAppMode()
  const demoMarkets = useDemoStore(s => s.markets)

  const liveResult = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: RITUAL_PREDICT_ABI,
    functionName: 'getMarket',
    args: [BigInt(id)],
    query: {
      enabled:         mode === 'live' && !!CONTRACT_ADDRESS && !!id,
      refetchInterval: 5_000,
    },
  })

  if (mode === 'demo') {
    const market = demoMarkets.find(m => m.id === BigInt(id))
    return {
      market:    market ?? undefined,
      isLoading: false,
      isError:   !market,
      error:     market ? null : new Error(`Market #${id} not found`),
      refetch:   () => {},
    }
  }

  return {
    market:    liveResult.data as Market | undefined,
    isLoading: liveResult.isLoading,
    isError:   liveResult.isError,
    error:     liveResult.error,
    refetch:   liveResult.refetch,
  }
}
