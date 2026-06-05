// ============================================================
// LOCAL STORAGE FALLBACK — Full offline capability
// ============================================================
import type { LocalStore, Idea, Artwork, ArchitectureProject, Goal, Task, ContentItem, ResearchNote, BrainEntry, DailyReview } from '@/types'

const KEY = 'ak_empire_os_data'

const defaultStore: LocalStore = {
  ideas: [], artworks: [], architectureProjects: [], goals: [],
  tasks: [], contentItems: [], researchNotes: [], brainEntries: [],
  dailyReviews: [], lastSynced: null
}

export function getLocalStore(): LocalStore {
  if (typeof window === 'undefined') return defaultStore
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...defaultStore, ...JSON.parse(raw) } : defaultStore
  } catch { return defaultStore }
}

export function saveLocalStore(store: LocalStore): void {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(KEY, JSON.stringify(store)) } catch {}
}

function patch<T extends { id: string }>(arr: T[], item: T): T[] {
  const idx = arr.findIndex(x => x.id === item.id)
  return idx >= 0 ? [...arr.slice(0, idx), item, ...arr.slice(idx + 1)] : [...arr, item]
}

function remove<T extends { id: string }>(arr: T[], id: string): T[] {
  return arr.filter(x => x.id !== id)
}

// ─── CRUD helpers ─────────────────────────────────────────────

export const localIdeas = {
  getAll: () => getLocalStore().ideas,
  save: (idea: Idea) => { const s = getLocalStore(); saveLocalStore({ ...s, ideas: patch(s.ideas, idea) }) },
  delete: (id: string) => { const s = getLocalStore(); saveLocalStore({ ...s, ideas: remove(s.ideas, id) }) },
}

export const localArtworks = {
  getAll: () => getLocalStore().artworks,
  save: (a: Artwork) => { const s = getLocalStore(); saveLocalStore({ ...s, artworks: patch(s.artworks, a) }) },
  delete: (id: string) => { const s = getLocalStore(); saveLocalStore({ ...s, artworks: remove(s.artworks, id) }) },
}

export const localArchProjects = {
  getAll: () => getLocalStore().architectureProjects,
  save: (p: ArchitectureProject) => { const s = getLocalStore(); saveLocalStore({ ...s, architectureProjects: patch(s.architectureProjects, p) }) },
  delete: (id: string) => { const s = getLocalStore(); saveLocalStore({ ...s, architectureProjects: remove(s.architectureProjects, id) }) },
}

export const localGoals = {
  getAll: () => getLocalStore().goals,
  save: (g: Goal) => { const s = getLocalStore(); saveLocalStore({ ...s, goals: patch(s.goals, g) }) },
  delete: (id: string) => { const s = getLocalStore(); saveLocalStore({ ...s, goals: remove(s.goals, id) }) },
}

export const localTasks = {
  getAll: () => getLocalStore().tasks,
  save: (t: Task) => { const s = getLocalStore(); saveLocalStore({ ...s, tasks: patch(s.tasks, t) }) },
  delete: (id: string) => { const s = getLocalStore(); saveLocalStore({ ...s, tasks: remove(s.tasks, id) }) },
}

export const localContent = {
  getAll: () => getLocalStore().contentItems,
  save: (c: ContentItem) => { const s = getLocalStore(); saveLocalStore({ ...s, contentItems: patch(s.contentItems, c) }) },
  delete: (id: string) => { const s = getLocalStore(); saveLocalStore({ ...s, contentItems: remove(s.contentItems, id) }) },
}

export const localResearch = {
  getAll: () => getLocalStore().researchNotes,
  save: (n: ResearchNote) => { const s = getLocalStore(); saveLocalStore({ ...s, researchNotes: patch(s.researchNotes, n) }) },
  delete: (id: string) => { const s = getLocalStore(); saveLocalStore({ ...s, researchNotes: remove(s.researchNotes, id) }) },
}

export const localBrain = {
  getAll: () => getLocalStore().brainEntries,
  save: (e: BrainEntry) => { const s = getLocalStore(); saveLocalStore({ ...s, brainEntries: patch(s.brainEntries, e) }) },
  delete: (id: string) => { const s = getLocalStore(); saveLocalStore({ ...s, brainEntries: remove(s.brainEntries, id) }) },
}

export const localReviews = {
  getAll: () => getLocalStore().dailyReviews,
  save: (r: DailyReview) => { const s = getLocalStore(); saveLocalStore({ ...s, dailyReviews: patch(s.dailyReviews, r) }) },
  getByDate: (date: string) => getLocalStore().dailyReviews.find(r => r.review_date === date) ?? null,
}
