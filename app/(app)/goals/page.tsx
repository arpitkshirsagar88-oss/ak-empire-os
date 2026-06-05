'use client'
import { useEffect, useState, useMemo } from 'react'
import { useStore } from '@/store'
import { Goals as GoalsDB, Tasks as TasksDB } from '@/lib/db'
import { Card, StatCard, Button, Badge, Modal, Field, Select, EmptyState, SectionTitle, ConfirmDialog, useToast, Textarea, ProgressBar } from '@/components/ui'
import { cn, newId, formatDate, progressPercent } from '@/lib/utils'
import { Plus, Trash2, Edit3, CheckCircle2, Circle, Target } from 'lucide-react'
import type { Goal, GoalCategory, GoalStatus, Task, TaskPriority } from '@/types'

const GOAL_CATS: GoalCategory[] = ['Art', 'Architecture', 'YouTube', 'Income', 'Learning', 'Health', 'Personal']
const TASK_PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High', 'Critical']
const CAT_ICONS: Record<GoalCategory, string> = { Art:'🎨', Architecture:'🏛️', YouTube:'▶️', Income:'💰', Learning:'📚', Health:'💪', Personal:'✨' }

const EMPTY_GOAL = (): Partial<Goal> => ({
  title: '', description: '', category: 'YouTube', target_value: 100,
  current_value: 0, unit: 'units', deadline: '', status: 'Active', priority: 3
})

const EMPTY_TASK = (): Partial<Task> => ({
  title: '', description: '', category: 'General', priority: 'Medium', status: 'Todo', due_date: ''
})

