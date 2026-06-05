'use client'
import { useEffect, useState } from 'react'
import { useStore } from '@/store'
import { Ideas, Artworks, ArchProjects, Goals, Tasks, Content } from '@/lib/db'
import { Card, StatCard, ProgressBar, SectionTitle, GoldLine, Button, Badge } from '@/components/ui'
import { progressPercent, formatDate, today } from '@/lib/utils'
import { Plus, CheckCircle2, Circle } from 'lucide-react'
import Link from 'next/link'
import type { Goal, Task } from '@/types'

export default function DashboardPage() {
  const { profile, ideas, artworks, archProjects, goals, tasks, contentItems, setIdeas, setArtworks, setArchProjects, setGoals, setTasks, setContentItems, upsertTask } = useStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const uid = profile?.id ?? 'local'
    Promise.all([
      Ideas.list(uid).then(setIdeas),
      Artworks.list(uid).then(setArtworks),
      ArchProjects.list(uid).then(setArchProjects),
      Goals.list(uid).then(setGoals),
      Tasks.list(uid).then(setTasks),
      Content.list(uid).then(setContentItems),
    ]).finally(() => setLoading(false))
  }, [profile?.id])

  const activeGoals = goals.filter(g => g.status === 'Active')
  const todayTasks = tasks.filter(t => t.status !== 'Done').slice(0, 5)
  const inPipeline = contentItems.filter(c => !['Published'].includes(c.pipeline_stage))
  const completedArtworks = artworks.filter(a => a.status === 'Completed').length
  const activeProjects = archProjects.filter(p => p.status !== 'Completed').length

  const toggleTask = async (task: Task) => {
    const updated = { ...task, status: task.status === 'Done' ? 'Todo' as const : 'Done' as const, completed_at: task.status !== 'Done' ? new Date().toISOString() : null }
    upsertTask(updated)
    await Tasks.save(updated)
  }

  const categoryGoals: Record<string, Goal[]> = {}
  activeGoals.forEach(g => { if (!categoryGoals[g.category]) categoryGoals[g.category] = []; categoryGoals[g.category].push(g) })

  const CATEGORY_ICONS: Record<string, string> = { Art: '🎨', Architecture: '🏛️', YouTube: '▶️', Income: '💰', Learning: '📚', Health: '💪', Personal: '✨' }

  if (loading) return <div className="flex items-center justify-center h-full"><div className="text-ink-3 text-sm animate-pulse">Loading your empire...</div></div>

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink mb-1">
            {profile ? `${profile.full_name?.split(' ')[0] ?? 'Creator'}` : 'Creator'} <span className="text-gold">Empire</span>
          </h1>
          <p className="text-ink-3 text-sm">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <GoldLine />
        </div>
        <div className="flex items-center gap-3">
          <Badge label={`🔥 ${profile?.upload_streak ?? 0} day streak`} color="gold" size="md" />
          <Badge label={`Score: ${profile?.content_score ?? 0}`} color="gray" size="md" />
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Ideas" value={ideas.length} delta={`${ideas.filter(i=>i.status==='Active').length} active`} up gold />
        <StatCard label="Active Goals" value={activeGoals.length} delta="being tracked" up />
        <StatCard label="Artworks Complete" value={completedArtworks} delta={`${artworks.length} total`} up />
        <StatCard label="In Pipeline" value={inPipeline.length} delta="content pieces" up />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <Card className="lg:col-span-1">
          <SectionTitle action={<Link href="/goals"><Button variant="ghost" size="xs"><Plus size={12} />Add</Button></Link>}>
            Today's Focus
          </SectionTitle>
          {todayTasks.length === 0 ? (
            <div className="text-center py-8 text-ink-3 text-sm">
              <p className="text-2xl mb-2">✓</p>All tasks done. Add new ones.
            </div>
          ) : (
            <div className="space-y-2">
              {todayTasks.map(task => (
                <div key={task.id} onClick={() => toggleTask(task)}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-bg-4 cursor-pointer transition-colors group">
                  {task.status === 'Done' ? (
                    <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Circle size={16} className="text-border-2 mt-0.5 flex-shrink-0 group-hover:text-gold/50 transition-colors" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${task.status === 'Done' ? 'line-through text-ink-3' : 'text-ink'}`}>{task.title}</p>
                    {task.due_date && <p className="text-[10px] text-ink-3 mt-0.5">Due {formatDate(task.due_date)}</p>}
                  </div>
                  <Badge label={task.priority} color={task.priority === 'Critical' ? 'red' : task.priority === 'High' ? 'orange' : 'gray'} />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Goals Progress */}
        <Card className="lg:col-span-2">
          <SectionTitle action={<Link href="/goals"><Button variant="ghost" size="xs">View All</Button></Link>}>
            Goal Progress
          </SectionTitle>
          {activeGoals.length === 0 ? (
            <div className="text-center py-8 text-ink-3 text-sm">
              <Link href="/goals"><Button variant="gold" size="sm">Set Your First Goal</Button></Link>
            </div>
          ) : (
            <div className="space-y-5">
              {activeGoals.slice(0, 5).map(goal => (
                <div key={goal.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{CATEGORY_ICONS[goal.category] ?? '🎯'}</span>
                      <span className="text-sm font-medium text-ink">{goal.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-ink-3">{goal.current_value} / {goal.target_value} {goal.unit}</span>
                      {goal.deadline && <Badge label={formatDate(goal.deadline)} color="gray" />}
                    </div>
                  </div>
                  <ProgressBar value={goal.current_value} max={goal.target_value} showPct />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Art Progress */}
        <Card>
          <SectionTitle action={<Link href="/art"><Button variant="ghost" size="xs">View All</Button></Link>}>
            Art Progress
          </SectionTitle>
          <div className="space-y-3">
            {[
              { label: 'Completed', val: completedArtworks, total: artworks.length },
              { label: 'In Progress', val: artworks.filter(a => a.status === 'In Progress').length, total: artworks.length },
              { label: 'Graphite', val: artworks.filter(a => a.medium === 'Graphite').length, total: artworks.length },
              { label: 'Sold', val: artworks.filter(a => a.sold).length, total: completedArtworks || 1 },
            ].map(item => (
              <ProgressBar key={item.label} label={item.label} value={item.val} max={item.total || 1} />
            ))}
          </div>
        </Card>

        {/* Architecture */}
        <Card>
          <SectionTitle action={<Link href="/architecture"><Button variant="ghost" size="xs">View All</Button></Link>}>
            Architecture
          </SectionTitle>
          <div className="space-y-3">
            {[
              { label: 'Academic', val: archProjects.filter(p => p.category === 'Academic').length },
              { label: 'Professional', val: archProjects.filter(p => p.category === 'Professional').length },
              { label: 'Competition', val: archProjects.filter(p => p.category === 'Competition').length },
              { label: 'Completed', val: archProjects.filter(p => p.status === 'Completed').length },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center py-1.5 border-b border-border last:border-0">
                <span className="text-xs text-ink-2">{item.label}</span>
                <span className="text-sm font-bold text-gold">{item.val}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Content Pipeline */}
        <Card>
          <SectionTitle action={<Link href="/pipeline"><Button variant="ghost" size="xs">View All</Button></Link>}>
            Pipeline
          </SectionTitle>
          <div className="space-y-2">
            {['Idea','Research','Script','Recording','Editing','Scheduled'].map(stage => {
              const count = contentItems.filter(c => c.pipeline_stage === stage).length
              return (
                <div key={stage} className="flex items-center gap-3">
                  <span className="text-[10px] text-ink-3 w-20 flex-shrink-0">{stage}</span>
                  <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-gold to-gold-2"
                      style={{ width: `${Math.min(100, count * 20)}%` }} />
                  </div>
                  <span className="text-xs font-bold text-gold w-4 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}
