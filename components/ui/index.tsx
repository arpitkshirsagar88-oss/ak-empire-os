'use client'
// ============================================================
// AK EMPIRE OS — COMPLETE UI COMPONENT LIBRARY
// ============================================================
import React, { useState, useRef, useEffect, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { X, ChevronDown, Check, Loader2 } from 'lucide-react'

// ─── BUTTON ──────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'ghost' | 'danger' | 'outline'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'ghost', size = 'md', loading, disabled, children, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed select-none'
    const variants = {
      gold: 'bg-gold-gradient text-bg hover:brightness-110 shadow-gold',
      ghost: 'bg-transparent text-ink-2 border border-border-2 hover:border-gold/40 hover:text-ink hover:bg-white/[0.03]',
      outline: 'bg-transparent border border-border-2 text-ink hover:border-gold/50',
      danger: 'bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/20',
    }
    const sizes = {
      xs: 'px-2.5 py-1 text-[11px] gap-1',
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    }
    return (
      <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} disabled={disabled || loading} {...props}>
        {loading && <Loader2 className="animate-spin" size={14} />}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

// ─── BADGE / TAG ─────────────────────────────────────────────
interface BadgeProps { label: string; color?: 'gold' | 'green' | 'blue' | 'red' | 'purple' | 'gray' | 'orange'; size?: 'sm' | 'md' }
export function Badge({ label, color = 'gray', size = 'sm' }: BadgeProps) {
  const colors = {
    gold: 'bg-gold/10 text-gold-2 border-gold/20',
    green: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    red: 'bg-red-500/10 text-red-300 border-red-500/20',
    purple: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    gray: 'bg-white/5 text-ink-2 border-border-2',
    orange: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
  }
  return (
    <span className={cn('inline-flex items-center border rounded-full font-medium', colors[color],
      size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs')}>
      {label}
    </span>
  )
}

// ─── CARD ─────────────────────────────────────────────────────
interface CardProps extends React.HTMLAttributes<HTMLDivElement> { gold?: boolean; hover?: boolean }
export function Card({ className, gold, hover, children, ...props }: CardProps) {
  return (
    <div className={cn('rounded-2xl border p-5 transition-all duration-200',
      gold ? 'bg-gradient-to-br from-gold/[0.06] to-transparent border-gold/25' : 'bg-bg-3 border-border',
      hover && 'hover:border-gold/30 hover:shadow-card cursor-pointer',
      className)} {...props}>
      {children}
    </div>
  )
}

// ─── STAT CARD ────────────────────────────────────────────────
interface StatCardProps { label: string; value: string | number; delta?: string; up?: boolean; gold?: boolean; icon?: React.ReactNode }
export function StatCard({ label, value, delta, up = true, gold = false, icon }: StatCardProps) {
  return (
    <Card gold={gold} className="relative overflow-hidden">
      <div className="flex items-start justify-between mb-3">
        <p className="text-[10px] font-semibold tracking-[1.5px] uppercase text-ink-3">{label}</p>
        {icon && <div className="text-gold/60">{icon}</div>}
      </div>
      <p className={cn('font-display text-3xl font-bold tracking-tight', gold ? 'text-gold' : 'text-ink')}>{value}</p>
      {delta && (
        <p className={cn('text-xs mt-1.5', up ? 'text-emerald-400' : 'text-red-400')}>
          {up ? '↑' : '↓'} {delta}
        </p>
      )}
    </Card>
  )
}

// ─── PROGRESS BAR ─────────────────────────────────────────────
interface ProgressProps { value: number; max?: number; label?: string; showPct?: boolean; size?: 'xs' | 'sm' | 'md' }
export function ProgressBar({ value, max = 100, label, showPct = true, size = 'sm' }: ProgressProps) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  const h = size === 'xs' ? 'h-1' : size === 'sm' ? 'h-1.5' : 'h-2.5'
  return (
    <div className="w-full">
      {(label || showPct) && (
        <div className="flex justify-between mb-1.5">
          {label && <span className="text-xs text-ink-2">{label}</span>}
          {showPct && <span className="text-xs font-semibold text-gold-2">{pct}%</span>}
        </div>
      )}
      <div className={cn('w-full bg-border rounded-full overflow-hidden', h)}>
        <div className={cn('h-full rounded-full transition-all duration-700 ease-out', h)}
          style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #c8a45a, #e0c078)' }} />
      </div>
    </div>
  )
}

// ─── SECTION TITLE ────────────────────────────────────────────
export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <h3 className="text-[10px] font-bold tracking-[2px] uppercase text-gold">{children}</h3>
        <div className="flex-1 h-px bg-gradient-to-r from-gold-dim to-transparent w-16" />
      </div>
      {action}
    </div>
  )
}

// ─── MODAL / DIALOG ───────────────────────────────────────────
interface ModalProps { open: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl' }
export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null
  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className={cn('relative w-full bg-bg-3 border border-border-2 rounded-2xl shadow-panel animate-in', widths[size])}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-display text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-ink-3 hover:text-ink transition-colors p-1">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

// ─── INPUT FIELD ──────────────────────────────────────────────
interface FieldProps { label?: string; error?: string; required?: boolean; children: React.ReactNode; className?: string }
export function Field({ label, error, required, children, className }: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <label className="block text-xs font-medium text-ink-2">{label}{required && <span className="text-gold ml-1">*</span>}</label>}
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

// ─── TEXTAREA ─────────────────────────────────────────────────
export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn('min-h-[100px] resize-y', className)} {...props} />
  )
)
Textarea.displayName = 'Textarea'

