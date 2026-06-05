'use client'
import { useEffect } from 'react'
import { useStore } from '@/store'
import { getSupabaseClient } from '@/lib/supabase-client'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import type { Profile } from '@/types'
import type { User } from '@supabase/supabase-js'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { setProfile } = useStore()

  useEffect(() => {
    const sb = getSupabaseClient()
    sb.auth.getUser().then(async ({ data }: { data: { user: User | null } }) => {
      if (!data.user) return
      const { data: profile } = await sb.from('profiles').select('*').eq('id', data.user.id).single()
      if (profile) setProfile(profile as Profile)
    })
    const { data: { subscription } } = sb.auth.onAuthStateChange(async (event: string, session: { user: User } | null) => {
      if (session?.user) {
        const { data: profile } = await sb.from('profiles').select('*').eq('id', session.user.id).single()
        if (profile) setProfile(profile as Profile)
      } else {
        setProfile(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [setProfile])

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
