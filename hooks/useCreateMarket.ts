'use client'
import { useState, useCallback } from 'react'
import { useWriteContract } from 'wagmi'
import { waitForTransactionReceipt } from 'wagmi/actions'   // ← correct import (NOT from 'viem')
import { parseEventLogs } from 'viem'
import { useQueryClient } from '@tanstack/react-query'
import { useAppMode } from '@/contexts/AppModeContext'
import { useDemoStore } from '@/lib/demo-store'
import { wagmiConfig } from '@/lib/wagmi'
import { CONTRACT_ADDRESS } from '@/lib/constants'
import { RITUAL_PREDICT_ABI } from '@/lib/abi'
import { fakeTxHash, sleep, decodeContractError } from '@/lib/utils'
import type { CreateMarketParams } from '@/lib/types'

const INITIAL = {
  isPending:   false,
  isSuccess:   false,
  isError:     false,
  txHash:      undefined as string | undefined,
  newMarketId: undefined as bigint | undefined,
  error:       undefined as string | undefined,
}

export function useCreateMarket() {
  const { mode }               = useAppMode()
  const addMarket              = useDemoStore(s => s.addMarket)
  const queryClient            = useQueryClient()
  const { writeContractAsync } = useWriteContract()
  const [state, setState]      = useState(INITIAL)

  const reset = useCallback(() => setState(INITIAL), [])

  const createMarket = useCallback(async (params: CreateMarketParams) => {
    setState({ ...INITIAL, isPending: true })

    if (mode === 'demo') {
      await sleep(2000)
      const newId = addMarket(params)    // store returns the new market id
      const hash  = fakeTxHash()
      setState({ isPending: false, isSuccess: true, isError: false, txHash: hash, newMarketId: newId, error: undefined })
      return { hash, marketId: newId }
    }

    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi:     RITUAL_PREDICT_ABI,
        functionName: 'createMarket',
        args: [{
          question:            params.question,
          oracleUrl:           params.oracleUrl,
          jsonPath:            params.jsonPath,
          target:              params.target,
          comparator:          params.comparator,
          bettingSeconds:      params.bettingSeconds,
          resolveDelaySeconds: params.resolveDelaySeconds,
        }],
      })
      const receipt = await waitForTransactionReceipt(wagmiConfig, { hash })
      const logs = parseEventLogs({
        abi: RITUAL_PREDICT_ABI,
        eventName: 'MarketCreated',
        logs: receipt.logs,
      })
      const newMarketId = (logs[0]?.args as { marketId?: bigint })?.marketId
      await queryClient.invalidateQueries()
      setState({ isPending: false, isSuccess: true, isError: false, txHash: hash, newMarketId, error: undefined })
      return { hash, marketId: newMarketId }
    } catch (e: unknown) {
      const msg = decodeContractError(e)
      setState({ isPending: false, isSuccess: false, isError: true, txHash: undefined, newMarketId: undefined, error: msg })
      throw e
    }
  }, [mode, addMarket, writeContractAsync, queryClient])

  return { createMarket, ...state, reset }
}
