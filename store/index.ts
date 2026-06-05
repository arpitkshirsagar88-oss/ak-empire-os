// ============================================================
// ZUSTAND GLOBAL STORE
// ============================================================
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Profile, Idea, Artwork, ArchitectureProject, Goal, Task, ContentItem, ResearchNote, BrainEntry, DailyReview } from '@/types'

interface AppState {
  // Auth
  profile: Profile | null
  setProfile: (p: Profile | null) => void

  // Ideas
  ideas: Idea[]
  setIdeas: (ideas: Idea[]) => void
  upsertIdea: (idea: Idea) => void
  removeIdea: (id: string) => void

  // Artworks
  artworks: Artwork[]
  setArtworks: (artworks: Artwork[]) => void
  upsertArtwork: (artwork: Artwork) => void
  removeArtwork: (id: string) => void

  // Architecture
  archProjects: ArchitectureProject[]
  setArchProjects: (projects: ArchitectureProject[]) => void
  upsertArchProject: (project: ArchitectureProject) => void
  removeArchProject: (id: string) => void

  // Goals
  goals: Goal[]
  setGoals: (goals: Goal[]) => void
  upsertGoal: (goal: Goal) => void
  removeGoal: (id: string) => void

  // Tasks
  tasks: Task[]
  setTasks: (tasks: Task[]) => void
  upsertTask: (task: Task) => void
  removeTask: (id: string) => void

  // Content
  contentItems: ContentItem[]
  setContentItems: (items: ContentItem[]) => void
  upsertContentItem: (item: ContentItem) => void
  removeContentItem: (id: string) => void

  // Research
  researchNotes: ResearchNote[]
  setResearchNotes: (notes: ResearchNote[]) => void
  upsertResearchNote: (note: ResearchNote) => void
  removeResearchNote: (id: string) => void

  // Brain
  brainEntries: BrainEntry[]
  setBrainEntries: (entries: BrainEntry[]) => void
  upsertBrainEntry: (entry: BrainEntry) => void
  removeBrainEntry: (id: string) => void

  // Reviews
  dailyReviews: DailyReview[]
  setDailyReviews: (reviews: DailyReview[]) => void
  upsertDailyReview: (review: DailyReview) => void

  // UI
  sidebarOpen: boolean
  toggleSidebar: () => void
  activeModule: string
  setActiveModule: (module: string) => void
}

const upsertFn = <T extends { id: string }>(arr: T[], item: T): T[] => {
  const idx = arr.findIndex(x => x.id === item.id)
  return idx >= 0 ? [...arr.slice(0, idx), item, ...arr.slice(idx + 1)] : [item, ...arr]
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (p) => set({ profile: p }),

      ideas: [], setIdeas: (ideas) => set({ ideas }),
      upsertIdea: (idea) => set(s => ({ ideas: upsertFn(s.ideas, idea) })),
      removeIdea: (id) => set(s => ({ ideas: s.ideas.filter(x => x.id !== id) })),

      artworks: [], setArtworks: (artworks) => set({ artworks }),
      upsertArtwork: (artwork) => set(s => ({ artworks: upsertFn(s.artworks, artwork) })),
      removeArtwork: (id) => set(s => ({ artworks: s.artworks.filter(x => x.id !== id) })),

      archProjects: [], setArchProjects: (archProjects) => set({ archProjects }),
      upsertArchProject: (project) => set(s => ({ archProjects: upsertFn(s.archProjects, project) })),
      removeArchProject: (id) => set(s => ({ archProjects: s.archProjects.filter(x => x.id !== id) })),

      goals: [], setGoals: (goals) => set({ goals }),
      upsertGoal: (goal) => set(s => ({ goals: upsertFn(s.goals, goal) })),
      removeGoal: (id) => set(s => ({ goals: s.goals.filter(x => x.id !== id) })),

      tasks: [], setTasks: (tasks) => set({ tasks }),
      upsertTask: (task) => set(s => ({ tasks: upsertFn(s.tasks, task) })),
      removeTask: (id) => set(s => ({ tasks: s.tasks.filter(x => x.id !== id) })),

      contentItems: [], setContentItems: (contentItems) => set({ contentItems }),
      upsertContentItem: (item) => set(s => ({ contentItems: upsertFn(s.contentItems, item) })),
      removeContentItem: (id) => set(s => ({ contentItems: s.contentItems.filter(x => x.id !== id) })),

      researchNotes: [], setResearchNotes: (researchNotes) => set({ researchNotes }),
      upsertResearchNote: (note) => set(s => ({ researchNotes: upsertFn(s.researchNotes, note) })),
      removeResearchNote: (id) => set(s => ({ researchNotes: s.researchNotes.filter(x => x.id !== id) })),

      brainEntries: [], setBrainEntries: (brainEntries) => set({ brainEntries }),
      upsertBrainEntry: (entry) => set(s => ({ brainEntries: upsertFn(s.brainEntries, entry) })),
      removeBrainEntry: (id) => set(s => ({ brainEntries: s.brainEntries.filter(x => x.id !== id) })),

      dailyReviews: [], setDailyReviews: (dailyReviews) => set({ dailyReviews }),
      upsertDailyReview: (review) => set(s => ({ dailyReviews: upsertFn(s.dailyReviews, review) })),

      sidebarOpen: true,
      toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
      activeModule: 'dashboard',
      setActiveModule: (module) => set({ activeModule: module }),
    }),
    { name: 'ak-empire-store', partialize: (s) => ({
        ideas: s.ideas, artworks: s.artworks, archProjects: s.archProjects,
        goals: s.goals, tasks: s.tasks, contentItems: s.contentItems,
        researchNotes: s.researchNotes, brainEntries: s.brainEntries,
        dailyReviews: s.dailyReviews,
      }),
    }
  )
)
