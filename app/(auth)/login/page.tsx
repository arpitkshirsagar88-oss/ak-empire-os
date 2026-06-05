'use client'
import { useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup' | 'magic'>('login')
  const [sent, setSent] = useState(false)
  const router = useRouter()

  const loginWithGoogle = async () => {
    setLoading(true)
    const sb = getSupabaseClient()
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
    if (error) { setError(error.message); setLoading(false) }
  }

  const loginWithEmail = async () => {
    setLoading(true); setError('')
    const sb = getSupabaseClient()
    const { error } = mode === 'signup'
      ? await sb.auth.signUp({ email, password })
      : await sb.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/dashboard')
  }

  const sendMagicLink = async () => {
    if (!email) { setError('Enter your email'); return }
    setLoading(true)
    const sb = getSupabaseClient()
    const { error } = await sb.auth.signInWithOtp({ email })
    if (error) { setError(error.message) } else { setSent(true) }
    setLoading(false)
  }

  const continueWithoutAuth = () => { router.push('/dashboard') }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gold-gradient mb-4 text-bg text-2xl font-bold shadow-gold">AK</div>
          <h1 className="font-display text-3xl font-bold text-gold-gradient mb-1">Empire OS</h1>
          <p className="text-ink-3 text-sm">Your creator operating system</p>
        </div>

        <div className="bg-bg-3 border border-border rounded-2xl p-6 shadow-panel space-y-4">
          {/* Google */}
          <Button variant="outline" className="w-full py-3" onClick={loginWithGoogle} loading={loading}>
            <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </Button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-ink-3">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {sent ? (
            <div className="text-center py-4">
              <p className="text-emerald-400 text-sm font-medium">Magic link sent to {email}</p>
              <p className="text-ink-3 text-xs mt-1">Check your email and click the link</p>
            </div>
          ) : (
            <>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email address" />
              {mode !== 'magic' && (
                <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" onKeyDown={e => e.key === 'Enter' && loginWithEmail()} />
              )}
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <Button variant="gold" className="w-full py-3" onClick={mode === 'magic' ? sendMagicLink : loginWithEmail} loading={loading}>
                {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Magic Link'}
              </Button>
              <div className="flex justify-between text-xs text-ink-3">
                <button onClick={() => setMode(m => m === 'login' ? 'signup' : 'login')} className="hover:text-ink transition-colors">
                  {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account?'}
                </button>
                <button onClick={() => setMode('magic')} className="hover:text-gold transition-colors">Magic link</button>
              </div>
            </>
          )}
        </div>

        {/* Demo / offline mode */}
        <div className="mt-4 text-center">
          <button onClick={continueWithoutAuth} className="text-xs text-ink-3 hover:text-ink transition-colors underline underline-offset-2">
            Continue without account (offline mode)
          </button>
        </div>
      </div>
    </div>
  )
}
