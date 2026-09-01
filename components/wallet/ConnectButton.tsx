'use client'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export function CustomConnectButton() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        if (!mounted) return null

        if (!account) {
          return (
            <button
              onClick={openConnectModal}
              style={{
                background: 'transparent', color: '#6366f1', border: '1px solid #6366f1',
                padding: '8px 18px', borderRadius: '10px', cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600,
                transition: 'all 200ms',
              }}
              onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = 'rgba(99,102,241,0.08)' }}
              onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = 'transparent' }}
            >
              CONNECT WALLET
            </button>
          )
        }

        if (chain?.unsupported) {
          return (
            <button
              onClick={openChainModal}
              style={{
                background: 'rgba(244,63,94,0.15)', color: '#f43f5e',
                border: '1px solid #f43f5e', padding: '8px 18px',
                borderRadius: '10px', cursor: 'pointer', fontFamily: 'var(--font-body)',
                fontSize: '14px', animation: 'accentPulse 1.5s ease-in-out infinite',
              }}
            >
              WRONG NETWORK ⚠
            </button>
          )
        }

        return (
          <div
            onClick={openAccountModal}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 14px', border: '1px solid #1e2245', borderRadius: '10px',
              cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '13px',
              background: 'rgba(255,255,255,0.02)',
              transition: 'all 200ms',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#2d3270' }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#1e2245' }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1', display: 'inline-block', flexShrink: 0 }} />
            <span style={{ color: '#f0f1ff' }}>{account.displayName}</span>
            {account.displayBalance && (
              <span style={{ color: '#454878' }}>{account.displayBalance}</span>
            )}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}
