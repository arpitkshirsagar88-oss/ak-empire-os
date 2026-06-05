'use client'
import { useEffect, useState, useMemo } from 'react'
import { useStore } from '@/store'
import { Research as ResearchDB } from '@/lib/db'
import { Card, Button, Badge, Modal, Field, Select, SearchBar, EmptyState, SectionTitle, ConfirmDialog, useToast, Textarea } from '@/components/ui'
import { cn, newId, timeAgo } from '@/lib/utils'
import { Plus, Trash2, Edit3, Star, ExternalLink, Sparkles } from 'lucide-react'
import type { ResearchNote, ResearchCategory } from '@/types'

const CATEGORIES: ResearchCategory[] = ['Reference','Competitor','Book','Quote','Link','Framework','Inspiration','General']
const CAT_ICONS: Record<ResearchCategory, string> = {
  Reference:'📎', Competitor:'👁', Book:'📚', Quote:'💬', Link:'🔗', Framework:'⚙️', Inspiration:'✨', General:'📋'
}

export default function ResearchPage() {
  const { profile, researchNotes, setResearchNotes, upsertResearchNote, removeResearchNote } = useStore()
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Partial<ResearchNote>>({ title:'', content:'', category:'General', tags:[], source_url:'', is_favorite:false })
  const [isEdit, setIsEdit] = useState(false)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState<ResearchCategory | 'All'>('All')
  const [favOnly, setFavOnly] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [aiSummary, setAiSummary] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const { toast, ToastContainer } = useToast()
  const uid = profile?.id ?? 'local'

  useEffect(() => {
    ResearchDB.list(uid).then(data => { setResearchNotes(data); setLoading(false) })
  }, [uid])

  const filtered = useMemo(() => researchNotes.filter(n => {
    if (catFilter !== 'All' && n.category !== catFilter) return false
    if (favOnly && !n.is_favorite) return false
    if (search) { const q = search.toLowerCase(); return n.title.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q) }
    return true
  }), [researchNotes, catFilter, favOnly, search])

  const openNew = () => { setEditing({ title:'', content:'', category:'General', tags:[], source_url:'', is_favorite:false }); setIsEdit(false); setTagInput(''); setModalOpen(true) }
  const openEdit = (n: ResearchNote) => { setEditing({...n}); setIsEdit(true); setTagInput(''); setModalOpen(true) }

  const save = async () => {
    if (!editing.title?.trim()) { toast.error('Title required'); return }
    setSaving(true)
    const note: ResearchNote = {
      id: isEdit ? editing.id! : newId(), user_id: uid,
      title: editing.title!, content: editing.content ?? null,
      category: editing.category as ResearchCategory ?? 'General',
      source_url: editing.source_url ?? null, tags: editing.tags ?? [],
      is_favorite: editing.is_favorite ?? false,
      created_at: isEdit ? editing.created_at! : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    upsertResearchNote(note); await ResearchDB.save(note)
    setSaving(false); setModalOpen(false)
    toast.success(isEdit ? 'Updated' : 'Research saved')
  }

  const del = async (id: string) => {
    removeResearchNote(id); await ResearchDB.delete(id); toast.success('Removed')
  }

  const toggleFav = async (note: ResearchNote) => {
    const updated = { ...note, is_favorite: !note.is_favorite, updated_at: new Date().toISOString() }
    upsertResearchNote(updated); await ResearchDB.save(updated)
  }

  const summarizeWithAI = async () => {
    if (researchNotes.length === 0) { toast.error('No research to summarize'); return }
    setAiLoading(true); setAiSummary('')
    const content = researchNotes.slice(0, 20).map(n => `[${n.category}] ${n.title}: ${n.content ?? ''}`).join('\n\n')
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: 'You are a research analyst. Summarize the provided research notes and identify: 1) Key themes, 2) Content gaps vs competitors, 3) Top 3 video opportunities, 4) Unique angles to explore.',
          message: `Summarize and analyze these research notes:\n\n${content}`,
        }),
      })
      const reader = res.body!.getReader()
      const dec = new TextDecoder()
      let full = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += dec.decode(value)
        setAiSummary(full)
      }
    } catch { setAiSummary('AI unavailable') }
    setAiLoading(false)
  }

  if (loading) return <div className="flex items-center justify-center h-full"><p className="text-ink-3 animate-pulse">Loading research...</p></div>

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ToastContainer />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Research Hub</h1>
          <p className="text-ink-3 text-sm mt-0.5">{researchNotes.length} notes · References · Competitor analysis · Books</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={summarizeWithAI} loading={aiLoading}><Sparkles size={14} />AI Summary</Button>
          <Button variant="gold" onClick={openNew}><Plus size={15} />Add Note</Button>
        </div>
      </div>

      {aiSummary && (
        <Card gold className="mb-6">
          <SectionTitle>AI Research Analysis</SectionTitle>
          <div className="text-sm text-ink-2 leading-relaxed whitespace-pre-wrap">{aiSummary}{aiLoading && <span className="animate-pulse text-gold">▋</span>}</div>
        </Card>
      )}

      <div className="flex flex-wrap gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search research..." />
        <div className="flex gap-2 flex-wrap">
          {(['All', ...CATEGORIES] as const).map(cat => (
            <button key={cat} onClick={() => setCatFilter(cat as any)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1',
                catFilter === cat ? 'bg-gold/15 text-gold border-gold/30' : 'border-border text-ink-3 hover:text-ink')}>
              {cat !== 'All' && CAT_ICONS[cat as ResearchCategory]} {cat}
            </button>
          ))}
        </div>
        <button onClick={() => setFavOnly(f => !f)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1', favOnly ? 'bg-gold/15 text-gold border-gold/30' : 'border-border text-ink-3 hover:text-ink')}>
          <Star size={12} /> Favorites
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="🔬" title="No research yet" description="Store references, competitor analysis, books, and inspiration." action={<Button variant="gold" onClick={openNew}><Plus size={15} />Add First Note</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(note => (
            <Card key={note.id} className="group hover:border-gold/30 transition-all">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">{CAT_ICONS[note.category]}</span>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-ink-3">{note.category}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleFav(note)} className={cn('transition-colors', note.is_favorite ? 'text-gold' : 'text-ink-3 hover:text-gold opacity-0 group-hover:opacity-100')}>
                    <Star size={13} fill={note.is_favorite ? 'currentColor' : 'none'} />
                  </button>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(note)} className="text-ink-3 hover:text-gold transition-colors"><Edit3 size={13} /></button>
                    <button onClick={() => setDeleteId(note.id)} className="text-ink-3 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
              <h3 className="font-semibold text-ink text-sm mb-2">{note.title}</h3>
              {note.content && <p className="text-xs text-ink-3 leading-relaxed line-clamp-3 mb-3">{note.content}</p>}
              {note.source_url && (
                <a href={note.source_url} target="_blank" rel="noopener" className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 mb-2 transition-colors">
                  <ExternalLink size={10} /><span className="truncate">{note.source_url.replace(/^https?:\/\//, '')}</span>
                </a>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex flex-wrap gap-1">{note.tags.slice(0, 3).map(t => <Badge key={t} label={t} color="gray" />)}</div>
                <span className="text-[10px] text-ink-3">{timeAgo(note.created_at)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={isEdit ? 'Edit Note' : 'New Research Note'} size="md">
        <div className="space-y-4">
          <Field label="Title" required><input value={editing.title ?? ''} onChange={e => setEditing(p => ({...p, title: e.target.value}))} placeholder="Note title..." /></Field>
          <Field label="Category">
            <Select value={editing.category ?? 'General'} onChange={e => setEditing(p => ({...p, category: e.target.value as ResearchCategory}))} options={CATEGORIES.map(c => ({ value:c, label:`${CAT_ICONS[c]} ${c}` }))} />
          </Field>
          <Field label="Content"><Textarea value={editing.content ?? ''} onChange={e => setEditing(p => ({...p, content: e.target.value}))} placeholder="Notes, insights, observations..." rows={4} /></Field>
          <Field label="Source URL"><input value={editing.source_url ?? ''} onChange={e => setEditing(p => ({...p, source_url: e.target.value}))} placeholder="https://..." /></Field>
          <Field label="Tags">
            <div className="flex gap-2 mb-2">
              <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if(e.key==='Enter'){if(!tagInput.trim())return; setEditing(p=>({...p,tags:[...(p.tags??[]),tagInput.trim()]})); setTagInput('')}}} placeholder="Add tag..." className="flex-1" />
              <Button variant="ghost" size="sm" onClick={() => { if(!tagInput.trim())return; setEditing(p=>({...p,tags:[...(p.tags??[]),tagInput.trim()]})); setTagInput('')}}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-1.5">{(editing.tags??[]).map((t,i)=><span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-bg-4 border border-border rounded-full text-xs text-ink-2">{t}<button onClick={()=>setEditing(p=>({...p,tags:(p.tags??[]).filter((_,j)=>j!==i)}))} className="text-ink-3 hover:text-red-400">×</button></span>)}</div>
          </Field>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="gold" onClick={save} loading={saving}>{isEdit ? 'Update' : 'Save'} Note</Button>
        </div>
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && del(deleteId)} title="Delete Note" message="This research note will be permanently deleted." />
    </div>
  )
}
