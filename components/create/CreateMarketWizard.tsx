'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronRight, ChevronLeft, ExternalLink } from 'lucide-react'
import { GlowButton } from '@/components/ui/GlowButton'
import { GlowCard } from '@/components/ui/GlowCard'
import { ComparatorSelect } from './ComparatorSelect'
import { useCreateMarket } from '@/hooks/useCreateMarket'
import { useToast } from '@/components/ui/Toast'
import { useAppMode } from '@/contexts/AppModeContext'
import { COMPARATOR_SYM, COMPARATOR_LABELS, MIN_BETTING_SECONDS, MIN_RESOLVE_DELAY_SECONDS, MAX_MARKET_SECONDS } from '@/lib/constants'
import { blocksToHuman, explorerTx } from '@/lib/utils'
import type { Comparator } from '@/lib/types'
import Link from 'next/link'

const DEMO_BLOCK_TIME = 350n

const PRESETS = [
  { icon: '◈', label: 'SOL Signal', question: 'Will SOL/USD reach $300 at the time this signal resolves?' },
  { icon: '⬡', label: 'BTC Signal', question: 'Will BTC/USD surpass $120,000 before this signal closes?' },
  { icon: '✍',  label: 'Custom',    question: '' },
]

interface FormData {
  question:            string
  oracleUrl:           string
  jsonPath:            string
  target:              string
  comparator:          Comparator
  bettingSeconds:      number
  resolveDelaySeconds: number
}

