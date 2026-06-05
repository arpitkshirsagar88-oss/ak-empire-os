'use client'
import { useEffect, useState, useMemo } from 'react'
import { useStore } from '@/store'
import { Brain as BrainDB } from '@/lib/db'
import { Card, Button, Badge, Modal, Field, Select, SearchBar, EmptyState, SectionTitle, ConfirmDialog, useToast, Textarea } from '@/components/ui'
import { cn, newId, timeAgo } from '@/lib/utils'
import { Plus, Trash2, Edit3, Star, Sparkles } from 'lucide-react'
import type { BrainEntry, BrainEntryType } from '@/types'

const ENTRY_TYPES: BrainEntryType[] = ['Idea','Quote','Book','Framework','Lesson','Script','Note','Principle']
const TYPE_COLORS: Record<BrainEntryType, string> = {
  Idea:'#c8a45a', Quote:'#4aad79', Book:'#4a8fe8', Framework:'#8b6fe8',
  Lesson:'#f59e0b', Script:'#e85d4a', Note:'#9e9a93', Principle:'#c8a45a'
}
const TYPE_ICONS: Record<BrainEntryType, string> = {
  Idea:'💡', Quote:'💬', Book:'📚', Framework:'⚙️',
  Lesson:'🎓', Script:'📝', Note:'📋', Principle:'⚡'
}

const EMPTY_FORM = (): Partial<BrainEntry> => ({
  title: '', content: '', entry_type: 'Note', tags: [], source: '', is_favorite: false
})

