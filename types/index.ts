// ============================================================
// AK EMPIRE OS — COMPLETE TYPE DEFINITIONS
// ============================================================

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  username: string | null
  bio: string | null
  youtube_channel_id: string | null
  instagram_handle: string | null
  website_url: string | null
  content_score: number
  upload_streak: number
  last_upload_date: string | null
  created_at: string
  updated_at: string
}

export type IdeaCategory = 'Architecture' | 'Art' | 'YouTube' | 'Business' | 'Personal Growth'
export type IdeaStatus = 'Active' | 'In Progress' | 'Done' | 'Archived'
export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export interface Idea {
  id: string
  user_id: string
  title: string
  hook: string | null
  description: string | null
  category: IdeaCategory
  tags: string[]
  status: IdeaStatus
  priority: number
  viral_score: number
  evergreen_score: number
  estimated_views: string | null
  difficulty: Difficulty
  format: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type ArtworkMedium = 'Graphite' | 'Charcoal' | 'Color Pencil' | 'Ink' | 'Digital' | 'Mixed Media' | 'Other'
export type ArtworkStatus = 'Planned' | 'In Progress' | 'Completed' | 'Archived'

export interface Artwork {
  id: string
  user_id: string
  title: string
  medium: ArtworkMedium
  status: ArtworkStatus
  subject: string | null
  reference_url: string | null
  instagram_post_url: string | null
  sold: boolean
  sale_price: number | null
  time_spent_hours: number | null
  dimensions: string | null
  notes: string | null
  completed_date: string | null
  created_at: string
  updated_at: string
}

export type ArchCategory = 'Academic' | 'Professional' | 'Personal' | 'Competition'
export type ArchStatus = 'Concept' | 'Design Development' | 'Working Drawings' | 'Completed' | 'On Hold'

export interface ArchitectureProject {
  id: string
  user_id: string
  name: string
  category: ArchCategory
  status: ArchStatus
  site_area: string | null
  built_area: string | null
  location: string | null
  concept: string | null
  program: string | null
  style: string | null
  year: number | null
  collaborators: string[]
  tools_used: string[]
  awards: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type GoalCategory = 'Art' | 'Architecture' | 'YouTube' | 'Income' | 'Learning' | 'Health' | 'Personal'
export type GoalStatus = 'Active' | 'Completed' | 'Paused' | 'Abandoned'

export interface Goal {
  id: string
  user_id: string
  title: string
  description: string | null
  category: GoalCategory
  target_value: number
  current_value: number
  unit: string
  deadline: string | null
  status: GoalStatus
  priority: number
  created_at: string
  updated_at: string
}

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical'
export type TaskStatus = 'Todo' | 'In Progress' | 'Done' | 'Cancelled'

export interface Task {
  id: string
  user_id: string
  goal_id: string | null
  title: string
  description: string | null
  category: string
  priority: TaskPriority
  status: TaskStatus
  due_date: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export type ContentType = 'Long Video' | 'Short' | 'Reel' | 'Tutorial' | 'Documentary' | 'Vlog'
export type Platform = 'YouTube' | 'Instagram' | 'Both'
export type PipelineStage = 'Idea' | 'Research' | 'Script' | 'Thumbnail' | 'Recording' | 'Editing' | 'Scheduled' | 'Published'

export interface ContentItem {
  id: string
  user_id: string
  idea_id: string | null
  title: string
  content_type: ContentType
  platform: Platform
  pipeline_stage: PipelineStage
  scheduled_date: string | null
  published_date: string | null
  youtube_url: string | null
  thumbnail_url: string | null
  views: number | null
  likes: number | null
  comments: number | null
  ctr: number | null
  retention_pct: number | null
  revenue: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type ScriptType = 'Long-form' | 'Short' | 'Educational' | 'Storytelling' | 'Documentary'

export interface Script {
  id: string
  user_id: string
  content_item_id: string | null
  title: string
  script_type: ScriptType
  hook: string | null
  body: string | null
  cta: string | null
  full_script: string | null
  word_count: number | null
  estimated_duration_mins: number | null
  status: 'Draft' | 'Review' | 'Final'
  created_at: string
  updated_at: string
}

export type ResearchCategory = 'Reference' | 'Competitor' | 'Book' | 'Quote' | 'Link' | 'Framework' | 'Inspiration' | 'General'

export interface ResearchNote {
  id: string
  user_id: string
  title: string
  content: string | null
  category: ResearchCategory
  source_url: string | null
  tags: string[]
  is_favorite: boolean
  created_at: string
  updated_at: string
}

export interface DailyReview {
  id: string
  user_id: string
  review_date: string
  published_today: string | null
  learned_today: string | null
  next_priority: string | null
  mood_score: number | null
  productivity_score: number | null
  wins: string[]
  challenges: string[]
  ai_report: string | null
  created_at: string
}

export interface YoutubeSnapshot {
  id: string
  user_id: string
  snapshot_date: string
  subscribers: number | null
  total_views: number | null
  monthly_views: number | null
  watch_time_hrs: number | null
  avg_ctr: number | null
  avg_retention: number | null
  monthly_revenue: number | null
  rpm: number | null
  created_at: string
}

export type BrainEntryType = 'Idea' | 'Quote' | 'Book' | 'Framework' | 'Lesson' | 'Script' | 'Note' | 'Principle'

export interface BrainEntry {
  id: string
  user_id: string
  title: string
  content: string | null
  entry_type: BrainEntryType
  tags: string[]
  source: string | null
  is_favorite: boolean
  created_at: string
  updated_at: string
}

// Local storage shape
export interface LocalStore {
  ideas: Idea[]
  artworks: Artwork[]
  architectureProjects: ArchitectureProject[]
  goals: Goal[]
  tasks: Task[]
  contentItems: ContentItem[]
  researchNotes: ResearchNote[]
  brainEntries: BrainEntry[]
  dailyReviews: DailyReview[]
  lastSynced: string | null
}

// Dashboard stats
export interface DashboardStats {
  totalIdeas: number
  activeGoals: number
  completedArtworks: number
  activeProjects: number
  contentInPipeline: number
  uploadStreak: number
  contentScore: number
  weeklyGoalsProgress: number
  brainEntries: number
}

// AI generation requests
export interface AIScriptRequest {
  topic: string
  scriptType: ScriptType
  targetDuration?: number
  audienceDescription?: string
  tone?: string
}

export interface AIScriptResponse {
  hook: string
  openLoop: string
  body: string
  retentionTriggers: string[]
  cta: string
  close: string
  fullScript: string
  estimatedDuration: number
  wordCount: number
}

export interface AITitleRequest {
  topic: string
  contentType: ContentType
  targetAudience?: string
}

export interface AIHookRequest {
  topic: string
  style: 'question' | 'statement' | 'story' | 'statistic' | 'controversy'
}
