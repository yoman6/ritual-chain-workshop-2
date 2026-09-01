'use client'
import { useReadContract } from 'wagmi'
import { useAppMode } from '@/contexts/AppModeContext'
import { CONTRACT_ADDRESS, DEMO_BLOCK_TIME_MS } from '@/lib/constants'
import { RITUAL_PREDICT_ABI } from '@/lib/abi'

export function useBlockTime(): bigint {
  const { mode } = useAppMode()

  const result = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: RITUAL_PREDICT_ABI,
    functionName: 'blockTimeMs',
    query: { enabled: mode === 'live' && !!CONTRACT_ADDRESS },
  })

  if (mode === 'demo') return DEMO_BLOCK_TIME_MS
  return (result.data as bigint | undefined) ?? DEMO_BLOCK_TIME_MS
}
