'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'
import {
  LayoutDashboard, Lightbulb, Palette, Building2, Target,
  Calendar, GitBranch, Search, BarChart3, Sparkles, Brain,
  CheckSquare, LogOut, Menu, Flame
} from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/ideas', icon: Lightbulb, label: 'Idea Vault' },
  { href: '/art', icon: Palette, label: 'Art Portfolio' },
  { href: '/architecture', icon: Building2, label: 'Architecture' },
  { href: '/goals', icon: Target, label: 'Goals' },
  { href: '/content', icon: Calendar, label: 'Content Calendar' },
  { href: '/pipeline', icon: GitBranch, label: 'Pipeline' },
  { href: '/research', icon: Search, label: 'Research Hub' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/ai-studio', icon: Sparkles, label: 'AI Studio' },
  { href: '/brain', icon: Brain, label: 'Second Brain' },
  { href: '/ceo-review', icon: CheckSquare, label: 'CEO Review' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { profile, sidebarOpen, toggleSidebar } = useStore()
  const router = useRouter()

  const logout = async () => {
    const sb = getSupabaseClient()
    await sb.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className={cn(
      'flex flex-col h-screen bg-bg-2 border-r border-border flex-shrink-0 transition-all duration-300',
      sidebarOpen ? 'w-[220px]' : 'w-[60px]'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center text-bg text-sm font-bold flex-shrink-0">AK</div>
        {sidebarOpen && (
          <div className="min-w-0">
            <p className="text-[11px] font-bold tracking-wider text-gold truncate">Empire OS</p>
            <p className="text-[9px] text-ink-3 tracking-widest truncate">{profile?.full_name ?? 'Creator'}</p>
          </div>
        )}
        <button onClick={toggleSidebar} className="ml-auto text-ink-3 hover:text-ink transition-colors flex-shrink-0">
          <Menu size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-150 group',
                active
                  ? 'bg-gold/10 border border-gold/20 text-gold'
                  : 'text-ink-3 hover:text-ink hover:bg-white/[0.03] border border-transparent'
              )}>
              <Icon size={16} className="flex-shrink-0" />
              {sidebarOpen && <span className="text-[13px] font-medium truncate">{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Streak */}
      {sidebarOpen && (
        <div className="mx-3 mb-3 bg-gold/[0.08] border border-gold/20 rounded-xl p-3 flex items-center gap-3">
          <Flame size={18} className="text-gold flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-gold">{profile?.upload_streak ?? 0} day streak</p>
            <p className="text-[10px] text-ink-3">Keep creating 🔥</p>
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="px-2 pb-4">
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-ink-3 hover:text-red-400 hover:bg-red-500/[0.06] transition-all border border-transparent">
          <LogOut size={16} />
          {sidebarOpen && <span className="text-[13px]">Sign Out</span>}
        </button>
      </div>
    </aside>
  )
}
