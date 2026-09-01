export type MarketState  = 0 | 1 | 2 | 3 | 4   // Open | Closed | Resolving | Resolved | Invalid
export type Outcome      = 0 | 1 | 2             // Unresolved | Yes | No
export type Comparator   = 0 | 1 | 2 | 3         // GT | GTE | LT | LTE
export type AppMode      = 'demo' | 'live'

export interface Market {
  id:            bigint
  creator:       `0x${string}`
  question:      string
  oracleUrl:     string
  jsonPath:      string
  target:        bigint
  comparator:    Comparator
  closeBlock:    bigint
  resolveBlock:  bigint
  scheduleId:    bigint
  totalYes:      bigint
  totalNo:       bigint
  state:         MarketState
  outcome:       Outcome
  attempts:      number
  observedValue: bigint
  invalidReason: string
}

export interface UserStakes {
  yes:            bigint
  no:             bigint
  alreadySettled: boolean
  claimable:      bigint
}

export interface CreateMarketParams {
  question:            string
  oracleUrl:           string
  jsonPath:            string
  target:              bigint
  comparator:          Comparator
  bettingSeconds:      bigint
  resolveDelaySeconds: bigint
}

// Unified TX state used by all write hooks
export interface TxState {
  isPending:  boolean
  isSuccess:  boolean
  isError:    boolean
  txHash:     string | undefined
  error:      string | undefined
  reset:      () => void
}
