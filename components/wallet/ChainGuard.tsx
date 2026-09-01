'use client'
import { useAccount, useSwitchChain } from 'wagmi'
import { useAppMode } from '@/contexts/AppModeContext'
import { RITUAL_CHAIN_ID, RITUAL_FAUCET } from '@/lib/constants'

export function ChainGuard({ children }: { children: React.ReactNode }) {
  const { mode }                   = useAppMode()
  const { chainId, isConnected }   = useAccount()
  const { switchChain, isPending } = useSwitchChain()

  // Demo mode: always render children, no chain check
  if (mode === 'demo') return <>{children}</>

  // Live mode: if wallet connected on wrong chain → full-page blocking overlay
  if (isConnected && chainId !== RITUAL_CHAIN_ID) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(8,9,26,0.97)', backdropFilter: 'blur(20px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: '24px', fontFamily: 'var(--font-body)',
      }}>
        <div style={{ fontSize: '56px' }}>⛓️</div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', color: '#f0f1ff', margin: 0 }}>
          Wrong Network
        </h2>
        <p style={{ color: '#9196c0', textAlign: 'center', maxWidth: '400px', margin: 0, lineHeight: 1.6 }}>
          Autonomous Markets only works on{' '}
          <strong style={{ color: '#6366f1' }}>Ritual Chain (ID: 1979)</strong>.{' '}
          Please switch your wallet to continue.
        </p>
        <button
          onClick={() => switchChain({ chainId: RITUAL_CHAIN_ID })}
          disabled={isPending}
          style={{
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff',
            fontWeight: '700', padding: '14px 32px', borderRadius: '12px',
            border: 'none', cursor: isPending ? 'not-allowed' : 'pointer',
            fontSize: '16px', fontFamily: 'var(--font-body)',
            opacity: isPending ? 0.6 : 1,
            transition: 'all 200ms',
          }}
        >
          {isPending ? 'Switching…' : 'SWITCH TO RITUAL CHAIN'}
        </button>
        <p style={{ color: '#454878', fontSize: '13px', margin: 0 }}>
          Don't have testnet RITUAL?{' '}
          <a href={RITUAL_FAUCET} target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1' }}>
            Get some here →
          </a>
        </p>
      </div>
    )
  }

  return <>{children}</>
}
