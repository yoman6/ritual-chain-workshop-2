'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { parseEther } from 'viem'
import { useAccount } from 'wagmi'
import { ExternalLink, RefreshCw } from 'lucide-react'
import { GlowCard } from '@/components/ui/GlowCard'
import { GlowButton } from '@/components/ui/GlowButton'
import { HealthBadge } from '@/components/ui/HealthBadge'
import { useExecutionBalance } from '@/hooks/useExecutionBalance'
import { useFundExecution } from '@/hooks/useFundExecution'
import { useMarkets } from '@/hooks/useMarkets'
import { useCurrentBlock } from '@/hooks/useCurrentBlock'
import { useAppMode } from '@/contexts/AppModeContext'
import { useToast } from '@/components/ui/Toast'
import {
  CONTRACT_ADDRESS, RITUAL_CHAIN_ID, RITUAL_EXPLORER,
  SCHEDULER_ADDRESS, RITUAL_WALLET_ADDRESS, TEE_REGISTRY_ADDRESS,
  DEFAULT_LOCK_BLOCKS, MAX_ATTEMPTS,
} from '@/lib/constants'
import { RITUAL_PREDICT_ABI } from '@/lib/abi'
import { RITUAL_WALLET_ABI } from '@/lib/ritual-wallet-abi'
import { useReadContract } from 'wagmi'
import { formatRitual, shortAddr, explorerAddr, explorerTx, execBalanceHealth } from '@/lib/utils'

