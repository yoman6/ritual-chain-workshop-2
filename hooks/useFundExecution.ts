'use client'
import { useState, useCallback } from 'react'
import { useWriteContract } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import { useAppMode } from '@/contexts/AppModeContext'
import { useDemoStore } from '@/lib/demo-store'
import { CONTRACT_ADDRESS, DEFAULT_LOCK_BLOCKS } from '@/lib/constants'
import { RITUAL_PREDICT_ABI } from '@/lib/abi'
import { fakeTxHash, sleep, decodeContractError } from '@/lib/utils'

const INITIAL = {
  isPending: false, isSuccess: false, isError: false,
  txHash: undefined as string | undefined,
  error:  undefined as string | undefined,
}

export function useFundExecution() {
  const { mode }               = useAppMode()
  const fundExecution          = useDemoStore(s => s.fundExecution)
  const queryClient            = useQueryClient()
  const { writeContractAsync } = useWriteContract()
  const [state, setState]      = useState(INITIAL)

  const reset = useCallback(() => setState(INITIAL), [])

  const fund = useCallback(async (
    amount: bigint,
    lockDurationBlocks: bigint = DEFAULT_LOCK_BLOCKS,
  ) => {
    setState({ ...INITIAL, isPending: true })
    if (mode === 'demo') {
      await sleep(2000)
      fundExecution(amount)
      const hash = fakeTxHash()
      setState({ isPending: false, isSuccess: true, isError: false, txHash: hash, error: undefined })
      return hash
    }
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS, abi: RITUAL_PREDICT_ABI,
        functionName: 'fundExecution', args: [lockDurationBlocks], value: amount,
      })
      await queryClient.invalidateQueries()
      setState({ isPending: false, isSuccess: true, isError: false, txHash: hash, error: undefined })
      return hash
    } catch (e: unknown) {
      const msg = decodeContractError(e)
      setState({ isPending: false, isSuccess: false, isError: true, txHash: undefined, error: msg })
      throw e
    }
  }, [mode, fundExecution, writeContractAsync, queryClient])

  return { fund, ...state, reset }
}
