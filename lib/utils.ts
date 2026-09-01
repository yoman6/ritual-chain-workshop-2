import { formatEther } from 'viem'
import { COMPARATOR_SYM } from './constants'
import type { Market, MarketState } from './types'

export function blocksToSeconds(blocks: bigint, blockTimeMs: bigint): number {
  return Number(blocks * blockTimeMs) / 1000
}

export function blocksToHuman(blocks: bigint, blockTimeMs: bigint): string {
  const s = blocksToSeconds(blocks, blockTimeMs)
  if (s <= 0)   return 'Now'
  if (s < 60)   return `${Math.round(s)}s`
  if (s < 3600) return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`
  return `${(s / 3600).toFixed(1)}h`
}

export function blockCountdown(
  targetBlock: bigint,
  currentBlock: bigint,
  blockTimeMs: bigint
): string {
  if (currentBlock >= targetBlock) return 'Now'
  return blocksToHuman(targetBlock - currentBlock, blockTimeMs)
}

export function yesPercent(totalYes: bigint, totalNo: bigint): number {
  const total = totalYes + totalNo
  if (total === 0n) return 50
  return Number((totalYes * 10000n) / total) / 100
}

export function formatRitual(amount: bigint, dp = 4): string {
  return parseFloat(formatEther(amount)).toFixed(dp)
}

export function shortAddr(addr: string): string {
  if (!addr || addr.length < 10) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export function explorerTx(hash: string): string {
  return `https://explorer.ritualfoundation.org/tx/${hash}`
}

export function explorerAddr(addr: string): string {
  return `https://explorer.ritualfoundation.org/address/${addr}`
}

// Payout preview: mirrors contract's _payout formula.
// Adds inputAmount to the pool first (as the contract does) then computes share.
// Returns 0n if inputAmount is 0n.
export function previewPayout(
  inputAmount: bigint,
  totalYes: bigint,
  totalNo: bigint,
  isYes: boolean
): bigint {
  if (inputAmount === 0n) return 0n
  const newSidePool  = isYes ? totalYes + inputAmount : totalNo + inputAmount
  const newTotalPool = totalYes + totalNo + inputAmount
  if (newSidePool === 0n) return 0n
  return (inputAmount * newTotalPool) / newSidePool
}

export function stateColor(state: MarketState): string {
  const colors: Record<number, string> = {
    0: '#6366f1', // Live
    1: '#f59e0b', // Locked
    2: '#f97316', // Settling
    3: '#6366f1', // Settled
    4: '#666680', // Void
  }
  return colors[state] ?? '#ffffff'
}

export function ruleText(market: Market): string {
  const sym = COMPARATOR_SYM[market.comparator]
  return `Resolves YES if observed value ${sym} ${market.target.toString()}`
}

export function fakeTxHash(): `0x${string}` {
  return `0xdemo${Date.now().toString(16).padStart(60, '0')}` as `0x${string}`
}

export function execBalanceHealth(balance: bigint): 'healthy' | 'warning' | 'critical' {
  if (balance >= 500_000_000_000_000_000n) return 'healthy'
  if (balance >= 100_000_000_000_000_000n) return 'warning'
  return 'critical'
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function truncateMiddle(str: string, maxLen = 40): string {
  if (str.length <= maxLen) return str
  const half = Math.floor(maxLen / 2)
  return `${str.slice(0, half)}...${str.slice(-half)}`
}

export function decodeContractError(e: unknown): string {
  const err = e as { shortMessage?: string; message?: string; name?: string }
  const msg = err?.shortMessage ?? err?.message ?? 'Transaction failed'
  if (msg.includes('BettingClosed'))  return 'Betting is closed for this market'
  if (msg.includes('ZeroStake'))      return 'Bet amount must be greater than 0'
  if (msg.includes('NothingToClaim')) return 'Nothing to claim for this address'
  if (msg.includes('AlreadySettled')) return 'Already claimed from this market'
  if (msg.includes('NotResolved'))    return 'Market has not resolved yet'
  if (msg.includes('NotInvalid'))     return 'Market is not invalid — cannot refund'
  if (msg.includes('BadDuration'))    return 'Invalid duration — check min/max constraints'
  if (msg.includes('EmptyString'))    return 'Question, oracle URL, and jq path cannot be empty'
  if (msg.includes('User rejected'))  return 'Transaction rejected by user'
  return msg
}
