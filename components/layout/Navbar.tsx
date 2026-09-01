'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, LayoutDashboard, TrendingUp, PlusCircle, Wallet } from 'lucide-react'
import { useAppMode } from '@/contexts/AppModeContext'
import { CustomConnectButton } from '@/components/wallet/ConnectButton'

const NAV_LINKS = [
  { href: '/markets',   label: 'Browse Signals', icon: TrendingUp },
  { href: '/create',    label: 'Launch',          icon: PlusCircle },
  { href: '/positions', label: 'Portfolio',       icon: Wallet },
]

export function Navbar() {
  const { mode, setMode }   = useAppMode()
  const pathname            = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav style={{
      position:   'sticky', top: 0, zIndex: 1000,
      padding:    '0 24px',
      height:     '64px',
      display:    'flex', alignItems: 'center', justifyContent: 'space-between',
      background: scrolled ? 'rgba(8,9,26,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid #1e2245' : '1px solid transparent',
      transition: 'all 300ms',
    }}>
      {/* LEFT — Logo + brand */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <Image
          src="/ritual-logo.png"
          alt="Autonomous Markets"
          width={30}
          height={30}
          style={{
            filter: 'invert(42%) sepia(90%) saturate(600%) hue-rotate(220deg) brightness(1.1)',
            opacity: 1,
          }}
        />
        <span style={{
          fontFamily:  'var(--font-heading)',
          fontWeight:  700,
          fontSize:    '18px',
          color:       '#6366f1',
          letterSpacing: '-0.5px',
        }}>
          AUTONOMOUS MARKETS
        </span>
      </Link>

      {/* CENTER — Nav links (desktop) */}
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }} className="desktop-nav">
        {NAV_LINKS.map(link => {
          const active = pathname === link.href || pathname?.startsWith(link.href + '/')
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontFamily:  'var(--font-body)',
                fontSize:    '14px',
                fontWeight:  active ? 600 : 400,
                color:       active ? '#6366f1' : '#9196c0',
                textDecoration: 'none',
                display:     'flex',
                alignItems:  'center',
                gap:         '6px',
                padding:     '8px 14px',
                borderRadius: '8px',
                background:  active ? 'rgba(99,102,241,0.08)' : 'transparent',
                border:      active ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
                transition:  'all 200ms',
              }}
              onMouseEnter={e => {
                if (!active) {
                  ;(e.currentTarget as HTMLElement).style.color = '#f0f1ff'
                  ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
                  ;(e.currentTarget as HTMLElement).style.border = '1px solid #2d3270'
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  ;(e.currentTarget as HTMLElement).style.color = '#9196c0'
                  ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                  ;(e.currentTarget as HTMLElement).style.border = '1px solid transparent'
                }
              }}
            >
              <Icon size={14} />
              {link.label}
            </Link>
          )
        })}

        {/* Monitor link — always visible */}
        <Link
          href="/admin"
          style={{
            fontFamily:  'var(--font-body)',
            fontSize:    '14px',
            fontWeight:  pathname === '/admin' ? 600 : 400,
            color:       pathname === '/admin' ? '#6366f1' : '#9196c0',
            textDecoration: 'none',
            display:     'flex',
            alignItems:  'center',
            gap:         '6px',
            padding:     '8px 14px',
            borderRadius: '8px',
            background:  pathname === '/admin' ? 'rgba(99,102,241,0.08)' : 'transparent',
            border:      pathname === '/admin' ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
            transition:  'all 200ms',
          }}
          onMouseEnter={e => {
            if (pathname !== '/admin') {
              ;(e.currentTarget as HTMLElement).style.color = '#f0f1ff'
              ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
              ;(e.currentTarget as HTMLElement).style.border = '1px solid #2d3270'
            }
          }}
          onMouseLeave={e => {
            if (pathname !== '/admin') {
              ;(e.currentTarget as HTMLElement).style.color = '#9196c0'
              ;(e.currentTarget as HTMLElement).style.background = 'transparent'
              ;(e.currentTarget as HTMLElement).style.border = '1px solid transparent'
            }
          }}
        >
          <LayoutDashboard size={14} />
          Monitor
        </Link>
      </div>

      {/* RIGHT — Mode toggle + Connect */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div className="mode-toggle">
          <button
            onClick={() => setMode('demo')}
            className={mode === 'demo' ? 'active' : ''}
          >
            SANDBOX
          </button>
          <button
            onClick={() => setMode('live')}
            className={mode === 'live' ? 'active' : ''}
          >
            MAINNET
          </button>
        </div>

        <div className="desktop-nav">
          <CustomConnectButton />
        </div>

        {/* Hamburger — mobile only */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="mobile-menu-btn"
          style={{ background: 'none', border: 'none', color: '#f0f1ff', cursor: 'pointer', padding: '4px' }}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile slide-in menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: '64px', right: 0, bottom: 0, width: '260px',
          background: 'rgba(8,9,26,0.98)', backdropFilter: 'blur(20px)',
          borderLeft: '1px solid #1e2245', zIndex: 999,
          display: 'flex', flexDirection: 'column', padding: '24px',
          gap: '8px', animation: 'slideInRight 0.25s ease forwards',
        }}>
          {[...NAV_LINKS, { href: '/admin', label: 'Monitor', icon: LayoutDashboard }].map(link => {
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  fontFamily: 'var(--font-body)', fontSize: '16px',
                  color: pathname === link.href ? '#6366f1' : '#9196c0',
                  textDecoration: 'none', fontWeight: 500,
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px 16px', borderRadius: '8px',
                  background: pathname === link.href ? 'rgba(99,102,241,0.08)' : 'transparent',
                }}
              >
                <Icon size={16} />
                {link.label}
              </Link>
            )
          })}
          <div style={{ marginTop: 'auto' }}>
            <CustomConnectButton />
          </div>
        </div>
      )}

      <style>{`
        .desktop-nav { display: flex; align-items: center; gap: 4px; }
        .mobile-menu-btn { display: none; }
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  )
}
