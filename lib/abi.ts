export const RITUAL_PREDICT_ABI = [
  // ── Read functions ──────────────────────────────────────────
  {
    name: 'getMarkets',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{
      type: 'tuple[]',
      components: [
        { name: 'id',            type: 'uint256' },
        { name: 'creator',       type: 'address' },
        { name: 'question',      type: 'string'  },
        { name: 'oracleUrl',     type: 'string'  },
        { name: 'jsonPath',      type: 'string'  },
        { name: 'target',        type: 'uint256' },
        { name: 'comparator',    type: 'uint8'   },
        { name: 'closeBlock',    type: 'uint64'  },
        { name: 'resolveBlock',  type: 'uint64'  },
        { name: 'scheduleId',    type: 'uint256' },
        { name: 'totalYes',      type: 'uint256' },
        { name: 'totalNo',       type: 'uint256' },
        { name: 'state',         type: 'uint8'   },
        { name: 'outcome',       type: 'uint8'   },
        { name: 'attempts',      type: 'uint8'   },
        { name: 'observedValue', type: 'uint256' },
        { name: 'invalidReason', type: 'string'  },
      ]
    }]
  },
  {
    name: 'getMarket',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'marketId', type: 'uint256' }],
    outputs: [{
      type: 'tuple',
      components: [
        { name: 'id',            type: 'uint256' },
        { name: 'creator',       type: 'address' },
        { name: 'question',      type: 'string'  },
        { name: 'oracleUrl',     type: 'string'  },
        { name: 'jsonPath',      type: 'string'  },
        { name: 'target',        type: 'uint256' },
        { name: 'comparator',    type: 'uint8'   },
        { name: 'closeBlock',    type: 'uint64'  },
        { name: 'resolveBlock',  type: 'uint64'  },
        { name: 'scheduleId',    type: 'uint256' },
        { name: 'totalYes',      type: 'uint256' },
        { name: 'totalNo',       type: 'uint256' },
        { name: 'state',         type: 'uint8'   },
        { name: 'outcome',       type: 'uint8'   },
        { name: 'attempts',      type: 'uint8'   },
        { name: 'observedValue', type: 'uint256' },
        { name: 'invalidReason', type: 'string'  },
      ]
    }]
  },
  {
    name: 'stakesOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'marketId', type: 'uint256' },
      { name: 'account',  type: 'address' },
    ],
    outputs: [
      { name: 'yes',            type: 'uint256' },
      { name: 'no',             type: 'uint256' },
      { name: 'alreadySettled', type: 'bool'    },
      { name: 'claimable',      type: 'uint256' },
    ]
  },
  {
    name: 'executionBalance',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }]
  },
  {
    name: 'marketCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }]
  },
  {
    name: 'blockTimeMs',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }]
  },
  {
    name: 'MAX_ATTEMPTS',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint32' }]
  },
  // ── Write functions ──────────────────────────────────────────
  {
    name: 'createMarket',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{
      name: 'p',
      type: 'tuple',
      components: [
        { name: 'question',            type: 'string'  },
        { name: 'oracleUrl',           type: 'string'  },
        { name: 'jsonPath',            type: 'string'  },
        { name: 'target',              type: 'uint256' },
        { name: 'comparator',          type: 'uint8'   },
        { name: 'bettingSeconds',      type: 'uint256' },
        { name: 'resolveDelaySeconds', type: 'uint256' },
      ]
    }],
    outputs: [{ name: 'marketId', type: 'uint256' }]
  },
  {
    name: 'bet',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'marketId', type: 'uint256' },
      { name: 'isYes',    type: 'bool'    },
    ],
    outputs: []
  },
  {
    name: 'claimWinnings',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'marketId', type: 'uint256' }],
    outputs: []
  },
  {
    name: 'claimRefund',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'marketId', type: 'uint256' }],
    outputs: []
  },
  {
    name: 'fundExecution',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: 'lockDurationBlocks', type: 'uint256' }],
    outputs: []
  },
  // ── Events ──────────────────────────────────────────────────
  {
    name: 'MarketCreated',
    type: 'event',
    inputs: [
      { name: 'marketId',    type: 'uint256', indexed: true  },
      { name: 'creator',     type: 'address', indexed: true  },
      { name: 'question',    type: 'string',  indexed: false },
      { name: 'closeBlock',  type: 'uint64',  indexed: false },
      { name: 'resolveBlock',type: 'uint64',  indexed: false },
      { name: 'scheduleId',  type: 'uint256', indexed: false },
    ]
  },
  {
    name: 'ResolutionRuleSet',
    type: 'event',
    inputs: [
      { name: 'marketId',   type: 'uint256',  indexed: true  },
      { name: 'oracleUrl',  type: 'string',   indexed: false },
      { name: 'jsonPath',   type: 'string',   indexed: false },
      { name: 'target',     type: 'uint256',  indexed: false },
      { name: 'comparator', type: 'uint8',    indexed: false },
    ]
  },
  {
    name: 'BetPlaced',
    type: 'event',
    inputs: [
      { name: 'marketId', type: 'uint256', indexed: true  },
      { name: 'bettor',   type: 'address', indexed: true  },
      { name: 'isYes',    type: 'bool',    indexed: false },
      { name: 'amount',   type: 'uint256', indexed: false },
    ]
  },
  {
    name: 'ResolutionAttempted',
    type: 'event',
    inputs: [
      { name: 'marketId', type: 'uint256', indexed: true  },
      { name: 'attempt',  type: 'uint8',   indexed: false },
      { name: 'executor', type: 'address', indexed: false },
    ]
  },
  {
    name: 'ResolutionFailed',
    type: 'event',
    inputs: [
      { name: 'marketId', type: 'uint256', indexed: true  },
      { name: 'attempt',  type: 'uint8',   indexed: false },
      { name: 'reason',   type: 'string',  indexed: false },
    ]
  },
  {
    name: 'MarketResolved',
    type: 'event',
    inputs: [
      { name: 'marketId',      type: 'uint256', indexed: true  },
      { name: 'outcome',       type: 'uint8',   indexed: false },
      { name: 'observedValue', type: 'uint256', indexed: false },
    ]
  },
  {
    name: 'MarketInvalidated',
    type: 'event',
    inputs: [
      { name: 'marketId', type: 'uint256', indexed: true  },
      { name: 'reason',   type: 'string',  indexed: false },
    ]
  },
  {
    name: 'WinningsClaimed',
    type: 'event',
    inputs: [
      { name: 'marketId', type: 'uint256', indexed: true  },
      { name: 'claimant', type: 'address', indexed: true  },
      { name: 'amount',   type: 'uint256', indexed: false },
    ]
  },
  {
    name: 'StakeRefunded',
    type: 'event',
    inputs: [
      { name: 'marketId', type: 'uint256', indexed: true  },
      { name: 'claimant', type: 'address', indexed: true  },
      { name: 'amount',   type: 'uint256', indexed: false },
    ]
  },
  // ── Custom Errors ────────────────────────────────────────────
  { name: 'UnknownMarket',  type: 'error', inputs: [] },
  { name: 'OnlyScheduler',  type: 'error', inputs: [] },
  { name: 'BettingClosed',  type: 'error', inputs: [] },
  { name: 'ZeroStake',      type: 'error', inputs: [] },
  { name: 'NotResolved',    type: 'error', inputs: [] },
  { name: 'NotInvalid',     type: 'error', inputs: [] },
  { name: 'NothingToClaim', type: 'error', inputs: [] },
  { name: 'AlreadySettled', type: 'error', inputs: [] },
  { name: 'BadDuration',    type: 'error', inputs: [] },
  { name: 'EmptyString',    type: 'error', inputs: [] },
  { name: 'TransferFailed', type: 'error', inputs: [] },
] as const
