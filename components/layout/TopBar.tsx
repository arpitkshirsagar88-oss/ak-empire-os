'use client'
import { usePathname } from 'next/navigation'
import { useStore } from '@/store'
import { greetUser } from '@/lib/utils'
import { Bell } from 'lucide-react'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard', '/ideas': 'Idea Vault', '/art': 'Art Portfolio',
  '/architecture': 'Architecture Vault', '/goals': 'Goal System', '/content': 'Content Calendar',
  '/pipeline': 'Content Pipeline', '/research': 'Research Hub', '/analytics': 'Analytics',
  '/ai-studio': 'AI Studio', '/brain': 'Second Brain', '/ceo-review': 'CEO Review',
}

export function TopBar() {
  const pathname = usePathname()
  const { profile } = useStore()
  const title = PAGE_TITLES[pathname] ?? 'AK Empire OS'

  return (
    <header className="h-14 border-b border-border bg-bg-2/80 backdrop-blur-sm flex items-center px-6 gap-4 flex-shrink-0 sticky top-0 z-30">
      <div className="flex-1">
        <h1 className="text-sm font-semibold text-ink">{title}</h1>
        {pathname === '/dashboard' && (
          <p className="text-[11px] text-ink-3">{greetUser(profile?.full_name ?? null)}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button className="text-ink-3 hover:text-ink transition-colors relative">
          <Bell size={18} />
        </button>
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="avatar" className="w-8 h-8 rounded-full border border-border-2 object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center text-bg text-xs font-bold">
            {profile?.full_name?.[0] ?? 'A'}
          </div>
        )}
      </div>
    </header>
  )
}
