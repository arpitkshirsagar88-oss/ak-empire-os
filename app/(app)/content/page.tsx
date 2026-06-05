'use client'
import { useEffect, useState, useMemo } from 'react'
import { useStore } from '@/store'
import { Content as ContentDB } from '@/lib/db'
import { Card, Button, Badge, Modal, Field, Select, SectionTitle, useToast, EmptyState } from '@/components/ui'
import { cn, newId, PIPELINE_STAGES } from '@/lib/utils'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import type { ContentItem, ContentType, Platform, PipelineStage } from '@/types'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns'

const CONTENT_TYPES: ContentType[] = ['Long Video','Short','Reel','Tutorial','Documentary','Vlog']
const PLATFORMS: Platform[] = ['YouTube','Instagram','Both']
const TYPE_COLOR: Record<ContentType, string> = {
  'Long Video': 'text-red-400 bg-red-500/10', Short: 'text-orange-400 bg-orange-500/10',
  Reel: 'text-purple-400 bg-purple-500/10', Tutorial: 'text-blue-400 bg-blue-500/10',
  Documentary: 'text-gold bg-gold/10', Vlog: 'text-green-400 bg-green-500/10',
}

export default function ContentCalendarPage() {
  const { profile, contentItems, setContentItems, upsertContentItem } = useStore()
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [editing, setEditing] = useState<Partial<ContentItem>>({})
  const [saving, setSaving] = useState(false)
  const { toast, ToastContainer } = useToast()
  const uid = profile?.id ?? 'local'

  useEffect(() => {
    ContentDB.list(uid).then(data => { setContentItems(data); setLoading(false) })
  }, [uid])

  const days = useMemo(() => eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) }), [currentMonth])
  const firstDayOfWeek = (startOfMonth(currentMonth).getDay() + 6) % 7 // Monday = 0

  const itemsForDay = (date: Date) => contentItems.filter(c => c.scheduled_date && isSameDay(new Date(c.scheduled_date), date))

  const openNewOnDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    setEditing({ title: '', content_type: 'Long Video', platform: 'YouTube', pipeline_stage: 'Idea', scheduled_date: dateStr })
    setSelectedDate(dateStr); setModalOpen(true)
  }

  const save = async () => {
    if (!editing.title?.trim()) { toast.error('Title required'); return }
    setSaving(true)
    const item: ContentItem = {
      id: editing.id ?? newId(), user_id: uid, idea_id: null,
      title: editing.title!, content_type: editing.content_type as ContentType ?? 'Long Video',
      platform: editing.platform as Platform ?? 'YouTube',
      pipeline_stage: editing.pipeline_stage as PipelineStage ?? 'Idea',
      scheduled_date: editing.scheduled_date || null, published_date: null,
      youtube_url: null, thumbnail_url: null, views: null, likes: null,
      comments: null, ctr: null, retention_pct: null, revenue: null, notes: editing.notes || null,
      created_at: editing.created_at ?? new Date().toISOString(), updated_at: new Date().toISOString(),
    }
    upsertContentItem(item); await ContentDB.save(item)
    setSaving(false); setModalOpen(false)
    toast.success('Scheduled!')
  }

  const scheduledThisMonth = contentItems.filter(c => c.scheduled_date && c.scheduled_date.startsWith(format(currentMonth, 'yyyy-MM'))).length
  const published = contentItems.filter(c => c.pipeline_stage === 'Published').length

  if (loading) return <div className="flex items-center justify-center h-full"><p className="text-ink-3 animate-pulse">Loading calendar...</p></div>

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <ToastContainer />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Content Calendar</h1>
          <p className="text-ink-3 text-sm mt-0.5">{scheduledThisMonth} scheduled this month · {published} published total</p>
        </div>
        <Button variant="gold" onClick={() => { setEditing({ content_type:'Long Video', platform:'YouTube', pipeline_stage:'Idea' }); setModalOpen(true) }}>
          <Plus size={15} />Schedule Content
        </Button>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="p-2 rounded-xl border border-border text-ink-3 hover:text-gold hover:border-gold/40 transition-all">
          <ChevronLeft size={18} />
        </button>
        <h2 className="font-display text-xl font-semibold">{format(currentMonth, 'MMMM yyyy')}</h2>
        <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="p-2 rounded-xl border border-border text-ink-3 hover:text-gold hover:border-gold/40 transition-all">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
          <div key={d} className="text-center text-[10px] font-semibold tracking-widest uppercase text-ink-3 py-2">{d}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5 mb-6">
        {/* Offset for first day */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}

        {days.map(day => {
          const dayItems = itemsForDay(day)
          const isCurrentDay = isToday(day)
          return (
            <div key={day.toISOString()} onClick={() => openNewOnDate(day)}
              className={cn('min-h-[90px] rounded-xl border p-2 cursor-pointer transition-all hover:border-gold/40 group',
                isCurrentDay ? 'border-gold/50 bg-gold/[0.04]' : dayItems.length > 0 ? 'border-border-2 bg-bg-3' : 'border-border bg-bg-3/50 hover:bg-bg-3')}>
              <p className={cn('text-xs font-semibold mb-1.5', isCurrentDay ? 'text-gold' : 'text-ink-3 group-hover:text-ink-2')}>{format(day, 'd')}</p>
              <div className="space-y-1">
                {dayItems.slice(0, 3).map(item => (
                  <div key={item.id} className={cn('text-[10px] font-medium rounded-md px-1.5 py-0.5 truncate', TYPE_COLOR[item.content_type])}>
                    {item.title}
                  </div>
                ))}
                {dayItems.length > 3 && <div className="text-[9px] text-ink-3">+{dayItems.length - 3} more</div>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Upcoming scheduled */}
      <Card>
        <SectionTitle>Upcoming Schedule</SectionTitle>
        {contentItems.filter(c => c.scheduled_date && new Date(c.scheduled_date) >= new Date()).sort((a,b) => (a.scheduled_date ?? '').localeCompare(b.scheduled_date ?? '')).slice(0, 8).map(item => (
          <div key={item.id} className="flex items-center gap-4 py-3 border-b border-border last:border-0">
            <div className="text-center min-w-[48px]">
              <div className="text-xs font-bold text-gold">{item.scheduled_date ? format(new Date(item.scheduled_date), 'MMM') : '—'}</div>
              <div className="font-display text-xl font-bold text-ink">{item.scheduled_date ? format(new Date(item.scheduled_date), 'd') : '—'}</div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-ink">{item.title}</p>
              <div className="flex gap-2 mt-1">
                <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-md', TYPE_COLOR[item.content_type])}>{item.content_type}</span>
                <Badge label={item.pipeline_stage} color="gray" />
              </div>
            </div>
            <Badge label={item.platform} color={item.platform === 'YouTube' ? 'red' : item.platform === 'Instagram' ? 'purple' : 'gold'} />
          </div>
        ))}
        {contentItems.filter(c => c.scheduled_date && new Date(c.scheduled_date) >= new Date()).length === 0 && (
          <p className="text-ink-3 text-sm text-center py-6">No upcoming content scheduled. Click a date to schedule.</p>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Schedule Content" size="md">
        <div className="space-y-4">
          <Field label="Title" required>
            <input value={editing.title ?? ''} onChange={e => setEditing(p => ({...p, title: e.target.value}))} placeholder="Video or content title..." />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Type">
              <Select value={editing.content_type ?? 'Long Video'} onChange={e => setEditing(p => ({...p, content_type: e.target.value as ContentType}))} options={CONTENT_TYPES.map(t => ({ value:t, label:t }))} />
            </Field>
            <Field label="Platform">
              <Select value={editing.platform ?? 'YouTube'} onChange={e => setEditing(p => ({...p, platform: e.target.value as Platform}))} options={PLATFORMS.map(p => ({ value:p, label:p }))} />
            </Field>
            <Field label="Scheduled Date">
              <input type="date" value={editing.scheduled_date ?? ''} onChange={e => setEditing(p => ({...p, scheduled_date: e.target.value}))} />
            </Field>
            <Field label="Pipeline Stage">
              <Select value={editing.pipeline_stage ?? 'Idea'} onChange={e => setEditing(p => ({...p, pipeline_stage: e.target.value as PipelineStage}))} options={PIPELINE_STAGES.map(s => ({ value:s, label:s }))} />
            </Field>
          </div>
          <Field label="Notes">
            <textarea value={editing.notes ?? ''} onChange={e => setEditing(p => ({...p, notes: e.target.value}))} className="min-h-[80px] resize-none" placeholder="Notes..." />
          </Field>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="gold" onClick={save} loading={saving}>Schedule</Button>
        </div>
      </Modal>
    </div>
  )
}
