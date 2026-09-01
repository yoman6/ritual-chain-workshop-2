'use client'
import Link from 'next/link'
import Image from 'next/image'
import { RITUAL_EXPLORER, RITUAL_FAUCET, CONTRACT_ADDRESS } from '@/lib/constants'
import { shortAddr } from '@/lib/utils'
import { ExternalLink } from 'lucide-react'

export function Footer() {
  return (
    <footer style={{
      borderTop:  '1px solid #1e2245',
      background: 'rgba(8,9,26,0.8)',
      padding:    '48px 24px 32px',
      marginTop:  '80px',
      position:   'relative',
      zIndex:     1,
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px',
        marginBottom: '40px',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Image
              src="/ritual-logo.png"
              alt="Autonomous Markets"
              width={24}
              height={24}
              style={{ filter: 'invert(42%) sepia(90%) saturate(600%) hue-rotate(220deg) brightness(1.1)', opacity: 1 }}
            />
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#6366f1', fontSize: '16px' }}>
              AUTONOMOUS MARKETS
            </span>
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#454878', lineHeight: 1.6 }}>
            Autonomous prediction protocol on Ritual Chain
          </p>
        </div>

        {/* Navigate — 2×2 grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '12px', color: '#454878', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
            Navigate
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
            {[
              { href: '/markets',   label: 'Browse Signals' },
              { href: '/create',    label: 'Launch Signal' },
              { href: '/positions', label: 'Portfolio' },
              { href: '/admin',     label: 'Monitor' },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{
                fontFamily: 'var(--font-body)', fontSize: '13px',
                color: '#9196c0', textDecoration: 'none',
                transition: 'color 150ms',
              }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', color: '#454878', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
            Resources
          </h4>
          {[
            { href: RITUAL_EXPLORER, label: 'Ritual Explorer' },
            { href: RITUAL_FAUCET,   label: 'Testnet Faucet' },
          ].map(l => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: '#9196c0', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {l.label} <ExternalLink size={11} />
            </a>
          ))}
          {CONTRACT_ADDRESS && (
            <a
              href={`${RITUAL_EXPLORER}/address/${CONTRACT_ADDRESS}`}
              target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#454878', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {shortAddr(CONTRACT_ADDRESS)} <ExternalLink size={10} />
            </a>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: '1px solid #1e2245', paddingTop: '20px',
        textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#2d3270',
      }}>
        © {new Date().getFullYear()} Autonomous Markets · Powered by Ritual Chain
      </div>
    </footer>
  )
}
