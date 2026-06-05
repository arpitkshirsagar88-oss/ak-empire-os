'use client'
import { useEffect, useState, useMemo } from 'react'
import { useStore } from '@/store'
import { ArchProjects as ArchDB } from '@/lib/db'
import { Card, StatCard, Button, Badge, Modal, Field, Select, SearchBar, EmptyState, SectionTitle, ConfirmDialog, useToast, Textarea } from '@/components/ui'
import { cn, newId, formatDate } from '@/lib/utils'
import { Plus, Trash2, Edit3, Building2, MapPin, Calendar } from 'lucide-react'
import type { ArchitectureProject, ArchCategory, ArchStatus } from '@/types'

const CATEGORIES: ArchCategory[] = ['Academic', 'Professional', 'Personal', 'Competition']
const STATUSES: ArchStatus[] = ['Concept', 'Design Development', 'Working Drawings', 'Completed', 'On Hold']

const EMPTY_FORM = (): Partial<ArchitectureProject> => ({
  name: '', category: 'Academic', status: 'Concept', site_area: '',
  built_area: '', location: '', concept: '', program: '', style: '',
  year: new Date().getFullYear(), collaborators: [], tools_used: [], awards: '', notes: ''
})

const STATUS_COLOR: Record<ArchStatus, 'gray'|'gold'|'blue'|'green'|'orange'> = {
  Concept: 'gray', 'Design Development': 'gold', 'Working Drawings': 'blue', Completed: 'green', 'On Hold': 'orange'
}

