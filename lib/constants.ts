export const CONTRACT_ADDRESS  = (process.env.NEXT_PUBLIC_PREDICT_ADDRESS ?? '') as `0x${string}`
export const RITUAL_CHAIN_ID   = 1979
export const RITUAL_EXPLORER   = 'https://explorer.ritualfoundation.org'
export const RITUAL_FAUCET     = 'https://faucet.ritualfoundation.org'
export const RITUAL_RPC_URL    = 'https://rpc.ritualfoundation.org'

// System contract addresses on Ritual Chain (1979) — never change these
export const SCHEDULER_ADDRESS     = '0x56e776BAE2DD60664b69Bd5F865F1180ffB7D58B' as const
export const RITUAL_WALLET_ADDRESS = '0x532F0dF0896F353d8C3DD8cc134e8129DA2a3948' as const
export const TEE_REGISTRY_ADDRESS  = '0x9644e8562cE0Fe12b4deeC4163c064A8862Bf47F' as const

// Enum mappings — must match RitualPredict.sol exactly
// MarketState: Open=0, Closed=1, Resolving=2, Resolved=3, Invalid=4
// Outcome: Unresolved=0, Yes=1, No=2
// Comparator: GT=0, GTE=1, LT=2, LTE=3
export const MARKET_STATE_LABELS = ['Open', 'Closed', 'Resolving', 'Resolved', 'Invalid'] as const
export const OUTCOME_LABELS      = ['Unresolved', 'YES', 'NO'] as const
export const COMPARATOR_SYM      = ['>', '≥', '<', '≤'] as const
export const COMPARATOR_LABELS   = ['GT (>)', 'GTE (≥)', 'LT (<)', 'LTE (≤)'] as const

// Contract constraints (must match contract constants)
export const MIN_BETTING_SECONDS        = 30
export const MIN_RESOLVE_DELAY_SECONDS  = 15
export const MAX_MARKET_SECONDS         = 86400    // 1 day
export const RETRY_INTERVAL_BLOCKS      = 200      // blocks between resolution retries
export const DEFAULT_LOCK_BLOCKS        = 500_000n // ~48 hours at 350ms/block
export const MAX_ATTEMPTS               = 3

// Execution balance warning thresholds (in wei)
export const EXEC_BALANCE_HEALTHY = 500_000_000_000_000_000n  // 0.5 RITUAL
export const EXEC_BALANCE_WARNING = 100_000_000_000_000_000n  // 0.1 RITUAL

// Demo mode static values
export const DEMO_CURRENT_BLOCK = 1_000_000n
export const DEMO_BLOCK_TIME_MS = 350n   // Official Ritual docs: ~350ms/block