export default function BrainPage() {
  const { profile, brainEntries, setBrainEntries, upsertBrainEntry, removeBrainEntry } = useStore()
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Partial<BrainEntry>>(EMPTY_FORM())
  const [isEdit, setIsEdit] = useState(false)
  const [search, setSearch] = useState('')
  const [aiSearch, setAiSearch] = useState('')
  const [aiResult, setAiResult] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [typeFilter, setTypeFilter] = useState<BrainEntryType | 'All'>('All')
  const [favOnly, setFavOnly] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const { toast, ToastContainer } = useToast()
  const uid = profile?.id ?? 'local'

  useEffect(() => {
    BrainDB.list(uid).then(data => { setBrainEntries(data); setLoading(false) })
  }, [uid])

  const filtered = useMemo(() => brainEntries.filter(e => {
    if (typeFilter !== 'All' && e.entry_type !== typeFilter) return false
    if (favOnly && !e.is_favorite) return false
    if (search) {
      const q = search.toLowerCase()
      return e.title.toLowerCase().includes(q) || e.content?.toLowerCase().includes(q) || e.tags.some(t => t.toLowerCase().includes(q))
    }
    return true
  }), [brainEntries, typeFilter, favOnly, search])

  const openNew = () => { setEditing(EMPTY_FORM()); setIsEdit(false); setTagInput(''); setModalOpen(true) }
  const openEdit = (e: BrainEntry) => { setEditing({ ...e }); setIsEdit(true); setTagInput(''); setModalOpen(true) }

  const save = async () => {
    if (!editing.title?.trim()) { toast.error('Title required'); return }
    setSaving(true)
    const entry: BrainEntry = {
      id: isEdit ? editing.id! : newId(),
      user_id: uid,
      title: editing.title!,
      content: editing.content ?? null,
      entry_type: editing.entry_type as BrainEntryType ?? 'Note',
      tags: editing.tags ?? [],
      source: editing.source ?? null,
      is_favorite: editing.is_favorite ?? false,
      created_at: isEdit ? editing.created_at! : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    upsertBrainEntry(entry); await BrainDB.save(entry)
    setSaving(false); setModalOpen(false)
    toast.success(isEdit ? 'Entry updated' : 'Added to brain')
  }

  const del = async (id: string) => {
    removeBrainEntry(id); await BrainDB.delete(id); toast.success('Entry removed')
  }

  const toggleFav = async (entry: BrainEntry) => {
    const updated = { ...entry, is_favorite: !entry.is_favorite, updated_at: new Date().toISOString() }
    upsertBrainEntry(updated); await BrainDB.save(updated)
  }

  const addTag = () => {
    if (!tagInput.trim()) return
    setEditing(p => ({ ...p, tags: [...(p.tags ?? []), tagInput.trim()] }))
    setTagInput('')
  }

  const removeTag = (i: number) => {
    setEditing(p => ({ ...p, tags: (p.tags ?? []).filter((_, j) => j !== i) }))
  }

  const semanticSearch = async () => {
    if (!aiSearch.trim()) return
    setAiLoading(true); setAiResult('')
    const brainContent = brainEntries.slice(0, 30).map(e => `[${e.entry_type}] ${e.title}: ${e.content ?? ''}`).join('\n\n')
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: `You are the Second Brain assistant for Arpit Kshirsagar. Search through his knowledge base and surface the most relevant insights. His knowledge base:\n\n${brainContent || 'Empty — no entries yet.'}\n\nAnswer based on this knowledge, making connections he might not see. Be concise and direct.`,
          message: aiSearch,
        }),
      })
      const reader = res.body!.getReader(); const dec = new TextDecoder(); let full = ''
      while (true) { const { done, value } = await reader.read(); if (done) break; full += dec.decode(value); setAiResult(full) }
    } catch { setAiResult('AI search unavailable. Check your API key in .env.local') }
    setAiLoading(false)
  }

  if (loading) return <div className="flex items-center justify-center h-full"><p className="text-ink-3 animate-pulse">Loading brain...</p></div>

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ToastContainer />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Second Brain</h1>
          <p className="text-ink-3 text-sm mt-0.5">{brainEntries.length} entries · {brainEntries.filter(e=>e.is_favorite).length} favorites</p>
        </div>
        <Button variant="gold" onClick={openNew}><Plus size={15} />Add Entry</Button>
      </div>

      {/* AI Semantic Search */}
      <Card gold className="mb-6">
        <SectionTitle>AI Semantic Search</SectionTitle>
        <div className="flex gap-3 mb-3">
          <input value={aiSearch} onChange={e => setAiSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && semanticSearch()}
            placeholder="Ask your brain anything: 'What do I know about retention?' or 'Find my architecture frameworks...'" className="flex-1" />
          <Button variant="gold" onClick={semanticSearch} loading={aiLoading}><Sparkles size={14} />Search</Button>
        </div>
        {aiResult && (
          <div className="bg-bg-4 border border-border rounded-xl p-4 text-sm text-ink-2 leading-relaxed whitespace-pre-wrap">
            {aiResult}
            {aiLoading && <span className="animate-pulse text-gold">▋</span>}
          </div>
        )}
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Filter entries..." />
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setTypeFilter('All')}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-all', typeFilter === 'All' ? 'bg-gold/15 text-gold border-gold/30' : 'border-border text-ink-3 hover:text-ink')}>
            All
          </button>
          {ENTRY_TYPES.map(type => (
            <button key={type} onClick={() => setTypeFilter(type)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1',
                typeFilter === type ? 'bg-gold/15 text-gold border-gold/30' : 'border-border text-ink-3 hover:text-ink')}>
              {TYPE_ICONS[type]} {type}
            </button>
          ))}
        </div>
        <button onClick={() => setFavOnly(f => !f)}
          className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1',
            favOnly ? 'bg-gold/15 text-gold border-gold/30' : 'border-border text-ink-3 hover:text-ink')}>
          <Star size={12} /> Favorites
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="🧠" title="Empty brain" description="Store ideas, quotes, frameworks, and lessons that fuel your creative empire." action={<Button variant="gold" onClick={openNew}><Plus size={15} />Add First Entry</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(entry => (
            <Card key={entry.id} className="group hover:border-gold/30 transition-all">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">{TYPE_ICONS[entry.entry_type]}</span>
                  <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: TYPE_COLORS[entry.entry_type] }}>
                    {entry.entry_type}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleFav(entry)}
                    className={cn('transition-colors', entry.is_favorite ? 'text-gold' : 'text-ink-3 hover:text-gold opacity-0 group-hover:opacity-100')}>
                    <Star size={14} fill={entry.is_favorite ? 'currentColor' : 'none'} />
                  </button>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(entry)} className="text-ink-3 hover:text-gold transition-colors"><Edit3 size={13} /></button>
                    <button onClick={() => setDeleteId(entry.id)} className="text-ink-3 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
              <h3 className="font-semibold text-ink text-sm mb-2 leading-snug">{entry.title}</h3>
              {entry.content && <p className="text-xs text-ink-3 leading-relaxed line-clamp-4 mb-3">{entry.content}</p>}
              {entry.source && <p className="text-[10px] text-ink-3/60 mb-2 italic">— {entry.source}</p>}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex flex-wrap gap-1">
                  {entry.tags.slice(0, 3).map(t => <Badge key={t} label={t} color="gray" />)}
                </div>
                <span className="text-[10px] text-ink-3">{timeAgo(entry.created_at)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={isEdit ? 'Edit Entry' : 'New Brain Entry'} size="md">
        <div className="space-y-4">
          <Field label="Title" required>
            <input value={editing.title ?? ''} onChange={e => setEditing(p => ({...p, title: e.target.value}))} placeholder="Entry title..." />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Type">
              <Select value={editing.entry_type ?? 'Note'}
                onChange={e => setEditing(p => ({...p, entry_type: e.target.value as BrainEntryType}))}
                options={ENTRY_TYPES.map(t => ({ value:t, label:`${TYPE_ICONS[t]} ${t}` }))} />
            </Field>
            <Field label="Source">
              <input value={editing.source ?? ''} onChange={e => setEditing(p => ({...p, source: e.target.value}))} placeholder="Book, person, URL..." />
            </Field>
          </div>
          <Field label="Content">
            <Textarea value={editing.content ?? ''} onChange={e => setEditing(p => ({...p, content: e.target.value}))} placeholder="The knowledge, insight, or quote..." rows={5} />
          </Field>
          <Field label="Tags">
            <div className="flex gap-2 mb-2">
              <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add tag and press Enter..." className="flex-1" />
              <Button variant="ghost" size="sm" onClick={addTag}>Add</Button>
            </div>
            {(editing.tags ?? []).length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {(editing.tags ?? []).map((t, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-bg-4 border border-border rounded-full text-xs text-ink-2">
                    {t}
                    <button onClick={() => removeTag(i)} className="text-ink-3 hover:text-red-400 ml-0.5">×</button>
                  </span>
                ))}
              </div>
            )}
          </Field>
          <div className="flex items-center gap-3 p-3 bg-bg-4 rounded-xl border border-border">
            <input type="checkbox" id="fav-entry" checked={editing.is_favorite ?? false}
              onChange={e => setEditing(p => ({...p, is_favorite: e.target.checked}))} className="w-4 h-4" />
            <label htmlFor="fav-entry" className="text-sm text-ink cursor-pointer flex items-center gap-1.5">
              <Star size={13} className="text-gold" /> Mark as favorite
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="gold" onClick={save} loading={saving}>{isEdit ? 'Update' : 'Add to Brain'}</Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) del(deleteId); setDeleteId(null) }}
        title="Remove Entry" message="This brain entry will be permanently deleted." />
    </div>
  )
}
