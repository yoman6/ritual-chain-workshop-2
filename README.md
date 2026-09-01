# Autonomous Markets

A production-quality prediction market frontend built on **Ritual Chain** (Chain ID: 1979).

Deploy signals like _"Will SOL/USD reach $300 at resolution?"_, stake native RITUAL on YES or NO, and watch it auto-settle — no backend cron, no centralized resolver. The Ritual Scheduler wakes the contract at a pre-determined block, reads the oracle, compares it to the target, and settles autonomously. Winners claim their proportional share of the pool.

---

## ✨ Features

### Dual Mode — SANDBOX & MAINNET

|                  | SANDBOX                              | MAINNET                          |
|------------------|--------------------------------------|----------------------------------|
| Wallet required  | ❌                                   | ✅                               |
| Transactions     | Simulated (2s delay + fake tx hash)  | Real on-chain                    |
| Markets          | Pre-seeded synthetic data            | Live from RitualPredict contract |
| State            | Zustand + localStorage               | wagmi + viem                     |

Switch freely between modes using the **SANDBOX / MAINNET** toggle in the navbar.

### Pages

| Route              | Description                                                                      |
|--------------------|----------------------------------------------------------------------------------|
| `/`                | Hero, live stats strip, How It Works section, recent signals preview             |
| `/markets`         | Browse all signals with state filters (Live / Locked / Settling / Settled / Void)|
| `/markets/[id]`    | Full signal detail — staking panel, odds bar, settlement countdown, activity feed|
| `/create`          | 4-step guided wizard — question, oracle config, timing, review & deploy          |
| `/positions`       | Your portfolio — claim winnings or refunds                                       |
| `/admin`           | Execution balance monitor, fund execution wallet, system addresses               |

### Smart Contract Integration

- Full ABI integration with `RitualPredict.sol` on Ritual Chain (1979)
- On-chain reads via `useReadContract` with 5s polling
- Writes via `writeContractAsync` + `waitForTransactionReceipt`
- `MarketCreated` event parsing for new signal ID extraction
- Named output decoding for `stakesOf()` return struct

### Sandbox Features

- 6 pre-seeded market states: **Open**, **Locked**, **Settling**, **Settled YES**, **Settled NO**, **Void**
- Full staking simulation with real pari-mutuel payout math
- Portfolio view with claimable winnings and void refunds
- Confetti animations + toast notifications for all actions
- Execution balance monitoring with health indicators

---

## 🏗 Architecture

```
createMarket()  ┌──────────────────────────┐
user ──────────────────────────────────────▶│  RitualPredict.sol       │
user ─── bet(id, YES|NO) ─────────────────▶│                          │
                                            │  markets, pools, stakes  │
schedule() ◀────┤                          │
                └──────────────────────────┘
┌─────────────────────────────┐                    ▲
│  Scheduler  0x56e7…D58B     │  onScheduledResolve │
│  deposit()  system contract │─────────────────────┘
│  fires at resolveBlock,     │          ▼
│  3 attempts, 200 blocks     │  ┌────────────────────────┐
└─────────────────────────────┘  │  RitualWallet 0x532F…  │
                                  │  prepaid execution fees │
                                  └────────────────────────┘
```

---

## 🛠 Tech Stack

