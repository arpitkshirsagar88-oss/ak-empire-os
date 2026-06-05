'use client'
import { useEffect, useState } from 'react'
import { useStore } from '@/store'
import { Content as ContentDB, Goals as GoalsDB } from '@/lib/db'
import { Card, StatCard, SectionTitle, GoldLine, Button } from '@/components/ui'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { formatNumber } from '@/lib/utils'
import { Sparkles } from 'lucide-react'

const GOLD = '#c8a45a'
const GOLD2 = '#e0c078'
const GREEN = '#4aad79'
const BLUE = '#4a8fe8'
const PURPLE = '#8b6fe8'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg-3 border border-border-2 rounded-xl px-3 py-2 text-xs">
      <p className="text-ink-3 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value?.toLocaleString()}</p>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const { profile, contentItems, goals, setContentItems, setGoals } = useStore()
  const [aiInsight, setAiInsight] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const uid = profile?.id ?? 'local'

  useEffect(() => {
    Promise.all([ContentDB.list(uid).then(setContentItems), GoalsDB.list(uid).then(setGoals)])
  }, [uid])

  // Derive pipeline distribution data
  const pipelineData = ['Idea','Research','Script','Thumbnail','Recording','Editing','Scheduled','Published'].map(stage => ({
    stage: stage.slice(0, 5),
    count: contentItems.filter(c => c.pipeline_stage === stage).length,
  }))

  // Content type breakdown
  const typeData = ['Long Video','Short','Reel','Tutorial','Documentary','Vlog'].map(type => ({
    name: type, value: contentItems.filter(c => c.content_type === type).length,
  })).filter(d => d.value > 0)

  // Goals by category
  const goalCatData = ['Art','Architecture','YouTube','Income','Learning','Health','Personal'].map(cat => ({
    cat: cat.slice(0, 6), active: goals.filter(g => g.category === cat && g.status === 'Active').length,
    completed: goals.filter(g => g.category === cat && g.status === 'Completed').length,
  })).filter(d => d.active + d.completed > 0)

  // Monthly content (last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i))
    const month = d.toISOString().slice(0, 7)
    return {
      month: d.toLocaleDateString('en', { month: 'short' }),
      published: contentItems.filter(c => c.published_date?.startsWith(month) || (c.pipeline_stage === 'Published' && c.created_at?.startsWith(month))).length,
      scheduled: contentItems.filter(c => c.scheduled_date?.startsWith(month)).length,
    }
  })

  // Goal completion rates
  const goalCompletionRate = goals.length ? Math.round((goals.filter(g => g.status === 'Completed').length / goals.length) * 100) : 0
  const avgGoalProgress = goals.filter(g => g.status === 'Active').length
    ? Math.round(goals.filter(g => g.status === 'Active').reduce((s, g) => s + Math.min(100, (g.current_value / (g.target_value || 1)) * 100), 0) / goals.filter(g => g.status === 'Active').length)
    : 0

  const PIE_COLORS = [GOLD, BLUE, PURPLE, GREEN, '#e85d4a', '#f59e0b']

  const generateInsight = async () => {
    setAiLoading(true); setAiInsight('')
    const summary = `Content items: ${contentItems.length} total, ${contentItems.filter(c=>c.pipeline_stage==='Published').length} published, ${contentItems.filter(c=>c.pipeline_stage==='Scheduled').length} scheduled. Goals: ${goals.length} total, ${goals.filter(g=>g.status==='Active').length} active, ${goalCompletionRate}% completion rate, avg progress ${avgGoalProgress}%. Content types: ${typeData.map(d=>`${d.name}:${d.value}`).join(', ')}.`
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: 'You are a data analyst and creative strategist for Arpit Kshirsagar, a YouTube creator and architect. Analyze the provided metrics and give 3 specific, actionable insights. Be direct and data-driven.',
          message: `Analyze my creator metrics and give me 3 key insights:\n${summary}`,
        }),
      })
      const reader = res.body!.getReader(); const dec = new TextDecoder(); let full = ''
      while (true) { const { done, value } = await reader.read(); if (done) break; full += dec.decode(value); setAiInsight(full) }
    } catch { setAiInsight('AI unavailable. Check API key.') }
    setAiLoading(false)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Analytics</h1>
        <p className="text-ink-3 text-sm mt-0.5">Performance overview across all your creative work</p>
        <GoldLine />
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Content" value={contentItems.length} delta={`${contentItems.filter(c=>c.pipeline_stage==='Published').length} published`} up gold />
        <StatCard label="Active Goals" value={goals.filter(g=>g.status==='Active').length} delta={`${goalCompletionRate}% completion rate`} up />
        <StatCard label="Avg Goal Progress" value={`${avgGoalProgress}%`} delta="across active goals" up />
        <StatCard label="In Production" value={contentItems.filter(c=>!['Published','Idea'].includes(c.pipeline_stage)).length} delta="pieces being made" up />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pipeline distribution */}
        <Card>
          <SectionTitle>Pipeline Distribution</SectionTitle>
          {contentItems.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-ink-3 text-sm">No content in pipeline yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={pipelineData} barCategoryGap="30%">
                <XAxis dataKey="stage" tick={{ fill: '#5c5a55', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#5c5a55', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(200,164,90,0.05)' }} />
                <Bar dataKey="count" fill={GOLD} radius={[4, 4, 0, 0]} name="Items" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Monthly content */}
        <Card>
          <SectionTitle>Content Activity (6 Months)</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyData}>
              <XAxis dataKey="month" tick={{ fill: '#5c5a55', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#5c5a55', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: GOLD, strokeWidth: 1, strokeDasharray: '3 3' }} />
              <Line type="monotone" dataKey="published" stroke={GREEN} strokeWidth={2} dot={{ fill: GREEN, r: 3 }} name="Published" />
              <Line type="monotone" dataKey="scheduled" stroke={GOLD} strokeWidth={2} dot={{ fill: GOLD, r: 3 }} name="Scheduled" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Content type pie */}
        <Card>
          <SectionTitle>Content Types</SectionTitle>
          {typeData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-ink-3 text-sm">No content yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={typeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {typeData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {typeData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs text-ink-3">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    {d.name}: {d.value}
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        {/* Goals by category */}
        <Card className="lg:col-span-2">
          <SectionTitle>Goals by Category</SectionTitle>
          {goalCatData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-ink-3 text-sm">No goals set yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={goalCatData} barCategoryGap="25%">
                <XAxis dataKey="cat" tick={{ fill: '#5c5a55', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#5c5a55', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(200,164,90,0.05)' }} />
                <Bar dataKey="active" fill={GOLD} radius={[3, 3, 0, 0]} name="Active" stackId="a" />
                <Bar dataKey="completed" fill={GREEN} radius={[3, 3, 0, 0]} name="Completed" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Goal Progress Table */}
      {goals.filter(g => g.status === 'Active').length > 0 && (
        <Card className="mb-6">
          <SectionTitle>Active Goal Progress</SectionTitle>
          <div className="space-y-3">
            {goals.filter(g => g.status === 'Active').sort((a,b) => b.priority - a.priority).map(goal => {
              const pct = Math.min(100, Math.round((goal.current_value / (goal.target_value || 1)) * 100))
              return (
                <div key={goal.id} className="flex items-center gap-4">
                  <div className="w-36 text-xs text-ink-2 truncate">{goal.title}</div>
                  <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${GOLD}, ${GOLD2})` }} />
                  </div>
                  <div className="text-xs font-bold text-gold w-10 text-right">{pct}%</div>
                  <div className="text-xs text-ink-3 w-28 text-right">{goal.current_value} / {goal.target_value} {goal.unit}</div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* AI Insights */}
      <Card gold>
        <div className="flex items-center justify-between mb-4">
          <SectionTitle>AI Performance Insights</SectionTitle>
          <Button variant="gold" size="sm" onClick={generateInsight} loading={aiLoading}>
            <Sparkles size={13} />Analyze
          </Button>
        </div>
        {aiInsight ? (
          <div className="text-sm text-ink-2 leading-relaxed whitespace-pre-wrap">
            {aiInsight}
            {aiLoading && <span className="animate-pulse text-gold">▋</span>}
          </div>
        ) : (
          <p className="text-ink-3 text-sm text-center py-6">Click Analyze to get AI-powered insights from your data</p>
        )}
      </Card>
    </div>
  )
}
