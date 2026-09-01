'use client'
import { useState, useCallback } from 'react'
import { useWriteContract } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import { useAppMode } from '@/contexts/AppModeContext'
import { useDemoStore } from '@/lib/demo-store'
import { CONTRACT_ADDRESS } from '@/lib/constants'
import { RITUAL_PREDICT_ABI } from '@/lib/abi'
import { fakeTxHash, sleep, decodeContractError } from '@/lib/utils'

const INITIAL = {
  isPending: false, isSuccess: false, isError: false,
  txHash: undefined as string | undefined,
  error:  undefined as string | undefined,
}

export function useClaimRefund() {
  const { mode }               = useAppMode()
  const claimRefund            = useDemoStore(s => s.claimRefund)
  const queryClient            = useQueryClient()
  const { writeContractAsync } = useWriteContract()
  const [state, setState]      = useState(INITIAL)

  const reset = useCallback(() => setState(INITIAL), [])

  const refund = useCallback(async (marketId: bigint) => {
    setState({ ...INITIAL, isPending: true })
    if (mode === 'demo') {
      await sleep(2000)
      claimRefund(marketId)
      const hash = fakeTxHash()
      setState({ isPending: false, isSuccess: true, isError: false, txHash: hash, error: undefined })
      return hash
    }
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS, abi: RITUAL_PREDICT_ABI,
        functionName: 'claimRefund', args: [marketId],
      })
      await queryClient.invalidateQueries()
      setState({ isPending: false, isSuccess: true, isError: false, txHash: hash, error: undefined })
      return hash
    } catch (e: unknown) {
      const msg = decodeContractError(e)
      setState({ isPending: false, isSuccess: false, isError: true, txHash: undefined, error: msg })
      throw e
    }
  }, [mode, claimRefund, writeContractAsync, queryClient])

  return { refund, ...state, reset }
}