export default function ArchitecturePage() {
  const { profile, archProjects, setArchProjects, upsertArchProject, removeArchProject } = useStore()
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Partial<ArchitectureProject>>(EMPTY_FORM())
  const [isEdit, setIsEdit] = useState(false)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState<ArchCategory | 'All'>('All')
  const [statFilter, setStatFilter] = useState<ArchStatus | 'All'>('All')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [toolInput, setToolInput] = useState('')
  const { toast, ToastContainer } = useToast()
  const uid = profile?.id ?? 'local'

  useEffect(() => {
    ArchDB.list(uid).then(data => { setArchProjects(data); setLoading(false) })
  }, [uid])

  const filtered = useMemo(() => archProjects.filter(p => {
    if (catFilter !== 'All' && p.category !== catFilter) return false
    if (statFilter !== 'All' && p.status !== statFilter) return false
    if (search) { const q = search.toLowerCase(); return p.name.toLowerCase().includes(q) || p.concept?.toLowerCase().includes(q) || p.location?.toLowerCase().includes(q) }
    return true
  }), [archProjects, catFilter, statFilter, search])

  const openNew = () => { setEditing(EMPTY_FORM()); setIsEdit(false); setModalOpen(true) }
  const openEdit = (p: ArchitectureProject) => { setEditing({ ...p }); setIsEdit(true); setModalOpen(true) }

  const save = async () => {
    if (!editing.name?.trim()) { toast.error('Project name is required'); return }
    setSaving(true)
    const project: ArchitectureProject = {
      id: isEdit ? editing.id! : newId(),
      user_id: uid,
      name: editing.name!,
      category: editing.category as ArchCategory ?? 'Academic',
      status: editing.status as ArchStatus ?? 'Concept',
      site_area: editing.site_area ?? null,
      built_area: editing.built_area ?? null,
      location: editing.location ?? null,
      concept: editing.concept ?? null,
      program: editing.program ?? null,
      style: editing.style ?? null,
      year: editing.year ? Number(editing.year) : null,
      collaborators: editing.collaborators ?? [],
      tools_used: editing.tools_used ?? [],
      awards: editing.awards ?? null,
      notes: editing.notes ?? null,
      created_at: isEdit ? editing.created_at! : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    upsertArchProject(project)
    await ArchDB.save(project)
    setSaving(false); setModalOpen(false)
    toast.success(isEdit ? 'Project updated' : 'Project added')
  }

  const del = async (id: string) => {
    removeArchProject(id); await ArchDB.delete(id); toast.success('Project removed')
  }

  const addTool = () => {
    if (!toolInput.trim()) return
    setEditing(p => ({ ...p, tools_used: [...(p.tools_used ?? []), toolInput.trim()] }))
    setToolInput('')
  }

  if (loading) return <div className="flex items-center justify-center h-full"><p className="text-ink-3 animate-pulse">Loading projects...</p></div>

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ToastContainer />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Architecture Vault</h1>
          <p className="text-ink-3 text-sm mt-0.5">Academic · Professional · Competition projects</p>
        </div>
        <Button variant="gold" onClick={openNew}><Plus size={15} />New Project</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Projects" value={archProjects.length} gold />
        <StatCard label="Academic" value={archProjects.filter(p=>p.category==='Academic').length} up />
        <StatCard label="Professional" value={archProjects.filter(p=>p.category==='Professional').length} up />
        <StatCard label="Completed" value={archProjects.filter(p=>p.status==='Completed').length} up />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Search projects..." />
        <div className="flex gap-2 flex-wrap">
          {(['All', ...CATEGORIES] as const).map(c => (
            <button key={c} onClick={() => setCatFilter(c as any)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                catFilter === c ? 'bg-gold/15 text-gold border-gold/30' : 'border-border text-ink-3 hover:text-ink')}>
              {c}
            </button>
          ))}
        </div>
        <Select value={statFilter} onChange={e => setStatFilter(e.target.value as any)}
          options={[{ value:'All', label:'All Status' }, ...STATUSES.map(s => ({ value:s, label:s }))]}
          className="w-44" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="🏛️" title="No projects yet" description="Document your architecture projects — academic, professional, or competition entries." action={<Button variant="gold" onClick={openNew}><Plus size={15} />Add First Project</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(project => (
            <Card key={project.id} className="group hover:border-gold/30 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Building2 size={16} className="text-gold flex-shrink-0" />
                  <h3 className="font-semibold text-ink">{project.name}</h3>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(project)} className="text-ink-3 hover:text-gold transition-colors"><Edit3 size={14} /></button>
                  <button onClick={() => setDeleteId(project.id)} className="text-ink-3 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <Badge label={project.category} color={project.category === 'Academic' ? 'blue' : project.category === 'Competition' ? 'purple' : project.category === 'Professional' ? 'gold' : 'gray'} />
                <Badge label={project.status} color={STATUS_COLOR[project.status]} />
                {project.year && <Badge label={String(project.year)} color="gray" />}
              </div>

              {project.concept && <p className="text-xs text-ink-3 leading-relaxed mb-3 line-clamp-2">{project.concept}</p>}

              <div className="grid grid-cols-2 gap-2 text-[11px] text-ink-3">
                {project.location && <div className="flex items-center gap-1"><MapPin size={10} />{project.location}</div>}
                {project.site_area && <div>Site: {project.site_area}</div>}
                {project.style && <div>Style: {project.style}</div>}
                {project.program && <div>Program: {project.program}</div>}
              </div>

              {project.tools_used.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border">
                  {project.tools_used.map(t => <Badge key={t} label={t} color="gray" />)}
                </div>
              )}

              {project.awards && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-[11px] text-gold">🏆 {project.awards}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={isEdit ? 'Edit Project' : 'New Project'} size="xl">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Project Name" required className="col-span-2">
            <input value={editing.name ?? ''} onChange={e => setEditing(p => ({...p, name: e.target.value}))} placeholder="Project name..." />
          </Field>
          <Field label="Category">
            <Select value={editing.category ?? 'Academic'} onChange={e => setEditing(p => ({...p, category: e.target.value as ArchCategory}))}
              options={CATEGORIES.map(c => ({ value:c, label:c }))} />
          </Field>
          <Field label="Status">
            <Select value={editing.status ?? 'Concept'} onChange={e => setEditing(p => ({...p, status: e.target.value as ArchStatus}))}
              options={STATUSES.map(s => ({ value:s, label:s }))} />
          </Field>
          <Field label="Location">
            <input value={editing.location ?? ''} onChange={e => setEditing(p => ({...p, location: e.target.value}))} placeholder="City, Country..." />
          </Field>
          <Field label="Year">
            <input type="number" value={editing.year ?? ''} onChange={e => setEditing(p => ({...p, year: Number(e.target.value)}))} placeholder={String(new Date().getFullYear())} />
          </Field>
          <Field label="Site Area">
            <input value={editing.site_area ?? ''} onChange={e => setEditing(p => ({...p, site_area: e.target.value}))} placeholder="e.g. 2500 sqm" />
          </Field>
          <Field label="Built Area">
            <input value={editing.built_area ?? ''} onChange={e => setEditing(p => ({...p, built_area: e.target.value}))} placeholder="e.g. 1800 sqm" />
          </Field>
          <Field label="Style / Typology">
            <input value={editing.style ?? ''} onChange={e => setEditing(p => ({...p, style: e.target.value}))} placeholder="e.g. Brutalist, Parametric, Vernacular" />
          </Field>
          <Field label="Building Program">
            <input value={editing.program ?? ''} onChange={e => setEditing(p => ({...p, program: e.target.value}))} placeholder="e.g. Housing, Cultural Centre, Museum" />
          </Field>
          <Field label="Concept" className="col-span-2">
            <Textarea value={editing.concept ?? ''} onChange={e => setEditing(p => ({...p, concept: e.target.value}))} placeholder="Design concept and philosophy..." rows={3} />
          </Field>
          <Field label="Tools Used" className="col-span-2">
            <div className="flex gap-2 mb-2">
              <input value={toolInput} onChange={e => setToolInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTool()} placeholder="AutoCAD, Revit, Rhino, SketchUp..." className="flex-1" />
              <Button variant="ghost" size="sm" onClick={addTool}>Add</Button>
            </div>
            {(editing.tools_used ?? []).length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {(editing.tools_used ?? []).map((t, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-bg-4 border border-border rounded-full text-xs text-ink-2">
                    {t}
                    <button onClick={() => setEditing(p => ({ ...p, tools_used: (p.tools_used ?? []).filter((_, j) => j !== i) }))} className="text-ink-3 hover:text-red-400 ml-1">×</button>
                  </span>
                ))}
              </div>
            )}
          </Field>
          <Field label="Awards / Recognition" className="col-span-2">
            <input value={editing.awards ?? ''} onChange={e => setEditing(p => ({...p, awards: e.target.value}))} placeholder="Any awards or recognition..." />
          </Field>
          <Field label="Notes" className="col-span-2">
            <Textarea value={editing.notes ?? ''} onChange={e => setEditing(p => ({...p, notes: e.target.value}))} placeholder="Additional project notes..." rows={3} />
          </Field>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="gold" onClick={save} loading={saving}>{isEdit ? 'Update' : 'Add'} Project</Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && del(deleteId)} title="Delete Project" message="This project will be permanently removed." />
    </div>
  )
}
