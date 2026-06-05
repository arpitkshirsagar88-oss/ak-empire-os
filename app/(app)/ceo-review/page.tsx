'use client'
import { useEffect, useState } from 'react'
import { useStore } from '@/store'
import { DailyReviews } from '@/lib/db'
import { Card, StatCard, Button, SectionTitle, GoldLine, useToast, Textarea } from '@/components/ui'
import { cn, newId, today, formatDate } from '@/lib/utils'
import { Sparkles, CheckCircle2, Circle } from 'lucide-react'
import type { DailyReview } from '@/types'

const TABS = ['daily', 'weekly', 'quarterly'] as const
type Tab = typeof TABS[number]

export default function CEOReviewPage() {
  const { profile, dailyReviews, upsertDailyReview } = useStore()
  const [activeTab, setActiveTab] = useState<Tab>('daily')
  const [todayReview, setTodayReview] = useState<Partial<DailyReview>>({ published_today:'', learned_today:'', next_priority:'', mood_score:7, productivity_score:7, wins:[], challenges:[] })
  const [aiReport, setAiReport] = useState('')
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [winInput, setWinInput] = useState('')
  const [challengeInput, setChallengeInput] = useState('')
  const { toast, ToastContainer } = useToast()
  const uid = profile?.id ?? 'local'

  useEffect(() => {
    DailyReviews.getToday(uid).then(r => {
      if (r) { setTodayReview(r); setAiReport(r.ai_report ?? '') }
    })
  }, [uid])

  const saveReview = async () => {
    setSaving(true)
    const review: DailyReview = {
      id: todayReview.id ?? newId(),
      user_id: uid,
      review_date: today(),
      published_today: todayReview.published_today ?? null,
      learned_today: todayReview.learned_today ?? null,
      next_priority: todayReview.next_priority ?? null,
      mood_score: todayReview.mood_score ?? null,
      productivity_score: todayReview.productivity_score ?? null,
      wins: todayReview.wins ?? [],
      challenges: todayReview.challenges ?? [],
      ai_report: aiReport || null,
      created_at: todayReview.created_at ?? new Date().toISOString(),
    }
    upsertDailyReview(review)
    await DailyReviews.save(review)
    setSaving(false); toast.success('Review saved')
  }

  const generateReport = async () => {
    setGenerating(true); setAiReport('')
    const context = `Creator: ${profile?.full_name ?? 'Arpit Kshirsagar'}
Niche: Architecture, Hyperrealistic Art, Design
Published today: ${todayReview.published_today || 'nothing yet'}
Learned: ${todayReview.learned_today || 'not filled'}
Next priority: ${todayReview.next_priority || 'not set'}
Mood: ${todayReview.mood_score}/10
Productivity: ${todayReview.productivity_score}/10
Wins: ${(todayReview.wins ?? []).join(', ') || 'none listed'}
Challenges: ${(todayReview.challenges ?? []).join(', ') || 'none listed'}`

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: `You are a tough but empathetic CEO coach and creative director. Generate sharp, direct daily review reports for creators. Include: VERDICT (one word: Exceptional/Strong/Solid/Below-Par), KEY INSIGHT (the most important observation), ACTION ITEMS (3 specific things for tomorrow), PATTERN RECOGNITION (what this day says about your trajectory). Be honest, not motivational. Address by first name.`,
          message: `Generate my daily CEO review:\n${context}`,
        }),
      })
      const reader = res.body!.getReader()
      const dec = new TextDecoder()
      let full = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += dec.decode(value)
        setAiReport(full)
      }
    } catch (e) {
      setAiReport('AI report unavailable. Fill in your review and save manually.')
    }
    setGenerating(false)
  }

  const addWin = () => { if (!winInput.trim()) return; setTodayReview(r => ({ ...r, wins: [...(r.wins ?? []), winInput.trim()] })); setWinInput('') }
  const addChallenge = () => { if (!challengeInput.trim()) return; setTodayReview(r => ({ ...r, challenges: [...(r.challenges ?? []), challengeInput.trim()] })); setChallengeInput('') }

  const weeklyReviews = dailyReviews.slice(0, 7)
  const avgProductivity = weeklyReviews.length ? Math.round(weeklyReviews.reduce((s, r) => s + (r.productivity_score ?? 0), 0) / weeklyReviews.length) : 0

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <ToastContainer />
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">CEO Review System</h1>
        <p className="text-ink-3 text-sm mt-0.5">Operate your creative empire like a founder</p>
        <GoldLine />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn('px-5 py-2 rounded-xl text-sm font-medium border transition-all capitalize',
              activeTab === tab ? 'bg-gold/15 text-gold border-gold/30' : 'border-border text-ink-3 hover:text-ink')}>
            {tab} Review
          </button>
        ))}
      </div>

      {activeTab === 'daily' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Review Form */}
          <div className="space-y-4">
            <Card>
              <SectionTitle>Daily Review — {new Date().toLocaleDateString('en-IN', { weekday:'long', month:'long', day:'numeric' })}</SectionTitle>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-ink-2 mb-1.5">What was published today?</label>
                  <Textarea value={todayReview.published_today ?? ''} onChange={e => setTodayReview(r => ({...r, published_today: e.target.value}))} placeholder="Video title, initial views, CTR..." rows={2} />
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink-2 mb-1.5">What did I learn today?</label>
                  <Textarea value={todayReview.learned_today ?? ''} onChange={e => setTodayReview(r => ({...r, learned_today: e.target.value}))} placeholder="Key insight, lesson, pattern observed..." rows={2} />
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink-2 mb-1.5">What's my next priority?</label>
                  <Textarea value={todayReview.next_priority ?? ''} onChange={e => setTodayReview(r => ({...r, next_priority: e.target.value}))} placeholder="The single most important thing for tomorrow..." rows={2} />
                </div>

                {/* Scores */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-ink-2 mb-1.5">Mood: {todayReview.mood_score}/10</label>
                    <input type="range" min={1} max={10} value={todayReview.mood_score ?? 7} onChange={e => setTodayReview(r => ({...r, mood_score: Number(e.target.value)}))} className="w-full border-none bg-transparent p-0" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink-2 mb-1.5">Productivity: {todayReview.productivity_score}/10</label>
                    <input type="range" min={1} max={10} value={todayReview.productivity_score ?? 7} onChange={e => setTodayReview(r => ({...r, productivity_score: Number(e.target.value)}))} className="w-full border-none bg-transparent p-0" />
                  </div>
                </div>

                {/* Wins */}
                <div>
                  <label className="block text-xs font-medium text-ink-2 mb-1.5">Wins today</label>
                  <div className="flex gap-2 mb-2">
                    <input value={winInput} onChange={e => setWinInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addWin()} placeholder="Add a win..." className="flex-1" />
                    <Button variant="ghost" size="sm" onClick={addWin}>Add</Button>
                  </div>
                  <div className="space-y-1">
                    {(todayReview.wins ?? []).map((w, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-emerald-300 bg-emerald-500/5 border border-emerald-500/15 rounded-lg px-3 py-1.5">
                        <CheckCircle2 size={12} className="flex-shrink-0" />{w}
                        <button onClick={() => setTodayReview(r => ({ ...r, wins: (r.wins ?? []).filter((_,j)=>j!==i) }))} className="ml-auto text-ink-3 hover:text-red-400">×</button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Challenges */}
                <div>
                  <label className="block text-xs font-medium text-ink-2 mb-1.5">Challenges</label>
                  <div className="flex gap-2 mb-2">
                    <input value={challengeInput} onChange={e => setChallengeInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addChallenge()} placeholder="What was difficult?" className="flex-1" />
                    <Button variant="ghost" size="sm" onClick={addChallenge}>Add</Button>
                  </div>
                  <div className="space-y-1">
                    {(todayReview.challenges ?? []).map((c, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-red-300 bg-red-500/5 border border-red-500/15 rounded-lg px-3 py-1.5">
                        <Circle size={12} className="flex-shrink-0" />{c}
                        <button onClick={() => setTodayReview(r => ({ ...r, challenges: (r.challenges ?? []).filter((_,j)=>j!==i) }))} className="ml-auto text-ink-3 hover:text-red-400">×</button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="gold" onClick={generateReport} loading={generating} className="flex-1">
                    <Sparkles size={14} />Generate AI Report
                  </Button>
                  <Button variant="ghost" onClick={saveReview} loading={saving}>Save</Button>
                </div>
              </div>
            </Card>
          </div>

          {/* AI Report + Stats */}
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Mood" value={`${todayReview.mood_score ?? 0}/10`} gold />
              <StatCard label="Productivity" value={`${todayReview.productivity_score ?? 0}/10`} up />
              <StatCard label="7-Day Avg" value={`${avgProductivity}/10`} up />
            </div>

            <Card gold className="flex-1">
              <SectionTitle>AI CEO Report</SectionTitle>
              {aiReport ? (
                <div className="text-sm text-ink-2 leading-relaxed whitespace-pre-wrap">
                  {aiReport}
                  {generating && <span className="animate-pulse text-gold">▋</span>}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Sparkles size={28} className="text-gold/30 mb-3" />
                  <p className="text-ink-3 text-sm">Fill in your review and generate your AI CEO report</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'weekly' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <SectionTitle>This Week's Reviews</SectionTitle>
            {weeklyReviews.length === 0 ? (
              <p className="text-ink-3 text-sm text-center py-8">Complete daily reviews to see your weekly summary</p>
            ) : (
              <div className="space-y-3">
                {weeklyReviews.map(r => (
                  <div key={r.id} className="p-3 bg-bg-4 border border-border rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-ink">{formatDate(r.review_date)}</span>
                      <div className="flex gap-2">
                        <span className="text-[10px] text-emerald-400">😊 {r.mood_score}/10</span>
                        <span className="text-[10px] text-blue-400">⚡ {r.productivity_score}/10</span>
                      </div>
                    </div>
                    {r.learned_today && <p className="text-xs text-ink-3 line-clamp-2">{r.learned_today}</p>}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card gold>
            <SectionTitle>Weekly Summary</SectionTitle>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-bg-4 border border-border rounded-xl">
                  <div className="font-display text-2xl font-bold text-gold">{weeklyReviews.length}</div>
                  <div className="text-[10px] text-ink-3 uppercase tracking-wider mt-1">Days Reviewed</div>
                </div>
                <div className="text-center p-3 bg-bg-4 border border-border rounded-xl">
                  <div className="font-display text-2xl font-bold text-emerald-400">{avgProductivity}</div>
                  <div className="text-[10px] text-ink-3 uppercase tracking-wider mt-1">Avg Productivity</div>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-ink-2 mb-2">All Wins This Week</p>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {weeklyReviews.flatMap(r => r.wins).filter(Boolean).map((w, i) => (
                    <div key={i} className="text-xs text-emerald-300 flex items-center gap-2 py-1">
                      <CheckCircle2 size={10} />{w}
                    </div>
                  ))}
                  {weeklyReviews.flatMap(r => r.wins).length === 0 && <p className="text-xs text-ink-3">No wins logged yet</p>}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'quarterly' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <SectionTitle>Q{Math.ceil((new Date().getMonth() + 1) / 3)} Overview</SectionTitle>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <StatCard label="Total Reviews" value={dailyReviews.length} gold />
              <StatCard label="Avg Productivity" value={`${avgProductivity}/10`} up />
            </div>
            <div>
              <p className="text-xs text-ink-3 mb-3">Review Streak & Consistency</p>
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-gold to-gold-2 rounded-full" style={{ width: `${Math.min(100, (dailyReviews.length / 90) * 100)}%` }} />
              </div>
              <p className="text-xs text-ink-3 mt-1">{dailyReviews.length} of 90 days</p>
            </div>
          </Card>
          <Card gold>
            <SectionTitle>Quarterly Strategy</SectionTitle>
            <p className="text-xs text-ink-3 mb-4">Generate a strategic analysis based on your review history</p>
            <Button variant="gold" className="w-full" onClick={async () => {
              setGenerating(true); setAiReport('')
              try {
                const res = await fetch('/api/ai/chat', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    systemPrompt: 'You are a quarterly business strategy advisor for creative entrepreneurs.',
                    message: `I am Arpit Kshirsagar, creator covering architecture and hyperrealistic art. I have completed ${dailyReviews.length} daily reviews this quarter with an average productivity score of ${avgProductivity}/10. Generate my quarterly strategic review including: Q performance analysis, top patterns from my reviews, Q+1 strategic focus areas, growth trajectory assessment, and 3 key decisions I should make.`,
                  }),
                })
                const reader = res.body!.getReader()
                const dec = new TextDecoder()
                let full = ''
                while (true) {
                  const { done, value } = await reader.read()
                  if (done) break
                  full += dec.decode(value)
                  setAiReport(full)
                }
              } catch { setAiReport('AI unavailable') }
              setGenerating(false)
            }} loading={generating}>
              <Sparkles size={14} /> Generate Quarterly Report
            </Button>
            {aiReport && <div className="mt-4 text-sm text-ink-2 leading-relaxed whitespace-pre-wrap">{aiReport}</div>}
          </Card>
        </div>
      )}
    </div>
  )
}
