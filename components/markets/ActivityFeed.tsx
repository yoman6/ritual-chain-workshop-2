'use client'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAppMode } from '@/contexts/AppModeContext'
import { formatRitual, shortAddr } from '@/lib/utils'
import { parseEther } from 'viem'

interface FeedEntry {
  id:     string
  addr:   string
  isYes:  boolean
  amount: bigint
  block:  bigint
}

const DEMO_FEEDS: Record<string, FeedEntry[]> = {
  '1': [
    { id: '1a', addr: '0xabc1...ef01', isYes: true,  amount: parseEther('0.5'),  block: 1_000_042n },
    { id: '1b', addr: '0xdef2...ab02', isYes: false, amount: parseEther('0.3'),  block: 1_000_038n },
    { id: '1c', addr: '0x123a...cd03', isYes: true,  amount: parseEther('1.2'),  block: 1_000_031n },
  ],
  '2': [
    { id: '2a', addr: '0xfeed...0001', isYes: false, amount: parseEther('0.8'),  block: 999_820n  },
    { id: '2b', addr: '0xfeed...0002', isYes: true,  amount: parseEther('0.4'),  block: 999_810n  },
  ],
  '4': [
    { id: '4a', addr: '0xdead...beef', isYes: true,  amount: parseEther('0.8'),  block: 994_900n  },
    { id: '4b', addr: '0xcafe...babe', isYes: false, amount: parseEther('0.6'),  block: 994_880n  },
  ],
}

export function ActivityFeed({ marketId }: { marketId: bigint }) {
  const { mode } = useAppMode()
  const [entries, setEntries] = useState<FeedEntry[]>([])

  useEffect(() => {
    if (mode === 'demo') {
      setEntries(DEMO_FEEDS[marketId.toString()] ?? [])
    }
  }, [mode, marketId])

  if (entries.length === 0) {
    return (
      <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#555', padding: '16px 0' }}>
        No activity yet.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
      <AnimatePresence>
        {entries.map(e => (
          <motion.div
            key={e.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 12px',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '8px',
              fontFamily: 'var(--font-mono)', fontSize: '12px',
            }}
          >
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
              background: e.isYes ? '#3b82f6' : '#f43f5e',
            }} />
            <span style={{ color: '#9196c0' }}>{e.addr}</span>
            <span style={{ color: '#454878' }}>→ staked</span>
            <span style={{ color: '#f0f1ff' }}>{formatRitual(e.amount, 3)} RITUAL</span>
            <span style={{ color: e.isYes ? '#3b82f6' : '#f43f5e', fontWeight: 700 }}>
              {e.isYes ? 'YES' : 'NO'}
            </span>
            <span style={{ color: '#2d3270', marginLeft: 'auto' }}>· block {e.block.toLocaleString()}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
