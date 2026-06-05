'use client'
import { useEffect, useState } from 'react'
import { useStore } from '@/store'
import { Content as ContentDB } from '@/lib/db'
import { Button, Badge, Modal, Field, Select, EmptyState, useToast, SectionTitle } from '@/components/ui'
import { cn, newId, PIPELINE_STAGES } from '@/lib/utils'
import { Plus, Trash2, Edit3, GripVertical } from 'lucide-react'
import type { ContentItem, ContentType, Platform, PipelineStage } from '@/types'

const CONTENT_TYPES: ContentType[] = ['Long Video','Short','Reel','Tutorial','Documentary','Vlog']
const PLATFORMS: Platform[] = ['YouTube','Instagram','Both']

const EMPTY_FORM = (): Partial<ContentItem> => ({
  title: '', content_type: 'Long Video', platform: 'YouTube',
  pipeline_stage: 'Idea', scheduled_date: '', notes: ''
})

const STAGE_COLORS: Record<PipelineStage, string> = {
  Idea: 'border-zinc-700 bg-zinc-900/50',
  Research: 'border-blue-800/50 bg-blue-950/30',
  Script: 'border-purple-800/50 bg-purple-950/30',
  Thumbnail: 'border-amber-800/50 bg-amber-950/30',
  Recording: 'border-orange-800/50 bg-orange-950/30',
  Editing: 'border-rose-800/50 bg-rose-950/30',
  Scheduled: 'border-emerald-800/50 bg-emerald-950/30',
  Published: 'border-green-700/50 bg-green-950/30',
}

const STAGE_TEXT: Record<PipelineStage, string> = {
  Idea: 'text-zinc-400', Research: 'text-blue-400', Script: 'text-purple-400',
  Thumbnail: 'text-amber-400', Recording: 'text-orange-400', Editing: 'text-rose-400',
  Scheduled: 'text-emerald-400', Published: 'text-green-400',
}