// ─── SELECT ───────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> { options: { value: string; label: string }[] }
export function Select({ options, className, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select className={cn('appearance-none pr-8 cursor-pointer', className)} {...props}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" size={14} />
    </div>
  )
}

// ─── EMPTY STATE ──────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }: { icon: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4 opacity-40">{icon}</div>
      <h3 className="font-display text-lg text-ink mb-2">{title}</h3>
      <p className="text-sm text-ink-3 mb-6 max-w-sm">{description}</p>
      {action}
    </div>
  )
}

// ─── SEARCH BAR ───────────────────────────────────────────────
export function SearchBar({ value, onChange, placeholder = 'Search...' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3 text-sm">🔍</span>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="pl-9 pr-4" />
    </div>
  )
}

// ─── SCORE DISPLAY ────────────────────────────────────────────
export function ScoreChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center bg-bg-4 border border-border rounded-xl p-3">
      <span className="font-display text-2xl font-bold text-gold">{value}</span>
      <span className="text-[9px] font-semibold tracking-widest uppercase text-ink-3 mt-0.5">{label}</span>
    </div>
  )
}

// ─── TABS ─────────────────────────────────────────────────────
interface TabsProps { tabs: { id: string; label: string }[]; active: string; onChange: (id: string) => void }
export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 bg-bg-3 border border-border rounded-xl p-1 w-fit">
      {tabs.map(tab => (
        <button key={tab.id} onClick={() => onChange(tab.id)}
          className={cn('px-4 py-1.5 rounded-lg text-xs font-medium transition-all',
            active === tab.id ? 'bg-gold/15 text-gold' : 'text-ink-3 hover:text-ink-2')}>
          {tab.label}
        </button>
      ))}
    </div>
  )
}

// ─── TOAST NOTIFICATION ───────────────────────────────────────
export function useToast() {
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([])
  const toast = {
    success: (message: string) => {
      const id = Math.random().toString()
      setToasts(t => [...t, { id, message, type: 'success' }])
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000)
    },
    error: (message: string) => {
      const id = Math.random().toString()
      setToasts(t => [...t, { id, message, type: 'error' }])
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000)
    },
  }
  const ToastContainer = () => (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id} className={cn('px-4 py-3 rounded-xl border text-sm font-medium shadow-panel animate-in',
          t.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' :
          t.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-300' :
          'bg-bg-3 border-border text-ink')}>
          {t.message}
        </div>
      ))}
    </div>
  )
  return { toast, ToastContainer }
}

// ─── GOLD LINE DIVIDER ────────────────────────────────────────
export function GoldLine({ width = 40 }: { width?: number }) {
  return <div style={{ width, height: 2, background: 'linear-gradient(90deg, #c8a45a, transparent)', marginTop: 8 }} />
}

// ─── CONFIRM DIALOG ───────────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, message }: {
  open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-ink-2 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="danger" onClick={() => { onConfirm(); onClose() }}>Delete</Button>
      </div>
    </Modal>
  )
}

// ─── AI STREAMING CHAT ────────────────────────────────────────
interface AIChatProps {
  systemPrompt: string
  placeholder?: string
  title?: string
  initialMessage?: string
}

export function AIChat({ systemPrompt, placeholder = 'Ask your AI...', title = 'Empire AI', initialMessage }: AIChatProps) {
  const [msgs, setMsgs] = useState<{ role: 'user' | 'ai'; text: string }[]>(
    initialMessage ? [{ role: 'ai', text: initialMessage }] : []
  )
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMsgs(m => [...m, { role: 'user', text: userMsg }])
    setLoading(true)
    setMsgs(m => [...m, { role: 'ai', text: '' }])
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, message: userMsg }),
      })
      if (!res.ok) throw new Error('API error')
      const reader = res.body!.getReader()
      const dec = new TextDecoder()
      let full = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += dec.decode(value)
        setMsgs(m => { const copy = [...m]; copy[copy.length - 1] = { role: 'ai', text: full }; return copy })
      }
    } catch (e) {
      setMsgs(m => { const copy = [...m]; copy[copy.length - 1] = { role: 'ai', text: 'Sorry, AI is unavailable. Check your API key.' }; return copy })
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-full">
      <SectionTitle>{title}</SectionTitle>
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-[200px]">
        {msgs.length === 0 && (
          <p className="text-center text-ink-3 text-sm py-12">Ask your AI anything...</p>
        )}
        {msgs.map((m, i) => (
          <div key={i}>
            <p className={cn('text-[10px] font-bold tracking-widest uppercase mb-1.5', m.role === 'ai' ? 'text-gold' : 'text-ink-3')}>
              {m.role === 'ai' ? 'Empire AI' : 'You'}
            </p>
            <div className={cn('text-sm rounded-xl px-4 py-3 border leading-relaxed whitespace-pre-wrap',
              m.role === 'ai' ? 'bg-bg-4 border-border text-ink-2' : 'bg-gold/[0.07] border-gold/15 text-ink')}>
              {m.text || <span className="opacity-40 italic">Thinking...</span>}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} placeholder={placeholder}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()} className="flex-1" />
        <Button variant="gold" size="sm" onClick={send} loading={loading}>Send ↗</Button>
      </div>
    </div>
  )
}
