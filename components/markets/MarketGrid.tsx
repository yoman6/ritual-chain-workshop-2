'use client'
import { motion } from 'framer-motion'
import { MarketCard } from './MarketCard'
import type { Market } from '@/lib/types'

interface MarketGridProps {
  markets:   Market[]
  isLoading: boolean
}

function SkeletonCard() {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)', border: '1px solid #1a1a1a',
      borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className="skeleton" style={{ width: '70px', height: '22px' }} />
        <div className="skeleton" style={{ width: '30px', height: '16px' }} />
      </div>
      <div className="skeleton" style={{ height: '40px' }} />
      <div className="skeleton" style={{ height: '10px', borderRadius: '999px' }} />
      <div style={{ display: 'flex', gap: '12px' }}>
        <div className="skeleton" style={{ width: '80px', height: '16px' }} />
        <div className="skeleton" style={{ width: '80px', height: '16px' }} />
      </div>
      <div className="skeleton" style={{ height: '16px', width: '120px' }} />
    </div>
  )
}

export function MarketGrid({ markets, isLoading }: MarketGridProps) {
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  }

  if (isLoading) {
    return (
      <div style={gridStyle}>
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  return (
    <motion.div
      style={gridStyle}
      variants={{ show: { transition: { staggerChildren: 0.05 } } }}
      initial="hidden"
      animate="show"
    >
      {markets.map((m, i) => (
        <MarketCard key={m.id.toString()} market={m} index={i} />
      ))}
    </motion.div>
  )
}