| Layer      | Technology                                               |
|------------|----------------------------------------------------------|
| Framework  | Next.js 14 (App Router)                                  |
| Styling    | Vanilla CSS + Tailwind utilities                         |
| Animations | Framer Motion                                            |
| Wallet     | RainbowKit v2 + wagmi v2 + viem v2                       |
| State      | Zustand (sandbox store) + TanStack Query (live)          |
| Icons      | Lucide React                                             |
| Chain      | Ritual Chain — Chain ID 1979, ~350ms block time          |
| Fonts      | Outfit · DM Sans · IBM Plex Mono (all from Google Fonts) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A WalletConnect Cloud project ID → [cloud.walletconnect.com](https://cloud.walletconnect.com)
- (Optional) A deployed `RitualPredict` contract address for Mainnet mode

### Installation

```bash
# Clone and install
git clone https://github.com/yoman6/ritual-chain-workshop-2.git
cd ritual-chain-workshop-2
npm install

# Configure environment
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# Required — get from https://cloud.walletconnect.com
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Optional — for Mainnet mode with a deployed contract
NEXT_PUBLIC_PREDICT_ADDRESS=0xYourContractAddress

# Optional — override the sandbox oracle URL
NEXT_PUBLIC_DEMO_ORACLE_URL=https://your-tunnel.trycloudflare.com/api/oracle/eth
```

### Run

```bash
# Development
npm run dev
# → http://localhost:3000

# Production build
npm run build
npm start
```

> **Tip:** The app works immediately in **Sandbox mode** — no wallet, no contract address needed. Just run `npm run dev` and explore.

---

## 🔑 Environment Variables

| Variable                              | Required | Description                              |
|---------------------------------------|----------|------------------------------------------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`| ✅       | WalletConnect v2 project ID              |
| `NEXT_PUBLIC_PREDICT_ADDRESS`         | ❌       | RitualPredict contract address (Mainnet) |
| `NEXT_PUBLIC_DEMO_ORACLE_URL`         | ❌       | Sandbox oracle endpoint override         |

> **Security:** `.env.local` is listed in `.gitignore` and will never be committed.

---

## 📁 Project Structure

```
├── app/
│   ├── page.tsx                  # Home — hero, stats, live signals
│   ├── markets/page.tsx          # Signal browser with filters
│   ├── markets/[id]/page.tsx     # Signal detail + staking panel
│   ├── create/page.tsx           # 4-step deployment wizard
│   ├── positions/page.tsx        # Portfolio + claim
│   ├── admin/page.tsx            # Monitor dashboard
│   ├── api/oracle/               # Price oracle routes (ETH, BTC, SOL)
│   ├── layout.tsx
│   └── globals.css               # Grid bg, CSS vars, keyframes
├── components/
│   ├── layout/                   # Navbar, Footer, DemoBanner, ExecutionWarningBanner
│   ├── markets/                  # MarketCard, BettingPanel, OddsBar, CountdownTimer, etc.
│   ├── create/                   # CreateMarketWizard, ComparatorSelect
│   ├── positions/                # PositionCard, ClaimButton
│   ├── ui/                       # GlowCard, GlowButton, Toast, Confetti, Spinner, HealthBadge
│   └── wallet/                   # ConnectButton, ChainGuard
├── hooks/                        # 11 custom hooks (useMarket, useBet, useStakes, etc.)
├── contexts/                     # AppModeContext (SANDBOX/MAINNET toggle)
├── lib/
│   ├── abi.ts                    # Full RitualPredict ABI (reads, writes, events, errors)
│   ├── chains.ts                 # Ritual Chain viem config
│   ├── constants.ts              # Contract addresses, thresholds, enum maps
│   ├── demo-data.ts              # 6 pre-seeded sandbox signals + user stakes
│   ├── demo-store.ts             # Zustand store for sandbox mode (bet, claim, fund)
│   ├── ritual-wallet-abi.ts      # RitualWallet ABI (admin page)
│   ├── types.ts                  # TypeScript interfaces (Market, UserStakes, TxState)
│   ├── utils.ts                  # Formatting, payout math, error decoding, helpers
│   └── wagmi.ts                  # wagmi + RainbowKit config
├── hardhat/                      # Smart contract (Solidity) + deployment scripts
│   ├── contracts/
│   │   ├── RitualPredict.sol     # Workshop starter contract
│   │   └── ritual/RitualChain.sol# Canonical Ritual addresses & interfaces
│   ├── scripts/
│   │   ├── deploy.ts             # Deploy + prepay execution fees
│   │   ├── create-demo-market.ts # Create a market from CLI
│   │   ├── fund.ts               # Top up execution balance
│   │   └── status.ts             # Live market state viewer
│   └── hardhat.config.ts
└── public/
    └── ritual-logo.png
```

---

## 🎨 Design System

- **Theme:** Deep navy (`#08091a`) base with electric indigo (`#6366f1`) accents
- **Background:** Subtle square grid (32px) with animated ambient indigo glow
- **Typography:** Outfit (headings) · DM Sans (body) · IBM Plex Mono (code/mono)
- **Animations:** Page enter fade-up, skeleton shimmer, confetti on wins, toast slide-in/out, breathing glow
- **Cards:** Glassmorphism with `backdrop-filter: blur(20px)` and hover lift effects
- **Color Palette:**
  - YES: `#3b82f6` (blue)
  - NO: `#f43f5e` (rose)
  - Accent: `#6366f1` (indigo)
  - Warning: `#f59e0b` (amber)
  - Void: `#666680` (muted grey)

---

## 🔗 Ritual Chain Resources

- Docs — [https://docs.ritualfoundation.org](https://docs.ritualfoundation.org/)
- Explorer — [https://explorer.ritualfoundation.org](https://explorer.ritualfoundation.org/)
- Faucet — [https://faucet.ritualfoundation.org](https://faucet.ritualfoundation.org/)
- dApp Skills — [https://github.com/ritual-foundation/ritual-dapp-skills](https://github.com/ritual-foundation/ritual-dapp-skills)

---

## 📋 Contract Architecture Notes

- **Deadlines are block numbers, not timestamps.** The Scheduler fires at a block, so staking closes at a block — `createMarket` takes human durations in seconds and converts them via `blockTimeMs`.

- **A failed oracle read is never a NO.** HTTP precompile failure, non-200 response, or undecodable output all become Void (full refund to all), never a forced NO.

- **Retries are built-in.** `createMarket` books `numCalls = 3` executions 200 blocks apart. On success the contract cancels remaining calls. If all 3 fail → Void.

- **Payouts are pull-based.** `claimWinnings` computes `stake × totalPool ÷ winningPool` for caller only. No loops, no re-entrancy risk.

- **System contracts (never change):**
  - Scheduler: `0x56e776BAE2DD60664b69Bd5F865F1180ffB7D58B`
  - RitualWallet: `0x532F0dF0896F353d8C3DD8cc134e8129DA2a3948`
  - TEE Registry: `0x9644e8562cE0Fe12b4deeC4163c064A8862Bf47F`

---

*Completed by **Yomnu*** · [github.com/yoman6](https://github.com/yoman6)