export default function AdminPage() {
  const { mode }         = useAppMode()
  const { address }      = useAccount()
  const { toast }        = useToast()
  const { balance, isLoading: balanceLoading } = useExecutionBalance()
  const { fund, isPending: fundPending }       = useFundExecution()
  const { markets }      = useMarkets()
  const currentBlock     = useCurrentBlock()

  const [fundAmount, setFundAmount] = useState('0.5')
  const [lockBlocks, setLockBlocks] = useState(DEFAULT_LOCK_BLOCKS.toString())
  const [lastHash, setLastHash]     = useState<string>()

  // Read lockUntil from RitualWallet contract (live only)
  const { data: lockUntilData } = useReadContract({
    address: RITUAL_WALLET_ADDRESS,
    abi: RITUAL_WALLET_ABI,
    functionName: 'lockUntil',
    args: [CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000'],
    query: { enabled: mode === 'live' && !!CONTRACT_ADDRESS },
  })
  const lockUntil = lockUntilData as bigint | undefined

  // Per-state counts
  const stateCounts = { open: 0, closed: 0, resolving: 0, resolved: 0, invalid: 0 }
  for (const m of markets) {
    if (m.state === 0) stateCounts.open++
    else if (m.state === 1) stateCounts.closed++
    else if (m.state === 2) stateCounts.resolving++
    else if (m.state === 3) stateCounts.resolved++
    else if (m.state === 4) stateCounts.invalid++
  }

  const handleFund = async () => {
    if (!fundAmount || isNaN(Number(fundAmount)) || Number(fundAmount) <= 0) {
      toast.warning('Enter a valid amount')
      return
    }
    try {
      const amount = parseEther(fundAmount)
      const blocks = BigInt(lockBlocks || DEFAULT_LOCK_BLOCKS.toString())
      const hash   = await fund(amount, blocks)
      if (hash) {
        setLastHash(hash as string)
        toast.success(`✓ Funded ${fundAmount} RITUAL`, { txHash: hash as string })
      }
    } catch {
      toast.error('Fund execution failed')
    }
  }

  const health = execBalanceHealth(balance)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 24px' }}
      className="page-enter"
    >
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: 800, color: '#f0f1ff', margin: '0 0 8px', letterSpacing: '-1px' }}>
        MONITOR
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: '#454878', marginBottom: '40px' }}>
        Monitor the RitualPredict deployment and manage the execution wallet.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>

        {/* ── Execution Balance ── */}
        <GlowCard
          glowColor={health === 'critical' ? '#f43f5e' : health === 'warning' ? '#f59e0b' : '#6366f1'}
          style={{ gridColumn: 'span 2' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#454878', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                Execution Balance (RitualWallet)
              </div>
              {balanceLoading
                ? <div className="skeleton" style={{ width: '160px', height: '40px' }} />
                : <div style={{ fontFamily: 'var(--font-mono)', fontSize: '40px', fontWeight: 800, color: health === 'critical' ? '#f43f5e' : health === 'warning' ? '#f59e0b' : '#6366f1' }}>
                    {formatRitual(balance, 4)}
                  </div>
              }
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#454878', marginTop: '4px' }}>RITUAL</div>
              <div style={{ marginTop: '10px' }}>
                <HealthBadge balance={balance} />
              </div>
            </div>

            {/* Fund form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '220px' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#454878', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Fund Execution
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type="number"
                    value={fundAmount}
                    onChange={e => setFundAmount(e.target.value)}
                    min="0"
                    step="0.1"
                    placeholder="0.5"
                    style={{
                      width: '100%', padding: '10px 56px 10px 12px',
                      background: '#08091a', border: '1px solid #1e2245',
                      borderRadius: '8px', color: '#f0f1ff',
                      fontFamily: 'var(--font-mono)', fontSize: '14px',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                  <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#454878' }}>
                    RITUAL
                  </span>
                </div>
                <GlowButton size="sm" loading={fundPending} onClick={handleFund}>
                  FUND
                </GlowButton>
              </div>
              <div>
                <label style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#454878', display: 'block', marginBottom: '4px' }}>
                  Lock Duration (blocks)
                </label>
                <input
                  type="number"
                  value={lockBlocks}
                  onChange={e => setLockBlocks(e.target.value)}
                  placeholder={DEFAULT_LOCK_BLOCKS.toString()}
                  style={{
                    width: '100%', padding: '8px 12px',
                    background: '#08091a', border: '1px solid #1e2245',
                    borderRadius: '8px', color: '#f0f1ff',
                    fontFamily: 'var(--font-mono)', fontSize: '12px',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#2d3270', marginTop: '2px' }}>
                  ~{((Number(lockBlocks || DEFAULT_LOCK_BLOCKS) * 350) / 3600 / 1000).toFixed(1)}h at 350ms/block
                </div>
              </div>
              {lastHash && (
                <a
                  href={explorerTx(lastHash)}
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6366f1', fontSize: '11px', fontFamily: 'var(--font-mono)' }}
                >
                  {lastHash.slice(0, 16)}… <ExternalLink size={10} />
                </a>
              )}
            </div>
          </div>

          {/* lockUntil display */}
          {mode === 'live' && lockUntil !== undefined && (
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #1e2245', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#454878' }}>
              Lock expires at block:{' '}
              <span style={{ color: lockUntil > currentBlock ? '#f59e0b' : '#6366f1' }}>
                #{lockUntil.toLocaleString()}
              </span>
              {lockUntil > currentBlock
                ? <span style={{ color: '#f59e0b' }}> (locked)</span>
                : <span style={{ color: '#6366f1' }}> (unlocked — can refund)</span>
              }
            </div>
          )}
        </GlowCard>

        {/* ── Signal Statistics ── */}
        <GlowCard>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#454878', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
            Signal Statistics
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Total',    value: markets.length,         color: '#f0f1ff' },
              { label: 'Live',     value: stateCounts.open,       color: '#6366f1' },
              { label: 'Locked',   value: stateCounts.closed,     color: '#f59e0b' },
              { label: 'Settling', value: stateCounts.resolving,  color: '#f97316' },
              { label: 'Settled',  value: stateCounts.resolved,   color: '#6366f1' },
              { label: 'Void',     value: stateCounts.invalid,    color: '#666680' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #0d0d1a' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#454878' }}>{row.label}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 700, color: row.color }}>{row.value}</span>
              </div>
            ))}
          </div>
        </GlowCard>

        {/* ── System Addresses ── */}
        <GlowCard>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#454878', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
            System Addresses (Ritual Chain 1979)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {([
              { label: 'Predict Contract', addr: (CONTRACT_ADDRESS as string) || '—', emphasis: true },
              { label: 'Scheduler',        addr: SCHEDULER_ADDRESS as string },
              { label: 'RitualWallet',     addr: RITUAL_WALLET_ADDRESS as string },
              { label: 'TEE Registry',     addr: TEE_REGISTRY_ADDRESS as string },
            ] as { label: string; addr: string; emphasis?: boolean }[]).map(row => (
              <div key={row.label}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#2d3270', marginBottom: '2px' }}>{row.label}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: row.emphasis ? '#6366f1' : '#454878' }}>
                    {row.addr !== '—' ? shortAddr(row.addr) : '—'}
                  </span>
                  {row.addr !== '—' && (
                    <a
                      href={explorerAddr(row.addr)}
                      target="_blank" rel="noopener noreferrer"
                      style={{ color: '#2d3270', display: 'flex' }}
                    >
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </GlowCard>

        {/* ── Chain Info ── */}
        <GlowCard>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#454878', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
            Chain Info
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Chain ID',      value: RITUAL_CHAIN_ID.toString() },
              { label: 'Current Block', value: currentBlock.toLocaleString() },
              { label: 'Block Time',    value: '~350ms' },
              { label: 'Max Attempts', value: MAX_ATTEMPTS.toString() },
              { label: 'Mode',         value: mode.toUpperCase() },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid #0d0d1a' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#454878' }}>{row.label}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#f0f1ff' }}>{row.value}</span>
              </div>
            ))}
          </div>
        </GlowCard>

        {/* ── Sandbox Warning ── */}
        {mode === 'demo' && (
          <GlowCard glowColor="none" style={{ gridColumn: '1 / -1', background: 'rgba(245,158,11,0.03)', border: '1px solid rgba(245,158,11,0.15)' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: '#f59e0b', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '20px', flexShrink: 0 }}>⚠</span>
              <span>
                You are in <strong>SANDBOX MODE</strong>. Fund Execution simulates a transaction locally.
                Switch to MAINNET mode to send real transactions to the Ritual Chain contract.
              </span>
            </div>
          </GlowCard>
        )}
      </div>
    </motion.div>
  )
}
