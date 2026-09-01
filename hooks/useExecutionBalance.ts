'use client'
import { useReadContract } from 'wagmi'
import { useAppMode } from '@/contexts/AppModeContext'
import { useDemoStore } from '@/lib/demo-store'
import { CONTRACT_ADDRESS } from '@/lib/constants'
import { RITUAL_PREDICT_ABI } from '@/lib/abi'

export function useExecutionBalance() {
  const { mode }    = useAppMode()
  const demoBalance = useDemoStore(s => s.executionBalance)

  const result = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: RITUAL_PREDICT_ABI,
    functionName: 'executionBalance',
    query: {
      enabled:         mode === 'live' && !!CONTRACT_ADDRESS,
      refetchInterval: 15_000,
    },
  })

  if (mode === 'demo') return { balance: demoBalance, isLoading: false }
  return { balance: (result.data as bigint | undefined) ?? 0n, isLoading: result.isLoading }
}
