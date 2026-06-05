'use client'
import { useEffect, useState, useMemo } from 'react'
import { useStore } from '@/store'
import { Artworks as ArtworksDB } from '@/lib/db'
import { Card, StatCard, Button, Badge, Modal, Field, Select, SearchBar, EmptyState, SectionTitle, ConfirmDialog, useToast, Textarea, ProgressBar } from '@/components/ui'
import { cn, newId, formatDate } from '@/lib/utils'
import { Plus, Trash2, Edit3, ExternalLink, Clock, DollarSign } from 'lucide-react'
import type { Artwork, ArtworkMedium, ArtworkStatus } from '@/types'

const MEDIUMS: ArtworkMedium[] = ['Graphite', 'Charcoal', 'Color Pencil', 'Ink', 'Digital', 'Mixed Media', 'Other']
const STATUSES: ArtworkStatus[] = ['Planned', 'In Progress', 'Completed', 'Archived']

const EMPTY_FORM = (): Partial<Artwork> => ({
  title: '', medium: 'Graphite', status: 'In Progress', subject: '',
  reference_url: '', instagram_post_url: '', sold: false, sale_price: undefined,
  time_spent_hours: undefined, dimensions: '', notes: '', completed_date: undefined
})

const MEDIUM_COLORS: Record<ArtworkMedium, 'gray'|'gold'|'purple'|'blue'|'green'|'orange'|'red'> = {
  Graphite: 'gray', Charcoal: 'gray', 'Color Pencil': 'purple', Ink: 'blue', Digital: 'green', 'Mixed Media': 'gold', Other: 'gray'
}

