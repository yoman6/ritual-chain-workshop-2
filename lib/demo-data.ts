import type { Market } from './types'
import { parseEther } from 'viem'

const e = parseEther

export const DEMO_MARKETS: Market[] = [
  // 1. OPEN
  {
    id: 1n, creator: '0xdEaD0001000000000000000000000000deadbeef01' as `0x${string}`,
    question: 'Will SOL/USD reach $300 at the time this signal resolves?',
    oracleUrl: process.env.NEXT_PUBLIC_DEMO_ORACLE_URL ?? 'https://your-tunnel.trycloudflare.com/api/oracle/sol',
    jsonPath: '.price', target: 300n, comparator: 1,
    closeBlock: 1_001_500n, resolveBlock: 1_002_000n, scheduleId: 42n,
    totalYes: e('3.2'), totalNo: e('1.8'),
    state: 0, outcome: 0, attempts: 0, observedValue: 0n, invalidReason: '',
  },
  // 2. LOCKED
  {
    id: 2n, creator: '0xdEaD0002000000000000000000000000deadbeef02' as `0x${string}`,
    question: 'Will BTC/USD surpass $120,000 before this signal closes?',
    oracleUrl: 'https://your-tunnel.trycloudflare.com/api/oracle/btc',
    jsonPath: '.price', target: 120000n, comparator: 0,
    closeBlock: 999_800n, resolveBlock: 1_001_000n, scheduleId: 43n,
    totalYes: e('1.1'), totalNo: e('2.4'),
    state: 1, outcome: 0, attempts: 0, observedValue: 0n, invalidReason: '',
  },
  // 3. SETTLING (2 attempts failed, 3rd pending)
  {
    id: 3n, creator: '0xdEaD0003000000000000000000000000deadbeef03' as `0x${string}`,
    question: 'Will ETH/USD stay above $3,800 at oracle read time?',
    oracleUrl: 'https://your-tunnel.trycloudflare.com/api/oracle/eth',
    jsonPath: '.price', target: 3800n, comparator: 1,
    closeBlock: 998_000n, resolveBlock: 998_500n, scheduleId: 44n,
    totalYes: e('0.9'), totalNo: e('0.9'),
    state: 2, outcome: 0, attempts: 2, observedValue: 0n, invalidReason: '',
  },
  // 4. SETTLED YES
  {
    id: 4n, creator: '0xdEaD0004000000000000000000000000deadbeef04' as `0x${string}`,
    question: 'Will BTC/USD hold above $85,000 at resolution?',
    oracleUrl: 'https://your-tunnel.trycloudflare.com/api/oracle/btc',
    jsonPath: '.price', target: 85000n, comparator: 1,
    closeBlock: 995_000n, resolveBlock: 995_500n, scheduleId: 45n,
    totalYes: e('4.5'), totalNo: e('2.1'),
    state: 3, outcome: 1, attempts: 1, observedValue: 87420n, invalidReason: '',
  },
  // 5. SETTLED NO
  {
    id: 5n, creator: '0xdEaD0005000000000000000000000000deadbeef05' as `0x${string}`,
    question: 'Will SOL/USD fall below $150 before the deadline?',
    oracleUrl: 'https://your-tunnel.trycloudflare.com/api/oracle/sol',
    jsonPath: '.price', target: 150n, comparator: 2,
    closeBlock: 993_000n, resolveBlock: 993_500n, scheduleId: 46n,
    totalYes: e('0.8'), totalNo: e('3.3'),
    state: 3, outcome: 2, attempts: 1, observedValue: 172n, invalidReason: '',
  },
  // 6. VOID
  {
    id: 6n, creator: '0xdEaD0006000000000000000000000000deadbeef06' as `0x${string}`,
    question: 'Will AVAX/USD reach $80 by signal resolution?',
    oracleUrl: 'https://unreachable-oracle.example.com/api/avax',
    jsonPath: '.price', target: 80n, comparator: 1,
    closeBlock: 990_000n, resolveBlock: 990_500n, scheduleId: 47n,
    totalYes: e('0.4'), totalNo: e('0.4'),
    state: 4, outcome: 0, attempts: 3, observedValue: 0n,
    invalidReason: 'HTTP executor error: connection refused after 3 attempts',
  },
]

// Demo user stakes (demo address has positions on markets 1, 2, 4, 5, 6)
export const DEMO_USER_STAKES: Record<string, { yes: bigint; no: bigint; settled: boolean }> = {
  '1': { yes: parseEther('0.5'), no: 0n,               settled: false },
  '2': { yes: 0n,               no: parseEther('0.3'), settled: false },
  '4': { yes: parseEther('0.8'),no: 0n,               settled: false }, // claimable — YES won
  '5': { yes: parseEther('0.2'),no: 0n,               settled: false }, // lost — NO won
  '6': { yes: parseEther('0.4'),no: 0n,               settled: false }, // refundable — void
}

export const DEMO_EXECUTION_BALANCE = parseEther('0.3')  // warning level — good for testing
