'use client'
import { useEffect, useState, useMemo } from 'react'
import { useStore } from '@/store'
import { Ideas as IdeasDB } from '@/lib/db'
import { Card, Button, Badge, Modal, Field, Select, SearchBar, EmptyState, SectionTitle, ScoreChip, ConfirmDialog, useToast, Textarea } from '@/components/ui'
import { cn, newId, today, CATEGORY_COLORS, STATUS_COLORS } from '@/lib/utils'
import { Plus, Trash2, Edit3, Star } from 'lucide-react'
import type { Idea, IdeaCategory, IdeaStatus, Difficulty } from '@/types'

const CATEGORIES: IdeaCategory[] = ['Architecture', 'Art', 'YouTube', 'Business', 'Personal Growth']
const STATUSES: IdeaStatus[] = ['Active', 'In Progress', 'Done', 'Archived']
const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard']

const EMPTY_FORM = (): Partial<Idea> => ({
  title: '', hook: '', description: '', category: 'YouTube', tags: [],
  status: 'Active', priority: 5, viral_score: 5, evergreen_score: 5,
  estimated_views: '', difficulty: 'Medium', format: '', notes: ''
})

export default function IdeasPage() {
  const { profile, ideas, setIdeas, upsertIdea, removeIdea } = useStore()
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Partial<Idea>>(EMPTY_FORM())
  const [isEdit, setIsEdit] = useState(false)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState<IdeaCategory | 'All'>('All')
  const [statusFilter, setStatusFilter] = useState<IdeaStatus | 'All'>('All')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const { toast, ToastContainer } = useToast()

  const uid = profile?.id ?? 'local'

  useEffect(() => {
    IdeasDB.list(uid).then(data => { setIdeas(data); setLoading(false) })
  }, [uid])

  const filtered = useMemo(() => ideas.filter(i => {
    if (catFilter !== 'All' && i.category !== catFilter) return false
    if (statusFilter !== 'All' && i.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return i.title.toLowerCase().includes(q) || i.hook?.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q) || i.tags.some(t => t.toLowerCase().includes(q))
    }
    return true
  }).sort((a, b) => b.priority - a.priority), [ideas, catFilter, statusFilter, search])

  const openNew = () => { setEditing(EMPTY_FORM()); setIsEdit(false); setModalOpen(true) }
  const openEdit = (idea: Idea) => { setEditing({ ...idea }); setIsEdit(true); setModalOpen(true) }

  const save = async () => {
    if (!editing.title?.trim()) { toast.error('Title is required'); return }
    setSaving(true)
    const idea: Idea = {
      id: isEdit ? editing.id! : newId(),
      user_id: uid,
      title: editing.title!,
      hook: editing.hook ?? null,
      description: editing.description ?? null,
      category: editing.category as IdeaCategory ?? 'YouTube',
      tags: editing.tags ?? [],
      status: editing.status as IdeaStatus ?? 'Active',
      priority: Number(editing.priority) ?? 5,
      viral_score: Number(editing.viral_score) ?? 5,
      evergreen_score: Number(editing.evergreen_score) ?? 5,
      estimated_views: editing.estimated_views ?? null,
      difficulty: editing.difficulty as Difficulty ?? 'Medium',
      format: editing.format ?? null,
      notes: editing.notes ?? null,
      created_at: isEdit ? editing.created_at! : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    upsertIdea(idea)
    await IdeasDB.save(idea)
    setSaving(false)
    setModalOpen(false)
    toast.success(isEdit ? 'Idea updated' : 'Idea created')
  }

  const del = async (id: string) => {
    removeIdea(id)
    await IdeasDB.delete(id)
    toast.success('Idea deleted')
  }

  const CATEGORY_COLOR_MAP: Record<string, 'blue'|'purple'|'red'|'gold'|'green'> = {
    Architecture:'blue', Art:'purple', YouTube:'red', Business:'gold', 'Personal Growth':'green'
  }

  if (loading) return <div className="flex items-center justify-center h-full"><p className="text-ink-3 animate-pulse">Loading ideas...</p></div>

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ToastContainer />
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Idea Vault</h1>
          <p className="text-ink-3 text-sm mt-0.5">{ideas.length} ideas stored · {ideas.filter(i=>i.status==='Active').length} active</p>
        </div>
        <Button variant="gold" onClick={openNew}><Plus size={15} />New Idea</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Search ideas, hooks, tags..." />
        <div className="flex gap-2 flex-wrap">
          {(['All', ...CATEGORIES] as const).map(cat => (
            <button key={cat} onClick={() => setCatFilter(cat as any)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                catFilter === cat ? 'bg-gold/15 text-gold border-gold/30' : 'border-border text-ink-3 hover:text-ink hover:border-border-2')}>
              {cat}
            </button>
          ))}
        </div>
        <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}
          options={[{ value:'All', label:'All Status'}, ...STATUSES.map(s => ({ value:s, label:s }))]}
          className="w-36" />
      </div>

      {/* Ideas Grid */}
      {filtered.length === 0 ? (
        <EmptyState icon="💡" title="No ideas yet" description="Start building your content empire. Every great video starts with an idea." action={<Button variant="gold" onClick={openNew}><Plus size={15} />Add Your First Idea</Button>} />
      ) : (
        <div className="space-y-3">
          {filtered.map((idea, idx) => (
            <Card key={idea.id} className="group hover:border-gold/30 transition-all">
              <div className="flex items-start gap-4">
                <div className="font-display text-2xl font-bold text-gold/60 w-8 flex-shrink-0 text-center pt-0.5">
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-2">
                    <h3 className="text-sm font-semibold text-ink flex-1">{idea.title}</h3>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button onClick={() => openEdit(idea)} className="text-ink-3 hover:text-gold transition-colors"><Edit3 size={14} /></button>
                      <button onClick={() => setDeleteId(idea.id)} className="text-ink-3 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  {idea.hook && <p className="text-xs text-ink-3 italic mb-2 leading-relaxed">"{idea.hook}"</p>}
                  <div className="flex flex-wrap gap-2 items-center">
                    <Badge label={idea.category} color={CATEGORY_COLOR_MAP[idea.category] ?? 'gray'} />
                    <Badge label={idea.status} color={idea.status === 'Active' ? 'green' : idea.status === 'Done' ? 'blue' : 'gray'} />
                    <Badge label={idea.difficulty} color={idea.difficulty === 'Hard' ? 'red' : idea.difficulty === 'Easy' ? 'green' : 'gold'} />
                    {idea.estimated_views && <Badge label={`~${idea.estimated_views} views`} color="gray" />}
                    {idea.format && <Badge label={idea.format} color="gray" />}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <ScoreChip label="Viral" value={idea.viral_score} />
                  <ScoreChip label="Evergreen" value={idea.evergreen_score} />
                  <ScoreChip label="Priority" value={idea.priority} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={isEdit ? 'Edit Idea' : 'New Idea'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Title" required className="col-span-2">
            <input value={editing.title ?? ''} onChange={e => setEditing(p => ({ ...p, title: e.target.value }))} placeholder="What's the video about?" />
          </Field>
          <Field label="Hook">
            <input value={editing.hook ?? ''} onChange={e => setEditing(p => ({ ...p, hook: e.target.value }))} placeholder="Opening line that grabs attention..." />
          </Field>
          <Field label="Category">
            <Select value={editing.category ?? 'YouTube'} onChange={e => setEditing(p => ({ ...p, category: e.target.value as IdeaCategory }))}
              options={CATEGORIES.map(c => ({ value: c, label: c }))} />
          </Field>
          <Field label="Description" className="col-span-2">
            <Textarea value={editing.description ?? ''} onChange={e => setEditing(p => ({ ...p, description: e.target.value }))} placeholder="Full idea description..." rows={3} />
          </Field>
          <Field label="Format">
            <input value={editing.format ?? ''} onChange={e => setEditing(p => ({ ...p, format: e.target.value }))} placeholder="e.g. Long-form, Documentary, Tutorial" />
          </Field>
          <Field label="Estimated Views">
            <input value={editing.estimated_views ?? ''} onChange={e => setEditing(p => ({ ...p, estimated_views: e.target.value }))} placeholder="e.g. 50K, 200K" />
          </Field>
          <Field label="Difficulty">
            <Select value={editing.difficulty ?? 'Medium'} onChange={e => setEditing(p => ({ ...p, difficulty: e.target.value as Difficulty }))}
              options={DIFFICULTIES.map(d => ({ value: d, label: d }))} />
          </Field>
          <Field label="Status">
            <Select value={editing.status ?? 'Active'} onChange={e => setEditing(p => ({ ...p, status: e.target.value as IdeaStatus }))}
              options={STATUSES.map(s => ({ value: s, label: s }))} />
          </Field>
          <Field label={`Priority: ${editing.priority}/10`}>
            <input type="range" min={1} max={10} value={editing.priority ?? 5} onChange={e => setEditing(p => ({ ...p, priority: Number(e.target.value) }))} className="border-none bg-transparent p-0" />
          </Field>
          <Field label={`Viral Score: ${editing.viral_score}/10`}>
            <input type="range" min={1} max={10} step={0.5} value={editing.viral_score ?? 5} onChange={e => setEditing(p => ({ ...p, viral_score: Number(e.target.value) }))} className="border-none bg-transparent p-0" />
          </Field>
          <Field label={`Evergreen Score: ${editing.evergreen_score}/10`}>
            <input type="range" min={1} max={10} step={0.5} value={editing.evergreen_score ?? 5} onChange={e => setEditing(p => ({ ...p, evergreen_score: Number(e.target.value) }))} className="border-none bg-transparent p-0" />
          </Field>
          <Field label="Notes" className="col-span-2">
            <Textarea value={editing.notes ?? ''} onChange={e => setEditing(p => ({ ...p, notes: e.target.value }))} placeholder="Additional notes..." rows={2} />
          </Field>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="gold" onClick={save} loading={saving}>{isEdit ? 'Update' : 'Create'} Idea</Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && del(deleteId)} title="Delete Idea" message="This idea will be permanently deleted." />
    </div>
  )
}