export default function ArtPage() {
  const { profile, artworks, setArtworks, upsertArtwork, removeArtwork } = useStore()
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Partial<Artwork>>(EMPTY_FORM())
  const [isEdit, setIsEdit] = useState(false)
  const [search, setSearch] = useState('')
  const [medFilter, setMedFilter] = useState<ArtworkMedium | 'All'>('All')
  const [statFilter, setStatFilter] = useState<ArtworkStatus | 'All'>('All')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const { toast, ToastContainer } = useToast()
  const uid = profile?.id ?? 'local'

  useEffect(() => {
    ArtworksDB.list(uid).then(data => { setArtworks(data); setLoading(false) })
  }, [uid])

  const filtered = useMemo(() => artworks.filter(a => {
    if (medFilter !== 'All' && a.medium !== medFilter) return false
    if (statFilter !== 'All' && a.status !== statFilter) return false
    if (search) { const q = search.toLowerCase(); return a.title.toLowerCase().includes(q) || a.subject?.toLowerCase().includes(q) }
    return true
  }), [artworks, medFilter, statFilter, search])

  const stats = {
    total: artworks.length,
    completed: artworks.filter(a => a.status === 'Completed').length,
    inProgress: artworks.filter(a => a.status === 'In Progress').length,
    sold: artworks.filter(a => a.sold).length,
    totalHours: artworks.reduce((s, a) => s + (a.time_spent_hours ?? 0), 0),
    totalRevenue: artworks.filter(a => a.sold && a.sale_price).reduce((s, a) => s + (a.sale_price ?? 0), 0),
  }

  const openNew = () => { setEditing(EMPTY_FORM()); setIsEdit(false); setModalOpen(true) }
  const openEdit = (a: Artwork) => { setEditing({ ...a }); setIsEdit(true); setModalOpen(true) }

  const save = async () => {
    if (!editing.title?.trim()) { toast.error('Title is required'); return }
    setSaving(true)
    const artwork: Artwork = {
      id: isEdit ? editing.id! : newId(),
      user_id: uid,
      title: editing.title!,
      medium: editing.medium as ArtworkMedium ?? 'Graphite',
      status: editing.status as ArtworkStatus ?? 'In Progress',
      subject: editing.subject ?? null,
      reference_url: editing.reference_url ?? null,
      instagram_post_url: editing.instagram_post_url ?? null,
      sold: editing.sold ?? false,
      sale_price: editing.sale_price ? Number(editing.sale_price) : null,
      time_spent_hours: editing.time_spent_hours ? Number(editing.time_spent_hours) : null,
      dimensions: editing.dimensions ?? null,
      notes: editing.notes ?? null,
      completed_date: editing.completed_date ?? null,
      created_at: isEdit ? editing.created_at! : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    upsertArtwork(artwork)
    await ArtworksDB.save(artwork)
    setSaving(false); setModalOpen(false)
    toast.success(isEdit ? 'Artwork updated' : 'Artwork added to portfolio')
  }

  const del = async (id: string) => {
    removeArtwork(id); await ArtworksDB.delete(id); toast.success('Artwork removed')
  }

  if (loading) return <div className="flex items-center justify-center h-full"><p className="text-ink-3 animate-pulse">Loading portfolio...</p></div>

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ToastContainer />
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Art Portfolio</h1>
          <p className="text-ink-3 text-sm mt-0.5">Hyperrealistic drawings · Graphite · Charcoal · Color Pencil</p>
        </div>
        <Button variant="gold" onClick={openNew}><Plus size={15} />Add Artwork</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Works" value={stats.total} gold />
        <StatCard label="Completed" value={stats.completed} delta={`${stats.inProgress} in progress`} up />
        <StatCard label="Sold" value={stats.sold} delta="artworks sold" up />
        <StatCard label="Hours Invested" value={`${stats.totalHours.toFixed(0)}h`} delta="total studio time" up />
      </div>

      {/* Medium Stats */}
      <Card className="mb-6">
        <SectionTitle>Medium Breakdown</SectionTitle>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {MEDIUMS.filter(m => m !== 'Other').map(med => {
            const count = artworks.filter(a => a.medium === med).length
            return (
              <div key={med} className="text-center">
                <div className="font-display text-2xl font-bold text-gold mb-1">{count}</div>
                <div className="text-[10px] text-ink-3 uppercase tracking-wider">{med}</div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Search artworks..." />
        <div className="flex gap-2 flex-wrap">
          {(['All', ...MEDIUMS] as const).map(m => (
            <button key={m} onClick={() => setMedFilter(m as any)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                medFilter === m ? 'bg-gold/15 text-gold border-gold/30' : 'border-border text-ink-3 hover:text-ink')}>
              {m}
            </button>
          ))}
        </div>
        <Select value={statFilter} onChange={e => setStatFilter(e.target.value as any)}
          options={[{ value:'All', label:'All Status' }, ...STATUSES.map(s => ({ value:s, label:s }))]}
          className="w-36" />
      </div>

      {/* Gallery Grid */}
      {filtered.length === 0 ? (
        <EmptyState icon="🎨" title="No artworks yet" description="Start documenting your hyperrealistic art portfolio." action={<Button variant="gold" onClick={openNew}><Plus size={15} />Add First Artwork</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(artwork => (
            <Card key={artwork.id} className="group hover:border-gold/30 transition-all cursor-default">
              {/* Preview placeholder */}
              <div className="w-full aspect-[4/3] rounded-xl bg-bg-4 border border-border mb-4 flex items-center justify-center relative overflow-hidden">
                <div className="text-center">
                  <span className="text-4xl opacity-20">
                    {artwork.medium === 'Graphite' ? '✏️' : artwork.medium === 'Charcoal' ? '🖤' : artwork.medium === 'Color Pencil' ? '🖍️' : '🎨'}
                  </span>
                  <p className="text-[10px] text-ink-3 mt-2 uppercase tracking-wider">{artwork.medium}</p>
                </div>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(artwork)} className="w-7 h-7 rounded-lg bg-bg-3 border border-border flex items-center justify-center text-ink-3 hover:text-gold transition-colors">
                    <Edit3 size={12} />
                  </button>
                  <button onClick={() => setDeleteId(artwork.id)} className="w-7 h-7 rounded-lg bg-bg-3 border border-border flex items-center justify-center text-ink-3 hover:text-red-400 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
                {artwork.sold && <div className="absolute bottom-2 left-2"><Badge label="SOLD" color="green" /></div>}
              </div>

              <h3 className="font-semibold text-ink mb-1 text-sm">{artwork.title}</h3>
              {artwork.subject && <p className="text-xs text-ink-3 mb-3">Subject: {artwork.subject}</p>}

              <div className="flex flex-wrap gap-1.5 mb-3">
                <Badge label={artwork.medium} color={MEDIUM_COLORS[artwork.medium]} />
                <Badge label={artwork.status} color={artwork.status === 'Completed' ? 'green' : artwork.status === 'In Progress' ? 'gold' : 'gray'} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-ink-3 border-t border-border pt-3 mt-3">
                {artwork.time_spent_hours && (
                  <div className="flex items-center gap-1"><Clock size={10} />{artwork.time_spent_hours}h</div>
                )}
                {artwork.completed_date && (
                  <div>{formatDate(artwork.completed_date)}</div>
                )}
                {artwork.sale_price && (
                  <div className="flex items-center gap-1 text-emerald-400"><DollarSign size={10} />₹{artwork.sale_price.toLocaleString()}</div>
                )}
                {artwork.instagram_post_url && (
                  <a href={artwork.instagram_post_url} target="_blank" rel="noopener" className="flex items-center gap-1 text-purple-400 hover:text-purple-300">
                    <ExternalLink size={10} />Instagram
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={isEdit ? 'Edit Artwork' : 'Add Artwork'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Title" required className="col-span-2">
            <input value={editing.title ?? ''} onChange={e => setEditing(p => ({...p, title: e.target.value}))} placeholder="Artwork title..." />
          </Field>
          <Field label="Medium">
            <Select value={editing.medium ?? 'Graphite'} onChange={e => setEditing(p => ({...p, medium: e.target.value as ArtworkMedium}))}
              options={MEDIUMS.map(m => ({ value:m, label:m }))} />
          </Field>
          <Field label="Status">
            <Select value={editing.status ?? 'In Progress'} onChange={e => setEditing(p => ({...p, status: e.target.value as ArtworkStatus}))}
              options={STATUSES.map(s => ({ value:s, label:s }))} />
          </Field>
          <Field label="Subject">
            <input value={editing.subject ?? ''} onChange={e => setEditing(p => ({...p, subject: e.target.value}))} placeholder="Portrait, Landscape, Architecture..." />
          </Field>
          <Field label="Dimensions">
            <input value={editing.dimensions ?? ''} onChange={e => setEditing(p => ({...p, dimensions: e.target.value}))} placeholder="e.g. A3, 30x42cm" />
          </Field>
          <Field label="Time Spent (hours)">
            <input type="number" value={editing.time_spent_hours ?? ''} onChange={e => setEditing(p => ({...p, time_spent_hours: Number(e.target.value)}))} placeholder="0" />
          </Field>
          <Field label="Completion Date">
            <input type="date" value={editing.completed_date ?? ''} onChange={e => setEditing(p => ({...p, completed_date: e.target.value}))} />
          </Field>
          <Field label="Reference Image URL" className="col-span-2">
            <input value={editing.reference_url ?? ''} onChange={e => setEditing(p => ({...p, reference_url: e.target.value}))} placeholder="https://..." />
          </Field>
          <Field label="Instagram Post URL" className="col-span-2">
            <input value={editing.instagram_post_url ?? ''} onChange={e => setEditing(p => ({...p, instagram_post_url: e.target.value}))} placeholder="https://instagram.com/p/..." />
          </Field>
          <div className="col-span-2 flex items-center gap-3 p-3 bg-bg-4 rounded-xl border border-border">
            <input type="checkbox" id="sold" checked={editing.sold ?? false} onChange={e => setEditing(p => ({...p, sold: e.target.checked}))} className="w-4 h-4 border-none" />
            <label htmlFor="sold" className="text-sm text-ink cursor-pointer">Artwork sold</label>
            {editing.sold && (
              <input type="number" value={editing.sale_price ?? ''} onChange={e => setEditing(p => ({...p, sale_price: Number(e.target.value)}))}
                placeholder="Sale price (₹)" className="ml-auto w-40" />
            )}
          </div>
          <Field label="Notes" className="col-span-2">
            <Textarea value={editing.notes ?? ''} onChange={e => setEditing(p => ({...p, notes: e.target.value}))} placeholder="Notes about technique, client, reference..." rows={3} />
          </Field>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="gold" onClick={save} loading={saving}>{isEdit ? 'Update' : 'Add'} Artwork</Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && del(deleteId)} title="Remove Artwork" message="This artwork will be removed from your portfolio." />
    </div>
  )
}