export default function PipelinePage() {
  const { profile, contentItems, setContentItems, upsertContentItem, removeContentItem } = useStore()
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Partial<ContentItem>>(EMPTY_FORM())
  const [isEdit, setIsEdit] = useState(false)
  const [dragging, setDragging] = useState<ContentItem | null>(null)
  const [dragOver, setDragOver] = useState<PipelineStage | null>(null)
  const [saving, setSaving] = useState(false)
  const { toast, ToastContainer } = useToast()
  const uid = profile?.id ?? 'local'

  useEffect(() => {
    ContentDB.list(uid).then(data => { setContentItems(data); setLoading(false) })
  }, [uid])

  const byStage = (stage: PipelineStage) => contentItems.filter(c => c.pipeline_stage === stage)

  const openNew = (stage: PipelineStage = 'Idea') => {
    setEditing({ ...EMPTY_FORM(), pipeline_stage: stage })
    setIsEdit(false); setModalOpen(true)
  }

  const openEdit = (item: ContentItem) => {
    setEditing({ ...item }); setIsEdit(true); setModalOpen(true)
  }

  const save = async () => {
    if (!editing.title?.trim()) { toast.error('Title required'); return }
    setSaving(true)
    const item: ContentItem = {
      id: isEdit ? editing.id! : newId(),
      user_id: uid,
      idea_id: editing.idea_id ?? null,
      title: editing.title!,
      content_type: editing.content_type as ContentType ?? 'Long Video',
      platform: editing.platform as Platform ?? 'YouTube',
      pipeline_stage: editing.pipeline_stage as PipelineStage ?? 'Idea',
      scheduled_date: editing.scheduled_date || null,
      published_date: editing.published_date || null,
      youtube_url: editing.youtube_url || null,
      thumbnail_url: editing.thumbnail_url || null,
      views: editing.views || null,
      likes: editing.likes || null,
      comments: editing.comments || null,
      ctr: editing.ctr || null,
      retention_pct: editing.retention_pct || null,
      revenue: editing.revenue || null,
      notes: editing.notes || null,
      created_at: isEdit ? editing.created_at! : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    upsertContentItem(item); await ContentDB.save(item)
    setSaving(false); setModalOpen(false)
    toast.success(isEdit ? 'Updated' : 'Added to pipeline')
  }

  const del = async (id: string) => {
    removeContentItem(id); await ContentDB.delete(id); toast.success('Removed from pipeline')
  }

  const onDrop = async (stage: PipelineStage) => {
    if (!dragging || dragging.pipeline_stage === stage) { setDragging(null); setDragOver(null); return }
    const updated = { ...dragging, pipeline_stage: stage, updated_at: new Date().toISOString() }
    upsertContentItem(updated); await ContentDB.save(updated)
    setDragging(null); setDragOver(null)
    toast.success(`Moved to ${stage}`)
  }

  if (loading) return <div className="flex items-center justify-center h-full"><p className="text-ink-3 animate-pulse">Loading pipeline...</p></div>

  return (
    <div className="p-6 max-w-full">
      <ToastContainer />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Content Pipeline</h1>
          <p className="text-ink-3 text-sm mt-0.5">{contentItems.length} pieces · {contentItems.filter(c=>c.pipeline_stage==='Published').length} published</p>
        </div>
        <Button variant="gold" onClick={() => openNew()}><Plus size={15} />Add Content</Button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: '70vh' }}>
        {PIPELINE_STAGES.map(stage => {
          const items = byStage(stage)
          const isDragTarget = dragOver === stage
          return (
            <div key={stage}
              className={cn('flex-shrink-0 w-64 rounded-2xl border transition-all duration-200', STAGE_COLORS[stage], isDragTarget && 'scale-[1.02] border-gold/50')}
              onDragOver={e => { e.preventDefault(); setDragOver(stage) }}
              onDragLeave={() => setDragOver(null)}
              onDrop={() => onDrop(stage)}>
              {/* Column header */}
              <div className="p-3 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <span className={cn('text-[10px] font-bold tracking-widest uppercase', STAGE_TEXT[stage])}>{stage}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-black/30 px-2 py-0.5 rounded-full text-ink-3">{items.length}</span>
                    <button onClick={() => openNew(stage)} className="text-ink-3 hover:text-gold transition-colors">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Cards */}
              <div className="p-2 space-y-2 min-h-[200px]">
                {items.map(item => (
                  <div key={item.id} draggable
                    onDragStart={() => setDragging(item)}
                    onDragEnd={() => { setDragging(null); setDragOver(null) }}
                    className={cn('bg-bg-3 border border-border rounded-xl p-3 cursor-grab active:cursor-grabbing transition-all hover:border-gold/30 group', dragging?.id === item.id && 'opacity-40')}>
                    <div className="flex items-start gap-2 mb-2">
                      <GripVertical size={12} className="text-ink-3 mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <p className="text-xs font-medium text-ink flex-1 leading-relaxed">{item.title}</p>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      <Badge label={item.content_type} color={item.content_type === 'Short' ? 'red' : item.content_type === 'Tutorial' ? 'blue' : 'gray'} />
                      <Badge label={item.platform} color={item.platform === 'YouTube' ? 'red' : item.platform === 'Instagram' ? 'purple' : 'gold'} />
                    </div>
                    {item.scheduled_date && <p className="text-[10px] text-ink-3 mb-2">📅 {item.scheduled_date}</p>}
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(item)} className="text-ink-3 hover:text-gold transition-colors p-1"><Edit3 size={11} /></button>
                      <button onClick={() => del(item.id)} className="text-ink-3 hover:text-red-400 transition-colors p-1"><Trash2 size={11} /></button>
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="text-center py-8 text-ink-3 text-[11px]">Drop here</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={isEdit ? 'Edit Content' : 'Add Content'} size="md">
        <div className="space-y-4">
          <Field label="Title" required>
            <input value={editing.title ?? ''} onChange={e => setEditing(p => ({...p, title: e.target.value}))} placeholder="Video title..." />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Content Type">
              <Select value={editing.content_type ?? 'Long Video'} onChange={e => setEditing(p => ({...p, content_type: e.target.value as ContentType}))}
                options={CONTENT_TYPES.map(t => ({ value:t, label:t }))} />
            </Field>
            <Field label="Platform">
              <Select value={editing.platform ?? 'YouTube'} onChange={e => setEditing(p => ({...p, platform: e.target.value as Platform}))}
                options={PLATFORMS.map(p => ({ value:p, label:p }))} />
            </Field>
            <Field label="Pipeline Stage">
              <Select value={editing.pipeline_stage ?? 'Idea'} onChange={e => setEditing(p => ({...p, pipeline_stage: e.target.value as PipelineStage}))}
                options={PIPELINE_STAGES.map(s => ({ value:s, label:s }))} />
            </Field>
            <Field label="Scheduled Date">
              <input type="date" value={editing.scheduled_date ?? ''} onChange={e => setEditing(p => ({...p, scheduled_date: e.target.value}))} />
            </Field>
          </div>
          <Field label="Notes">
            <textarea value={editing.notes ?? ''} onChange={e => setEditing(p => ({...p, notes: e.target.value}))} placeholder="Notes..." className="min-h-[80px] resize-none" />
          </Field>
          {isEdit && (
            <div className="grid grid-cols-2 gap-4">
              <Field label="YouTube URL"><input value={editing.youtube_url ?? ''} onChange={e => setEditing(p => ({...p, youtube_url: e.target.value}))} placeholder="https://youtube.com/watch?v=..." /></Field>
              <Field label="Views"><input type="number" value={editing.views ?? ''} onChange={e => setEditing(p => ({...p, views: Number(e.target.value)}))} placeholder="0" /></Field>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="gold" onClick={save} loading={saving}>{isEdit ? 'Update' : 'Add'}</Button>
        </div>
      </Modal>
    </div>
  )
}
