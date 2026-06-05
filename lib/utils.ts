import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { v4 as uuidv4 } from 'uuid'
import { format, formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const newId = () => uuidv4()

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—'
  try { return format(new Date(date), 'MMM d, yyyy') } catch { return '—' }
}

export function timeAgo(date: string): string {
  try { return formatDistanceToNow(new Date(date), { addSuffix: true }) } catch { return '' }
}

export function formatNumber(n: number | null | undefined): string {
  if (n == null) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

export function formatCurrency(n: number | null | undefined): string {
  if (n == null) return '—'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

export function progressPercent(current: number, target: number): number {
  if (!target) return 0
  return Math.min(100, Math.round((current / target) * 100))
}

export function today(): string {
  return new Date().toISOString().split('T')[0]
}

export function greetUser(name: string | null): string {
  const h = new Date().getHours()
  const g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  return `${g}, ${name?.split(' ')[0] ?? 'Creator'}.`
}

export const CATEGORY_COLORS: Record<string, string> = {
  Architecture: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
  Art: 'bg-purple-500/15 text-purple-300 border-purple-500/25',
  YouTube: 'bg-red-500/15 text-red-300 border-red-500/25',
  Business: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  'Personal Growth': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  Income: 'bg-green-500/15 text-green-300 border-green-500/25',
  Learning: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25',
  Health: 'bg-rose-500/15 text-rose-300 border-rose-500/25',
  Personal: 'bg-violet-500/15 text-violet-300 border-violet-500/25',
}

export const STATUS_COLORS: Record<string, string> = {
  Active: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  'In Progress': 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  Done: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
  Completed: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
  Archived: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25',
  Planned: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25',
  Published: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  Scheduled: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
  Idea: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25',
  Paused: 'bg-orange-500/15 text-orange-300 border-orange-500/25',
}

export const PIPELINE_STAGES = ['Idea','Research','Script','Thumbnail','Recording','Editing','Scheduled','Published'] as const