const INIT: FormData = {
  question:            '',
  oracleUrl:           '',
  jsonPath:            '.price',
  target:              '',
  comparator:          1,
  bettingSeconds:      180,
  resolveDelaySeconds: 60,
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '32px' }}>
      {Array.from({ length: total }, (_, i) => {
        const done    = i < current
        const active  = i === current
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: done ? '#6366f1' : active ? 'rgba(99,102,241,0.12)' : 'transparent',
              border: `2px solid ${done || active ? '#6366f1' : '#2d3270'}`,
              fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700,
              color: done ? '#ffffff' : active ? '#6366f1' : '#454878',
              transition: 'all 300ms',
            }}>
              {done ? <Check size={14} /> : i + 1}
            </div>
            {i < total - 1 && (
              <div style={{ width: '40px', height: '2px', background: done ? '#6366f1' : '#1e2245', transition: 'background 300ms' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export function CreateMarketWizard() {
  const { mode }                    = useAppMode()
  const { createMarket, isPending } = useCreateMarket()
  const { toast }                   = useToast()

  const [step, setStep]       = useState(0)
  const [form, setForm]       = useState<FormData>(INIT)
  const [errors, setErrors]   = useState<Partial<Record<keyof FormData, string>>>({})
  const [direction, setDir]   = useState(1)
  const [success, setSuccess] = useState<{ hash: string; marketId: bigint } | null>(null)
  const [testResult, setTestResult] = useState<{ state: 'idle'|'loading'|'ok'|'cors'|'error'; data?: string; msg?: string }>({ state: 'idle' })

  const update = <K extends keyof FormData>(k: K, v: FormData[K]) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: undefined }))
  }

  const validate = (s: number): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {}
    if (s === 0) {
      if (!form.question.trim() || form.question.length < 10) e.question = 'Question must be 10–280 characters'
      if (form.question.length > 280) e.question = 'Maximum 280 characters'
    }
    if (s === 1) {
      if (!form.oracleUrl.startsWith('http')) e.oracleUrl = 'Must start with http:// or https://'
      if (form.oracleUrl.includes('localhost') || form.oracleUrl.includes('127.0.0.1')) e.oracleUrl = 'Cannot use localhost — TEE executor needs a public URL'
      if (!form.jsonPath.startsWith('.')) e.jsonPath = 'Must start with .'
      if (!form.target || isNaN(Number(form.target)) || Number(form.target) <= 0) e.target = 'Must be a positive integer'
    }
    if (s === 2) {
      if (form.bettingSeconds < MIN_BETTING_SECONDS || form.bettingSeconds > MAX_MARKET_SECONDS) e.bettingSeconds = `Must be ${MIN_BETTING_SECONDS}–${MAX_MARKET_SECONDS}s`
      if (form.resolveDelaySeconds < MIN_RESOLVE_DELAY_SECONDS) e.resolveDelaySeconds = `Minimum ${MIN_RESOLVE_DELAY_SECONDS}s`
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => { if (validate(step)) { setDir(1); setStep(s => s + 1) } }
  const prev = () => { setDir(-1); setStep(s => s - 1) }
  const goTo = (s: number) => { setDir(s > step ? 1 : -1); setStep(s) }

  const testOracle = async () => {
    setTestResult({ state: 'loading' })
    try {
      const res = await fetch(form.oracleUrl)
      const text = await res.text()
      setTestResult({ state: 'ok', data: text.slice(0, 300) })
    } catch (err: unknown) {
      const msg = (err as Error).message ?? ''
      if (msg.toLowerCase().includes('cors') || msg.toLowerCase().includes('failed to fetch')) {
        setTestResult({ state: 'cors', msg: 'CORS blocked — the TEE executor in the cloud may still reach this URL.' })
      } else {
        setTestResult({ state: 'error', msg: msg })
      }
    }
  }

  const handleSubmit = async () => {
    if (!validate(2)) return
    try {
      const res = await createMarket({
        question:            form.question,
        oracleUrl:           form.oracleUrl,
        jsonPath:            form.jsonPath,
        target:              BigInt(form.target),
        comparator:          form.comparator,
        bettingSeconds:      BigInt(form.bettingSeconds),
        resolveDelaySeconds: BigInt(form.resolveDelaySeconds),
      })
      if (res) {
        setSuccess({ hash: res.hash as string, marketId: res.marketId as bigint })
        toast.success('✓ Signal Deployed!', { txHash: res.hash as string })
      }
    } catch {
      toast.error('Failed to deploy signal')
    }
  }

  const humanBetting = blocksToHuman(BigInt(form.bettingSeconds * 1000) / DEMO_BLOCK_TIME, DEMO_BLOCK_TIME)
  const humanDelay   = blocksToHuman(BigInt(form.resolveDelaySeconds * 1000) / DEMO_BLOCK_TIME, DEMO_BLOCK_TIME)

  // Success state
  if (success) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
        <div style={{ fontSize: '56px' }}>🎉</div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: 700, color: '#6366f1' }}>
          Signal Deployed!
        </div>
        <GlowCard style={{ textAlign: 'left' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: '#6366f1' }}>
            ✓ Signal #{success.marketId?.toString()} is live
          </div>
          {success.hash && (
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#454878' }}>
              <span>{success.hash.slice(0, 20)}…</span>
              <a href={explorerTx(success.hash)} target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1', display: 'flex', alignItems: 'center', gap: '3px' }}>
                View on Explorer <ExternalLink size={11} />
              </a>
            </div>
          )}
        </GlowCard>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link href={`/markets/${success.marketId}`}>
            <GlowButton>VIEW SIGNAL →</GlowButton>
          </Link>
          <GlowButton variant="outline" onClick={() => { setForm(INIT); setStep(0); setSuccess(null) }}>
            DEPLOY ANOTHER
          </GlowButton>
        </div>
      </motion.div>
    )
  }

  const slides = [
    // Step 0 — Question
    <div key={0} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: 700, color: '#f0f1ff' }}>
        The Question
      </div>
      {/* Presets */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {PRESETS.map(p => (
          <button key={p.label} onClick={() => update('question', p.question)}
            style={{
              padding: '8px 14px', borderRadius: '8px', border: '1px solid #1e2245',
              background: form.question === p.question ? 'rgba(99,102,241,0.12)' : 'transparent',
              color: form.question === p.question ? '#6366f1' : '#9196c0',
              fontFamily: 'var(--font-body)', fontSize: '13px', cursor: 'pointer', transition: 'all 150ms',
            }}>
            {p.icon} {p.label}
          </button>
        ))}
      </div>
      <div>
        <textarea
          value={form.question}
          onChange={e => update('question', e.target.value)}
          maxLength={280}
          rows={4}
          placeholder="Will SOL/USD reach $300 at the time this signal resolves?"
          style={{
            width: '100%', padding: '14px', background: '#08091a', border: `1px solid ${errors.question ? '#f43f5e' : '#1e2245'}`,
            borderRadius: '10px', color: '#f0f1ff', fontFamily: 'var(--font-body)', fontSize: '15px',
            resize: 'vertical', outline: 'none', boxSizing: 'border-box', lineHeight: 1.6,
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
          {errors.question && <span style={{ color: '#f43f5e', fontSize: '12px', fontFamily: 'var(--font-body)' }}>{errors.question}</span>}
          <span style={{ color: form.question.length > 250 ? '#f59e0b' : '#454878', fontSize: '12px', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>
            {form.question.length}/280
          </span>
        </div>
      </div>
    </div>,

    // Step 1 — Oracle
    <div key={1} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: 700, color: '#f0f1ff' }}>
        The Oracle
      </div>
      <div>
        <label style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#9196c0', display: 'block', marginBottom: '6px' }}>Oracle URL</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            value={form.oracleUrl}
            onChange={e => update('oracleUrl', e.target.value)}
            placeholder="https://your-tunnel.trycloudflare.com/api/oracle/eth"
            style={{
              flex: 1, padding: '12px 14px', background: '#08091a',
              border: `1px solid ${errors.oracleUrl ? '#f43f5e' : '#1e2245'}`, borderRadius: '10px',
              color: '#f0f1ff', fontFamily: 'var(--font-mono)', fontSize: '13px', outline: 'none',
            }}
          />
          <GlowButton variant="outline" size="sm" loading={testResult.state === 'loading'} onClick={testOracle}>
            TEST
          </GlowButton>
        </div>
        {errors.oracleUrl && <div style={{ color: '#f43f5e', fontSize: '12px', marginTop: '4px', fontFamily: 'var(--font-body)' }}>{errors.oracleUrl}</div>}
        {testResult.state === 'ok' && (
          <pre style={{ marginTop: '8px', padding: '10px', background: '#08091a', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '8px', fontSize: '12px', color: '#6366f1', fontFamily: 'var(--font-mono)', overflow: 'auto', maxHeight: '100px' }}>
            {testResult.data}
          </pre>
        )}
        {testResult.state === 'cors' && (
          <div style={{ marginTop: '8px', padding: '8px 12px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', color: '#f59e0b', fontSize: '12px', fontFamily: 'var(--font-body)' }}>
            ⚠ {testResult.msg}
          </div>
        )}
        {testResult.state === 'error' && (
          <div style={{ marginTop: '8px', padding: '8px 12px', background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '8px', color: '#f43f5e', fontSize: '12px', fontFamily: 'var(--font-body)' }}>
            ✕ {testResult.msg}
          </div>
        )}
      </div>
      <div>
        <label style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#9196c0', display: 'block', marginBottom: '6px' }}>jq Path</label>
        <input
          value={form.jsonPath}
          onChange={e => update('jsonPath', e.target.value)}
          placeholder=".price"
          style={{
            width: '100%', padding: '12px 14px', background: '#08091a',
            border: `1px solid ${errors.jsonPath ? '#f43f5e' : '#1e2245'}`, borderRadius: '10px',
            color: '#6366f1', fontFamily: 'var(--font-mono)', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
          }}
        />
        {errors.jsonPath && <div style={{ color: '#f43f5e', fontSize: '12px', marginTop: '4px', fontFamily: 'var(--font-body)' }}>{errors.jsonPath}</div>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#9196c0', display: 'block', marginBottom: '6px' }}>Target Value</label>
          <input
            type="number"
            value={form.target}
            onChange={e => update('target', e.target.value)}
            placeholder="4000"
            style={{
              width: '100%', padding: '12px 14px', background: '#08091a',
              border: `1px solid ${errors.target ? '#f43f5e' : '#1e2245'}`, borderRadius: '10px',
              color: '#f0f1ff', fontFamily: 'var(--font-mono)', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
            }}
          />
          {errors.target && <div style={{ color: '#f43f5e', fontSize: '12px', marginTop: '4px', fontFamily: 'var(--font-body)' }}>{errors.target}</div>}
        </div>
        <div>
          <label style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#9196c0', display: 'block', marginBottom: '6px' }}>Comparator</label>
          <ComparatorSelect value={form.comparator} onChange={v => update('comparator', v)} />
        </div>
      </div>
      {/* Rule preview */}
      {form.target && (
        <div style={{ padding: '10px 14px', background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: '8px', fontFamily: 'var(--font-body)', fontSize: '13px', color: '#9196c0' }}>
          📋 This signal resolves YES if observed value{' '}
          <strong style={{ color: '#6366f1', fontFamily: 'var(--font-mono)' }}>{COMPARATOR_SYM[form.comparator]} {form.target}</strong>
        </div>
      )}
    </div>,

    // Step 2 — Timeline
    <div key={2} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: 700, color: '#f0f1ff' }}>
        The Timeline
      </div>
      <div>
        <label style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#9196c0', display: 'block', marginBottom: '6px' }}>
          Staking Window (seconds)
        </label>
        <input
          type="number"
          min={MIN_BETTING_SECONDS}
          max={MAX_MARKET_SECONDS}
          value={form.bettingSeconds}
          onChange={e => update('bettingSeconds', Number(e.target.value))}
          style={{
            width: '100%', padding: '12px 14px', background: '#08091a',
            border: `1px solid ${errors.bettingSeconds ? '#f43f5e' : '#1e2245'}`, borderRadius: '10px',
            color: '#f0f1ff', fontFamily: 'var(--font-mono)', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
          }}
        />
        <div style={{ color: '#454878', fontSize: '12px', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>~{humanBetting}</div>
        {errors.bettingSeconds && <div style={{ color: '#f43f5e', fontSize: '12px', fontFamily: 'var(--font-body)' }}>{errors.bettingSeconds}</div>}
      </div>
      <div>
        <label style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#9196c0', display: 'block', marginBottom: '6px' }}>
          Resolve Delay (seconds)
        </label>
        <input
          type="number"
          min={MIN_RESOLVE_DELAY_SECONDS}
          value={form.resolveDelaySeconds}
          onChange={e => update('resolveDelaySeconds', Number(e.target.value))}
          style={{
            width: '100%', padding: '12px 14px', background: '#08091a',
            border: `1px solid ${errors.resolveDelaySeconds ? '#f43f5e' : '#1e2245'}`, borderRadius: '10px',
            color: '#f0f1ff', fontFamily: 'var(--font-mono)', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
          }}
        />
        <div style={{ color: '#454878', fontSize: '12px', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>~{humanDelay}</div>
        {errors.resolveDelaySeconds && <div style={{ color: '#f43f5e', fontSize: '12px', fontFamily: 'var(--font-body)' }}>{errors.resolveDelaySeconds}</div>}
      </div>
      {/* Visual timeline */}
      <div style={{ padding: '16px', background: '#08091a', border: '1px solid #1e2245', borderRadius: '10px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#9196c0', display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
          <span style={{ color: '#454878' }}>NOW</span>
          <span style={{ flex: 1, height: '2px', background: 'linear-gradient(90deg, #6366f1, #1e2245)', minWidth: '30px' }} />
          <span style={{ color: '#f59e0b' }}>[staking: {humanBetting}]</span>
          <span style={{ flex: 1, height: '2px', background: '#1e2245', minWidth: '30px' }} />
          <span style={{ color: '#454878' }}>CLOSE</span>
          <span style={{ flex: 1, height: '2px', background: '#1e2245', minWidth: '30px' }} />
          <span style={{ color: '#f97316' }}>[delay: {humanDelay}]</span>
          <span style={{ flex: 1, height: '2px', background: '#1e2245', minWidth: '30px' }} />
          <span style={{ color: '#6366f1' }}>⬡ SETTLE</span>
        </div>
      </div>
      <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid #1e2245', borderRadius: '8px', fontFamily: 'var(--font-body)', fontSize: '12px', color: '#454878' }}>
        ℹ Up to 3 automatic settlement attempts, 200 blocks apart (~70s each at 350ms/block)
      </div>
    </div>,

    // Step 3 — Review & Deploy
    <div key={3} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: 700, color: '#f0f1ff' }}>
        Review & Deploy
      </div>
      <GlowCard padding="20px">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[
            { label: 'Question', value: form.question, step: 0 },
            { label: 'Oracle URL', value: form.oracleUrl, step: 1, mono: true },
            { label: 'jq Path', value: form.jsonPath, step: 1, mono: true },
            { label: 'Target', value: form.target, step: 1, mono: true },
            { label: 'Comparator', value: `${COMPARATOR_SYM[form.comparator]} (${COMPARATOR_LABELS[form.comparator]})`, step: 1, mono: true },
            { label: 'Staking Window', value: `${form.bettingSeconds}s (~${humanBetting})`, step: 2, mono: true },
            { label: 'Resolve Delay', value: `${form.resolveDelaySeconds}s (~${humanDelay})`, step: 2, mono: true },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', borderBottom: '1px solid #1e2245', paddingBottom: '10px' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#454878', flexShrink: 0 }}>{row.label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'right' }}>
                <span style={{ fontFamily: row.mono ? 'var(--font-mono)' : 'var(--font-body)', fontSize: '13px', color: '#f0f1ff', wordBreak: 'break-all' }}>
                  {row.value || '—'}
                </span>
                <button onClick={() => goTo(row.step)} style={{ color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', fontFamily: 'var(--font-body)', flexShrink: 0 }}>
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </GlowCard>
      <GlowButton fullWidth loading={isPending} onClick={handleSubmit} size="lg">
        {isPending ? 'DEPLOYING SIGNAL...' : mode === 'demo' ? 'DEPLOY SIGNAL (SANDBOX)' : 'DEPLOY SIGNAL'}
      </GlowButton>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#2d3270', textAlign: 'center' }}>
        This sends a transaction deploying the signal and pre-booking automatic settlement with the Ritual Scheduler.
      </p>
    </div>,
  ]

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <StepIndicator current={step} total={4} />
      <GlowCard padding="32px">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.25 }}
          >
            {slides[step]}
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px', gap: '12px' }}>
          {step > 0 ? (
            <GlowButton variant="ghost" onClick={prev} size="sm">
              <ChevronLeft size={16} /> Back
            </GlowButton>
          ) : <div />}
          {step < 3 && (
            <GlowButton onClick={next} size="sm">
              Next <ChevronRight size={16} />
            </GlowButton>
          )}
        </div>
      </GlowCard>
    </div>
  )
}
