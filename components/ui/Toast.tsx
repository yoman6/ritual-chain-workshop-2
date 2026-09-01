'use client'
import { useEffect, useState } from 'react'
import { create } from 'zustand'
import { explorerTx } from '@/lib/utils'
import { X, CheckCircle, AlertCircle, AlertTriangle, ExternalLink } from 'lucide-react'

interface Toast {
  id:      string
  type:    'success' | 'error' | 'warning'
  title:   string
  body?:   string
  txHash?: string
}

interface ToastStore {
  toasts:       Toast[]
  addToast:     (t: Omit<Toast, 'id'>) => void
  removeToast:  (id: string) => void
}

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (t) => {
    const id = Math.random().toString(36).slice(2)
    set(s => ({ toasts: [...s.toasts, { ...t, id }] }))
    // Auto-dismiss
    const delay = t.type === 'success' ? 8000 : t.type === 'error' ? 12000 : 10000
    setTimeout(() => {
      set(s => ({ toasts: s.toasts.filter(x => x.id !== id) }))
    }, delay)
  },
  removeToast: (id) => set(s => ({ toasts: s.toasts.filter(x => x.id !== id) })),
}))

export function useToast() {
  const addToast = useToastStore(s => s.addToast)
  const toast = {
    success: (title: string, opts?: { body?: string; txHash?: string }) =>
      addToast({ type: 'success', title, ...opts }),
    error: (title: string, opts?: { body?: string; txHash?: string }) =>
      addToast({ type: 'error', title, ...opts }),
    warning: (title: string, opts?: { body?: string; txHash?: string }) =>
      addToast({ type: 'warning', title, ...opts }),
  } as const
  return { toast }
}

const TYPE_CONFIG = {
  success: { color: '#6366f1', Icon: CheckCircle },
  error:   { color: '#f43f5e', Icon: AlertCircle },
  warning: { color: '#f59e0b', Icon: AlertTriangle },
}

function ToastItem({ t, onRemove }: { t: Toast; onRemove: () => void }) {
  const [visible, setVisible] = useState(true)
  const cfg = TYPE_CONFIG[t.type]

  const dismiss = () => {
    setVisible(false)
    setTimeout(onRemove, 300)
  }

  return (
    <div
      style={{
        maxWidth:     '380px',
        background:   'rgba(10,11,30,0.98)',
        border:       `1px solid ${cfg.color}30`,
        borderLeft:   `4px solid ${cfg.color}`,
        borderRadius: '12px',
        backdropFilter: 'blur(20px)',
        padding:      '14px 16px',
        display:      'flex',
        gap:          '12px',
        alignItems:   'flex-start',
        animation:    visible ? 'toastIn 0.3s ease forwards' : 'toastOut 0.3s ease forwards',
        boxShadow:    `0 8px 32px rgba(0,0,0,0.6), 0 0 20px ${cfg.color}10`,
      }}
    >
      <cfg.Icon size={18} color={cfg.color} style={{ flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px', color: '#fff' }}>
          {t.title}
        </div>
        {t.body && (
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#a0a0a0', marginTop: '4px' }}>
            {t.body}
          </div>
        )}
        {t.txHash && (
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#555' }}>
              {t.txHash.slice(0, 14)}…
            </span>
            <a
              href={explorerTx(t.txHash)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#6366f1', fontSize: '11px' }}
            >
              View on Explorer <ExternalLink size={10} />
            </a>
          </div>
        )}
      </div>
      <button
        onClick={dismiss}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: 0, flexShrink: 0 }}
      >
        <X size={16} />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div
      style={{
        position: 'fixed',
        top:      '80px',
        right:    '24px',
        zIndex:   9000,
        display:  'flex',
        flexDirection: 'column',
        gap:      '10px',
        pointerEvents: 'none',
      }}
    >
      {toasts.map(t => (
        <div key={t.id} style={{ pointerEvents: 'auto' }}>
          <ToastItem t={t} onRemove={() => removeToast(t.id)} />
        </div>
      ))}
    </div>
  )
}
