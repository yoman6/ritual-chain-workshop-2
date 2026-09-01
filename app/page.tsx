'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useReadContract } from 'wagmi'
import { GlowCard } from '@/components/ui/GlowCard'
import { OddsBar } from '@/components/markets/OddsBar'
import { MarketStateBadge } from '@/components/markets/MarketStateBadge'
import { useMarkets } from '@/hooks/useMarkets'
import { useExecutionBalance } from '@/hooks/useExecutionBalance'
import { useCurrentBlock } from '@/hooks/useCurrentBlock'
import { useAppMode } from '@/contexts/AppModeContext'
import { CONTRACT_ADDRESS, RITUAL_CHAIN_ID, RITUAL_FAUCET } from '@/lib/constants'
import { RITUAL_PREDICT_ABI } from '@/lib/abi'
import { formatRitual } from '@/lib/utils'

export default function HomePage() {
  const { mode }            = useAppMode()
  const { markets }         = useMarkets()
  const { balance }         = useExecutionBalance()
  const currentBlock        = useCurrentBlock()

  const { data: marketCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: RITUAL_PREDICT_ABI,
    functionName: 'marketCount',
    query: { enabled: mode === 'live' && !!CONTRACT_ADDRESS },
  })

  const recentMarkets = [...markets].reverse().slice(0, 3)

  const stats = [
    { label: 'Total Markets', value: mode === 'demo' ? markets.length.toString() : (marketCount?.toString() ?? '—') },
    { label: 'Execution Balance', value: `${formatRitual(balance, 4)} RITUAL` },
    { label: 'Current Block', value: currentBlock.toLocaleString() },
    { label: 'Chain ID', value: '1979' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="page-enter"
    >
      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        padding: '80px 24px', position: 'relative',
      }}>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          style={{
            fontFamily:    'var(--font-heading)',
            fontSize:      'clamp(48px, 10vw, 80px)',
            fontWeight:    800,
            letterSpacing: '-2px',
            color:         '#f0f1ff',
            margin:        0,
            lineHeight:    1,
          }}
        >
          AUTONOMOUS MARKETS
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize:   '20px',
            color:      '#9196c0',
            maxWidth:   '540px',
            margin:     '20px auto 0',
            lineHeight: 1.6,
          }}
        >
          AI-native prediction protocol with autonomous settlement on Ritual Chain
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          style={{ display: 'flex', gap: '16px', marginTop: '48px', flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <Link href="/markets" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(99,102,241,0.5)' }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '16px 36px',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: '#fff',
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                fontSize: '15px',
                letterSpacing: '0.08em',
                border: 'none',
                borderRadius: '14px',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 0 24px rgba(99,102,241,0.35)',
                transition: 'all 200ms',
              }}
            >
              Browse Signals →
            </motion.button>
          </Link>

          <Link href="/create" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(99,102,241,0.2)', borderColor: '#6366f1', color: '#6366f1' }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '16px 36px',
                background: 'transparent',
                color: '#9196c0',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '15px',
                letterSpacing: '0.08em',
                border: '1px solid #2d3270',
                borderRadius: '14px',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
                transition: 'all 200ms',
              }}
            >
              Launch a Signal
            </motion.button>
          </Link>

          <Link href="/positions" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(99,102,241,0.1)', borderColor: '#2d3270', color: '#f0f1ff' }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '16px 36px',
                background: 'transparent',
                color: '#454878',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '15px',
                letterSpacing: '0.08em',
                border: '1px solid #1e2245',
                borderRadius: '14px',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
                transition: 'all 200ms',
              }}
            >
              My Portfolio
            </motion.button>
          </Link>
        </motion.div>

        {/* Subtle faucet note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{ marginTop: '28px' }}
        >
          <a href={RITUAL_FAUCET} target="_blank" rel="noopener noreferrer"
            style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#2d3270' }}>
            Need testnet RITUAL? Get it at the faucet ↗
          </a>
        </motion.div>
      </section>

      {/* ── STATS STRIP ── */}
      <section style={{
        background:   'rgba(255,255,255,0.02)',
        borderTop:    '1px solid #1e2245',
        borderBottom: '1px solid #1e2245',
        padding:      '32px 24px',
      }}>
        <div style={{
          maxWidth: '1000px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px',
          textAlign: 'center',
        }}>
          {stats.map(s => (
            <div key={s.label}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#454878', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                {s.label}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '22px', fontWeight: 700, color: '#6366f1' }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ maxWidth: '1100px', margin: '80px auto', padding: '0 24px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: 700, color: '#f0f1ff', textAlign: 'center', marginBottom: '48px' }}>
          How It Works
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {[
            { icon: '◈', title: 'DEPLOY', desc: 'Define a yes/no signal with an oracle URL and threshold. The Scheduler books automatic settlement on-chain.' },
            { icon: '◉', title: 'STAKE', desc: 'Back YES or NO with RITUAL tokens. Pari-mutuel — stakers on the winning side share the entire pool.' },
            { icon: '⬡', title: 'AUTO-SETTLE', desc: 'No human input needed. The on-chain Scheduler wakes the contract at a fixed block, fetches the oracle via TEE, and settles autonomously.' },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              viewport={{ once: true }}
            >
              <GlowCard hoverable>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>{card.icon}</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, color: '#6366f1', marginBottom: '10px' }}>
                  {card.title}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: '#9196c0', lineHeight: 1.6 }}>
                  {card.desc}
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── LIVE SIGNALS ── */}
      <section style={{ maxWidth: '1100px', margin: '0 auto 80px', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 700, color: '#f0f1ff', margin: 0 }}>
            LIVE SIGNALS
          </h2>
          <Link href="/markets" style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: '#6366f1', textDecoration: 'none' }}>
            View All →
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {recentMarkets.length === 0
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1e2245', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="skeleton" style={{ height: '18px' }} />
                  <div className="skeleton" style={{ height: '36px' }} />
                  <div className="skeleton" style={{ height: '10px', borderRadius: '999px' }} />
                </div>
              ))
            : recentMarkets.map(m => (
                <Link key={m.id.toString()} href={`/markets/${m.id}`} style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileHover={{ y: -2, boxShadow: '0 0 20px rgba(99,102,241,0.1)' }}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1e2245', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', cursor: 'pointer', transition: 'all 200ms' }}
                  >
                    <MarketStateBadge state={m.state} />
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 600, color: '#f0f1ff', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {m.question}
                    </div>
                    <OddsBar totalYes={m.totalYes} totalNo={m.totalNo} height={8} showLabels={false} />
                  </motion.div>
                </Link>
              ))
          }
        </div>
      </section>
    </motion.div>
  )
}
