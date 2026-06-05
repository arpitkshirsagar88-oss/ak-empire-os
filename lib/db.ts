// ============================================================
// DATABASE LAYER — Supabase first, localStorage fallback
// ============================================================
import { getSupabaseClient } from './supabase-client'
import * as local from './local-storage'
import type { Idea, Artwork, ArchitectureProject, Goal, Task, ContentItem, ResearchNote, BrainEntry, DailyReview } from '@/types'

function isAvailable(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url')
}

type Table = 'ideas' | 'artworks' | 'architecture_projects' | 'goals' | 'tasks' |
  'content_items' | 'research_notes' | 'brain_entries' | 'daily_reviews'

async function dbGet<T>(table: Table, userId: string, extra?: Record<string, string>): Promise<T[]> {
  if (!isAvailable()) return []
  const sb = getSupabaseClient()
  let q = sb.from(table).select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (extra) Object.entries(extra).forEach(([k, v]) => { q = q.eq(k, v) })
  const { data, error } = await q
  if (error) { console.error(`db.get ${table}:`, error.message); return [] }
  return (data ?? []) as T[]
}

async function dbUpsert<T extends { id: string }>(table: Table, record: T): Promise<T | null> {
  if (!isAvailable()) return null
  const sb = getSupabaseClient()
  const { data, error } = await sb.from(table).upsert(record).select().single()
  if (error) { console.error(`db.upsert ${table}:`, error.message); return null }
  return data as T
}

async function dbDelete(table: Table, id: string): Promise<boolean> {
  if (!isAvailable()) return false
  const sb = getSupabaseClient()
  const { error } = await sb.from(table).delete().eq('id', id)
  if (error) { console.error(`db.delete ${table}:`, error.message); return false }
  return true
}

// ─── IDEAS ────────────────────────────────────────────────────
export const Ideas = {
  list: async (userId: string): Promise<Idea[]> => {
    const remote = await dbGet<Idea>('ideas', userId)
    if (remote.length) { return remote }
    return local.localIdeas.getAll()
  },
  save: async (idea: Idea): Promise<Idea> => {
    local.localIdeas.save(idea)
    const saved = await dbUpsert<Idea>('ideas', idea)
    return saved ?? idea
  },
  delete: async (id: string): Promise<void> => {
    local.localIdeas.delete(id)
    await dbDelete('ideas', id)
  },
}

// ─── ARTWORKS ─────────────────────────────────────────────────
export const Artworks = {
  list: async (userId: string): Promise<Artwork[]> => {
    const remote = await dbGet<Artwork>('artworks', userId)
    return remote.length ? remote : local.localArtworks.getAll()
  },
  save: async (artwork: Artwork): Promise<Artwork> => {
    local.localArtworks.save(artwork)
    const saved = await dbUpsert<Artwork>('artworks', artwork)
    return saved ?? artwork
  },
  delete: async (id: string): Promise<void> => {
    local.localArtworks.delete(id)
    await dbDelete('artworks', id)
  },
}

// ─── ARCHITECTURE PROJECTS ─────────────────────────────────────
export const ArchProjects = {
  list: async (userId: string): Promise<ArchitectureProject[]> => {
    const remote = await dbGet<ArchitectureProject>('architecture_projects', userId)
    return remote.length ? remote : local.localArchProjects.getAll()
  },
  save: async (project: ArchitectureProject): Promise<ArchitectureProject> => {
    local.localArchProjects.save(project)
    const saved = await dbUpsert<ArchitectureProject>('architecture_projects', project)
    return saved ?? project
  },
  delete: async (id: string): Promise<void> => {
    local.localArchProjects.delete(id)
    await dbDelete('architecture_projects', id)
  },
}

// ─── GOALS ────────────────────────────────────────────────────
export const Goals = {
  list: async (userId: string): Promise<Goal[]> => {
    const remote = await dbGet<Goal>('goals', userId)
    return remote.length ? remote : local.localGoals.getAll()
  },
  save: async (goal: Goal): Promise<Goal> => {
    local.localGoals.save(goal)
    const saved = await dbUpsert<Goal>('goals', goal)
    return saved ?? goal
  },
  delete: async (id: string): Promise<void> => {
    local.localGoals.delete(id)
    await dbDelete('goals', id)
  },
}

// ─── TASKS ────────────────────────────────────────────────────
export const Tasks = {
  list: async (userId: string): Promise<Task[]> => {
    const remote = await dbGet<Task>('tasks', userId)
    return remote.length ? remote : local.localTasks.getAll()
  },
  save: async (task: Task): Promise<Task> => {
    local.localTasks.save(task)
    const saved = await dbUpsert<Task>('tasks', task)
    return saved ?? task
  },
  delete: async (id: string): Promise<void> => {
    local.localTasks.delete(id)
    await dbDelete('tasks', id)
  },
}

// ─── CONTENT ──────────────────────────────────────────────────
export const Content = {
  list: async (userId: string): Promise<ContentItem[]> => {
    const remote = await dbGet<ContentItem>('content_items', userId)
    return remote.length ? remote : local.localContent.getAll()
  },
  save: async (item: ContentItem): Promise<ContentItem> => {
    local.localContent.save(item)
    const saved = await dbUpsert<ContentItem>('content_items', item)
    return saved ?? item
  },
  delete: async (id: string): Promise<void> => {
    local.localContent.delete(id)
    await dbDelete('content_items', id)
  },
}

// ─── RESEARCH ─────────────────────────────────────────────────
export const Research = {
  list: async (userId: string): Promise<ResearchNote[]> => {
    const remote = await dbGet<ResearchNote>('research_notes', userId)
    return remote.length ? remote : local.localResearch.getAll()
  },
  save: async (note: ResearchNote): Promise<ResearchNote> => {
    local.localResearch.save(note)
    const saved = await dbUpsert<ResearchNote>('research_notes', note)
    return saved ?? note
  },
  delete: async (id: string): Promise<void> => {
    local.localResearch.delete(id)
    await dbDelete('research_notes', id)
  },
}

// ─── BRAIN ────────────────────────────────────────────────────
export const Brain = {
  list: async (userId: string): Promise<BrainEntry[]> => {
    const remote = await dbGet<BrainEntry>('brain_entries', userId)
    return remote.length ? remote : local.localBrain.getAll()
  },
  save: async (entry: BrainEntry): Promise<BrainEntry> => {
    local.localBrain.save(entry)
    const saved = await dbUpsert<BrainEntry>('brain_entries', entry)
    return saved ?? entry
  },
  delete: async (id: string): Promise<void> => {
    local.localBrain.delete(id)
    await dbDelete('brain_entries', id)
  },
}

// ─── DAILY REVIEWS ────────────────────────────────────────────
export const DailyReviews = {
  list: async (userId: string): Promise<DailyReview[]> => {
    const remote = await dbGet<DailyReview>('daily_reviews', userId)
    return remote.length ? remote : local.localReviews.getAll()
  },
  getToday: async (userId: string): Promise<DailyReview | null> => {
    const today = new Date().toISOString().split('T')[0]
    if (!isAvailable()) return local.localReviews.getByDate(today)
    const sb = getSupabaseClient()
    const { data } = await sb.from('daily_reviews').select('*')
      .eq('user_id', userId).eq('review_date', today).single()
    return (data as DailyReview) ?? null
  },
  save: async (review: DailyReview): Promise<DailyReview> => {
    local.localReviews.save(review)
    const saved = await dbUpsert<DailyReview>('daily_reviews', review)
    return saved ?? review
  },
}
