import { create } from 'zustand'
import { DEMO_MARKETS, DEMO_USER_STAKES, DEMO_EXECUTION_BALANCE } from './demo-data'
import { DEMO_BLOCK_TIME_MS } from './constants'
import type { Market, CreateMarketParams } from './types'

interface DemoStoreState {
  markets:          Market[]
  userStakes:       Record<string, { yes: bigint; no: bigint; settled: boolean }>
  executionBalance: bigint
  addBet:           (marketId: bigint, isYes: boolean, amount: bigint) => void
  addMarket:        (params: CreateMarketParams) => bigint   // returns new market id
  claimWinnings:    (marketId: bigint) => void
  claimRefund:      (marketId: bigint) => void
  fundExecution:    (amount: bigint) => void
  resetDemo:        () => void
}

export const useDemoStore = create<DemoStoreState>((set, get) => ({
  markets:          [...DEMO_MARKETS],
  userStakes:       { ...DEMO_USER_STAKES },
  executionBalance: DEMO_EXECUTION_BALANCE,

  addBet: (marketId, isYes, amount) => set(state => {
    const idStr = marketId.toString()
    const markets = state.markets.map(m => {
      if (m.id !== marketId) return m
      return {
        ...m,
        totalYes: isYes ? m.totalYes + amount : m.totalYes,
        totalNo:  isYes ? m.totalNo           : m.totalNo + amount,
      }
    })
    const prev = state.userStakes[idStr] ?? { yes: 0n, no: 0n, settled: false }
    const userStakes = {
      ...state.userStakes,
      [idStr]: {
        yes:     isYes ? prev.yes + amount : prev.yes,
        no:      isYes ? prev.no           : prev.no + amount,
        settled: false,
      },
    }
    return { markets, userStakes }
  }),

  addMarket: (params) => {
    const state = get()
    const newId = BigInt(state.markets.length + 1)
    // Use DEMO_BLOCK_TIME_MS (350n) to match the constant — same formula the contract uses
    const bettingBlocks = (params.bettingSeconds * 1000n) / DEMO_BLOCK_TIME_MS
    const resolveBlocks = bettingBlocks + (params.resolveDelaySeconds * 1000n) / DEMO_BLOCK_TIME_MS
    const newMarket: Market = {
      id:            newId,
      creator:       '0x0000000000000000000000000000000000000000',
      question:      params.question,
      oracleUrl:     params.oracleUrl,
      jsonPath:      params.jsonPath,
      target:        params.target,
      comparator:    params.comparator,
      closeBlock:    1_000_000n + bettingBlocks,
      resolveBlock:  1_000_000n + resolveBlocks,
      scheduleId:    BigInt(Math.floor(Math.random() * 1000) + 100),
      totalYes:      0n,
      totalNo:       0n,
      state:         0,
      outcome:       0,
      attempts:      0,
      observedValue: 0n,
      invalidReason: '',
    }
    set(s => ({ markets: [newMarket, ...s.markets] }))
    return newId
  },

  claimWinnings: (marketId) => set(state => {
    const idStr = marketId.toString()
    return {
      userStakes: {
        ...state.userStakes,
        [idStr]: { ...(state.userStakes[idStr] ?? { yes: 0n, no: 0n, settled: false }), settled: true },
      },
    }
  }),

  claimRefund: (marketId) => set(state => {
    const idStr = marketId.toString()
    return {
      userStakes: {
        ...state.userStakes,
        [idStr]: { ...(state.userStakes[idStr] ?? { yes: 0n, no: 0n, settled: false }), settled: true },
      },
    }
  }),

  fundExecution: (amount) => set(state => ({
    executionBalance: state.executionBalance + amount,
  })),

  resetDemo: () => set({
    markets:          [...DEMO_MARKETS],
    userStakes:       { ...DEMO_USER_STAKES },
    executionBalance: DEMO_EXECUTION_BALANCE,
  }),
}))
