'use client'
import { motion } from 'framer-motion'
import { CreateMarketWizard } from '@/components/create/CreateMarketWizard'
import { useAppMode } from '@/contexts/AppModeContext'

export default function CreatePage() {
  const { mode } = useAppMode()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}
      className="page-enter"
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '36px', fontWeight: 800, color: '#f0f1ff', margin: '0 0 12px', letterSpacing: '-1px' }}>
          DEPLOY A SIGNAL
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', color: '#9196c0', maxWidth: '480px', margin: '0 auto', lineHeight: 1.6 }}>
          Define a yes/no signal and connect it to an oracle endpoint. The Ritual Scheduler auto-settles it — no clicks, no centralized resolver.
        </p>
        {mode === 'demo' && (
          <div style={{
            display: 'inline-block', marginTop: '16px',
            padding: '6px 16px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.18)',
            borderRadius: '999px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#6366f1',
          }}>
            🔬 SANDBOX — No wallet needed. Transaction is simulated.
          </div>
        )}
      </div>

      <CreateMarketWizard />
    </motion.div>
  )
}