export default function GoalsPage() {
  const { profile, goals, tasks, setGoals, setTasks, upsertGoal, removeGoal, upsertTask, removeTask } = useStore()
  const [loading, setLoading] = useState(true)
  const [goalModal, setGoalModal] = useState(false)
  const [taskModal, setTaskModal] = useState(false)
  const [editGoal, setEditGoal] = useState<Partial<Goal>>(EMPTY_GOAL())
  const [editTask, setEditTask] = useState<Partial<Task>>(EMPTY_TASK())
  const [isEditGoal, setIsEditGoal] = useState(false)
  const [isEditTask, setIsEditTask] = useState(false)
  const [catFilter, setCatFilter] = useState<GoalCategory | 'All'>('All')
  const [deleteGoalId, setDeleteGoalId] = useState<string | null>(null)
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'goals' | 'tasks'>('goals')
  const { toast, ToastContainer } = useToast()
  const uid = profile?.id ?? 'local'

  useEffect(() => {
    Promise.all([
      GoalsDB.list(uid).then(setGoals),
      TasksDB.list(uid).then(setTasks),
    ]).finally(() => setLoading(false))
  }, [uid])

  const filteredGoals = useMemo(() => goals.filter(g => catFilter === 'All' || g.category === catFilter), [goals, catFilter])
  const activeTasks = useMemo(() => tasks.filter(t => t.status !== 'Done'), [tasks])

  const openNewGoal = () => { setEditGoal(EMPTY_GOAL()); setIsEditGoal(false); setGoalModal(true) }
  const openEditGoal = (g: Goal) => { setEditGoal({ ...g }); setIsEditGoal(true); setGoalModal(true) }

  const saveGoal = async () => {
    if (!editGoal.title?.trim()) { toast.error('Title required'); return }
    setSaving(true)
    const goal: Goal = {
      id: isEditGoal ? editGoal.id! : newId(),
      user_id: uid,
      title: editGoal.title!,
      description: editGoal.description ?? null,
      category: editGoal.category as GoalCategory ?? 'Personal',
      target_value: Number(editGoal.target_value) || 100,
      current_value: Number(editGoal.current_value) || 0,
      unit: editGoal.unit || 'units',
      deadline: editGoal.deadline || null,
      status: editGoal.status as GoalStatus ?? 'Active',
      priority: Number(editGoal.priority) || 3,
      created_at: isEditGoal ? editGoal.created_at! : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    upsertGoal(goal); await GoalsDB.save(goal)
    setSaving(false); setGoalModal(false)
    toast.success(isEditGoal ? 'Goal updated' : 'Goal created')
  }

  const saveTask = async () => {
    if (!editTask.title?.trim()) { toast.error('Title required'); return }
    setSaving(true)
    const task: Task = {
      id: isEditTask ? editTask.id! : newId(),
      user_id: uid,
      goal_id: editTask.goal_id ?? null,
      title: editTask.title!,
      description: editTask.description ?? null,
      category: editTask.category || 'General',
      priority: editTask.priority as TaskPriority ?? 'Medium',
      status: editTask.status as any ?? 'Todo',
      due_date: editTask.due_date || null,
      completed_at: null,
      created_at: isEditTask ? editTask.created_at! : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    upsertTask(task); await TasksDB.save(task)
    setSaving(false); setTaskModal(false)
    toast.success(isEditTask ? 'Task updated' : 'Task added')
  }

  const toggleTask = async (task: Task) => {
    const updated = { ...task, status: task.status === 'Done' ? 'Todo' as const : 'Done' as const, completed_at: task.status !== 'Done' ? new Date().toISOString() : null }
    upsertTask(updated); await TasksDB.save(updated)
  }

  const updateGoalProgress = async (goal: Goal, delta: number) => {
    const updated = { ...goal, current_value: Math.max(0, Math.min(goal.target_value, goal.current_value + delta)), updated_at: new Date().toISOString() }
    upsertGoal(updated); await GoalsDB.save(updated)
  }

  if (loading) return <div className="flex items-center justify-center h-full"><p className="text-ink-3 animate-pulse">Loading goals...</p></div>

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ToastContainer />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Goal System</h1>
          <p className="text-ink-3 text-sm mt-0.5">{goals.filter(g=>g.status==='Active').length} active goals · {tasks.filter(t=>t.status!=='Done').length} open tasks</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => { setEditTask(EMPTY_TASK()); setIsEditTask(false); setTaskModal(true) }}><Plus size={15} />Task</Button>
          <Button variant="gold" onClick={openNewGoal}><Plus size={15} />New Goal</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Active Goals" value={goals.filter(g=>g.status==='Active').length} gold />
        <StatCard label="Completed Goals" value={goals.filter(g=>g.status==='Completed').length} up />
        <StatCard label="Open Tasks" value={activeTasks.length} up={activeTasks.length < 10} />
        <StatCard label="Done Today" value={tasks.filter(t=>t.completed_at?.startsWith(new Date().toISOString().split('T')[0])).length} up />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['goals', 'tasks'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn('px-5 py-2 rounded-xl text-sm font-medium border transition-all capitalize',
              activeTab === tab ? 'bg-gold/15 text-gold border-gold/30' : 'border-border text-ink-3 hover:text-ink')}>
            {tab} {tab === 'goals' ? `(${goals.length})` : `(${activeTasks.length})`}
          </button>
        ))}
      </div>

      {activeTab === 'goals' && (
        <>
          {/* Category filter */}
          <div className="flex gap-2 flex-wrap mb-5">
            {(['All', ...GOAL_CATS] as const).map(cat => (
              <button key={cat} onClick={() => setCatFilter(cat as any)}
                className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5',
                  catFilter === cat ? 'bg-gold/15 text-gold border-gold/30' : 'border-border text-ink-3 hover:text-ink')}>
                {cat !== 'All' && CAT_ICONS[cat as GoalCategory]} {cat}
              </button>
            ))}
          </div>

          {filteredGoals.length === 0 ? (
            <EmptyState icon="🎯" title="No goals yet" description="Set ambitious goals across art, architecture, YouTube, and income." action={<Button variant="gold" onClick={openNewGoal}><Plus size={15} />Set First Goal</Button>} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredGoals.sort((a,b) => b.priority - a.priority).map(goal => {
                const pct = progressPercent(goal.current_value, goal.target_value)
                return (
                  <Card key={goal.id} gold={pct >= 100} className="group hover:border-gold/30 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{CAT_ICONS[goal.category]}</span>
                        <div>
                          <h3 className="font-semibold text-ink text-sm">{goal.title}</h3>
                          <Badge label={goal.category} color="gray" />
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditGoal(goal)} className="text-ink-3 hover:text-gold transition-colors"><Edit3 size={14} /></button>
                        <button onClick={() => setDeleteGoalId(goal.id)} className="text-ink-3 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </div>

                    {goal.description && <p className="text-xs text-ink-3 mb-3 leading-relaxed">{goal.description}</p>}

                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-ink-3">{goal.current_value} / {goal.target_value} {goal.unit}</span>
                        <span className="font-bold text-gold">{pct}%</span>
                      </div>
                      <ProgressBar value={goal.current_value} max={goal.target_value} showPct={false} size="md" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {goal.deadline && <span className="text-[10px] text-ink-3">Due {formatDate(goal.deadline)}</span>}
                        <Badge label={goal.status} color={goal.status === 'Active' ? 'green' : goal.status === 'Completed' ? 'blue' : 'gray'} />
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => updateGoalProgress(goal, -1)} className="w-6 h-6 rounded-lg bg-bg-4 border border-border text-ink-3 hover:text-red-400 text-sm flex items-center justify-center transition-colors">−</button>
                        <button onClick={() => updateGoalProgress(goal, 1)} className="w-6 h-6 rounded-lg bg-gold/10 border border-gold/20 text-gold hover:bg-gold/20 text-sm flex items-center justify-center transition-colors">+</button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}

      {activeTab === 'tasks' && (
        <div className="space-y-2">
          {activeTasks.length === 0 ? (
            <EmptyState icon="✅" title="No open tasks" description="Add tasks to track your daily work." action={<Button variant="gold" onClick={() => { setEditTask(EMPTY_TASK()); setIsEditTask(false); setTaskModal(true) }}><Plus size={15} />Add Task</Button>} />
          ) : (
            activeTasks.sort((a,b) => {
              const p = { Critical:4, High:3, Medium:2, Low:1 }
              return (p[b.priority as TaskPriority] ?? 0) - (p[a.priority as TaskPriority] ?? 0)
            }).map(task => (
              <div key={task.id} className="flex items-center gap-3 p-3.5 bg-bg-3 border border-border rounded-xl hover:border-gold/20 transition-all group">
                <button onClick={() => toggleTask(task)} className="flex-shrink-0">
                  {task.status === 'Done'
                    ? <CheckCircle2 size={18} className="text-emerald-400" />
                    : <Circle size={18} className="text-border-2 hover:text-gold/50 transition-colors" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-medium', task.status === 'Done' ? 'line-through text-ink-3' : 'text-ink')}>{task.title}</p>
                  {task.description && <p className="text-xs text-ink-3 mt-0.5">{task.description}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {task.due_date && <span className="text-[10px] text-ink-3">{formatDate(task.due_date)}</span>}
                  <Badge label={task.priority} color={task.priority==='Critical'?'red':task.priority==='High'?'orange':task.priority==='Medium'?'gold':'gray'} />
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button onClick={() => { setEditTask({...task}); setIsEditTask(true); setTaskModal(true) }} className="text-ink-3 hover:text-gold transition-colors"><Edit3 size={13} /></button>
                    <button onClick={() => setDeleteTaskId(task.id)} className="text-ink-3 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Goal Modal */}
      <Modal open={goalModal} onClose={() => setGoalModal(false)} title={isEditGoal ? 'Edit Goal' : 'New Goal'} size="md">
        <div className="space-y-4">
          <Field label="Goal Title" required>
            <input value={editGoal.title ?? ''} onChange={e => setEditGoal(p => ({...p, title: e.target.value}))} placeholder="What do you want to achieve?" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <Select value={editGoal.category ?? 'YouTube'} onChange={e => setEditGoal(p => ({...p, category: e.target.value as GoalCategory}))}
                options={GOAL_CATS.map(c => ({ value:c, label:`${CAT_ICONS[c]} ${c}` }))} />
            </Field>
            <Field label="Status">
              <Select value={editGoal.status ?? 'Active'} onChange={e => setEditGoal(p => ({...p, status: e.target.value as GoalStatus}))}
                options={['Active','Completed','Paused','Abandoned'].map(s => ({ value:s, label:s }))} />
            </Field>
            <Field label="Target Value">
              <input type="number" value={editGoal.target_value ?? ''} onChange={e => setEditGoal(p => ({...p, target_value: Number(e.target.value)}))} placeholder="100" />
            </Field>
            <Field label="Current Value">
              <input type="number" value={editGoal.current_value ?? ''} onChange={e => setEditGoal(p => ({...p, current_value: Number(e.target.value)}))} placeholder="0" />
            </Field>
            <Field label="Unit (e.g. subscribers, artworks, ₹)">
              <input value={editGoal.unit ?? ''} onChange={e => setEditGoal(p => ({...p, unit: e.target.value}))} placeholder="subscribers, videos, ₹..." />
            </Field>
            <Field label="Deadline">
              <input type="date" value={editGoal.deadline ?? ''} onChange={e => setEditGoal(p => ({...p, deadline: e.target.value}))} />
            </Field>
          </div>
          <Field label="Description">
            <Textarea value={editGoal.description ?? ''} onChange={e => setEditGoal(p => ({...p, description: e.target.value}))} placeholder="Why is this goal important?" rows={2} />
          </Field>
          <Field label={`Priority: ${editGoal.priority}/5`}>
            <input type="range" min={1} max={5} value={editGoal.priority ?? 3} onChange={e => setEditGoal(p => ({...p, priority: Number(e.target.value)}))} className="border-none bg-transparent p-0" />
          </Field>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="ghost" onClick={() => setGoalModal(false)}>Cancel</Button>
          <Button variant="gold" onClick={saveGoal} loading={saving}>{isEditGoal ? 'Update' : 'Create'} Goal</Button>
        </div>
      </Modal>

      {/* Task Modal */}
      <Modal open={taskModal} onClose={() => setTaskModal(false)} title={isEditTask ? 'Edit Task' : 'New Task'} size="md">
        <div className="space-y-4">
          <Field label="Task Title" required>
            <input value={editTask.title ?? ''} onChange={e => setEditTask(p => ({...p, title: e.target.value}))} placeholder="What needs to be done?" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Priority">
              <Select value={editTask.priority ?? 'Medium'} onChange={e => setEditTask(p => ({...p, priority: e.target.value as TaskPriority}))}
                options={TASK_PRIORITIES.map(p => ({ value:p, label:p }))} />
            </Field>
            <Field label="Due Date">
              <input type="date" value={editTask.due_date ?? ''} onChange={e => setEditTask(p => ({...p, due_date: e.target.value}))} />
            </Field>
            <Field label="Link to Goal" className="col-span-2">
              <Select value={editTask.goal_id ?? ''} onChange={e => setEditTask(p => ({...p, goal_id: e.target.value || null}))}
                options={[{ value:'', label:'No goal' }, ...goals.map(g => ({ value:g.id, label:g.title }))]} />
            </Field>
          </div>
          <Field label="Description">
            <Textarea value={editTask.description ?? ''} onChange={e => setEditTask(p => ({...p, description: e.target.value}))} placeholder="Task details..." rows={2} />
          </Field>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="ghost" onClick={() => setTaskModal(false)}>Cancel</Button>
          <Button variant="gold" onClick={saveTask} loading={saving}>{isEditTask ? 'Update' : 'Add'} Task</Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteGoalId} onClose={() => setDeleteGoalId(null)} onConfirm={() => deleteGoalId && (removeGoal(deleteGoalId), GoalsDB.delete(deleteGoalId))} title="Delete Goal" message="This goal will be permanently deleted." />
      <ConfirmDialog open={!!deleteTaskId} onClose={() => setDeleteTaskId(null)} onConfirm={() => deleteTaskId && (removeTask(deleteTaskId), TasksDB.delete(deleteTaskId))} title="Delete Task" message="This task will be permanently deleted." />
    </div>
  )
}
