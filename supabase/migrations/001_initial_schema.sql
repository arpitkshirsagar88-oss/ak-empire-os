-- ============================================================
-- AK EMPIRE OS — FULL DATABASE SCHEMA
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── PROFILES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT UNIQUE NOT NULL,
  full_name    TEXT,
  avatar_url   TEXT,
  username     TEXT UNIQUE,
  bio          TEXT,
  youtube_channel_id TEXT,
  instagram_handle   TEXT,
  website_url        TEXT,
  content_score      INTEGER DEFAULT 0,
  upload_streak      INTEGER DEFAULT 0,
  last_upload_date   DATE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── IDEAS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ideas (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  hook            TEXT,
  description     TEXT,
  category        TEXT NOT NULL DEFAULT 'YouTube'
                  CHECK (category IN ('Architecture','Art','YouTube','Business','Personal Growth')),
  tags            TEXT[] DEFAULT '{}',
  status          TEXT DEFAULT 'Active'
                  CHECK (status IN ('Active','In Progress','Done','Archived')),
  priority        INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  viral_score     NUMERIC(3,1) DEFAULT 5.0,
  evergreen_score NUMERIC(3,1) DEFAULT 5.0,
  estimated_views TEXT,
  difficulty      TEXT DEFAULT 'Medium'
                  CHECK (difficulty IN ('Easy','Medium','Hard')),
  format          TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ARTWORKS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS artworks (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  medium           TEXT NOT NULL
                   CHECK (medium IN ('Graphite','Charcoal','Color Pencil','Ink','Digital','Mixed Media','Other')),
  status           TEXT DEFAULT 'In Progress'
                   CHECK (status IN ('Planned','In Progress','Completed','Archived')),
  subject          TEXT,
  reference_url    TEXT,
  instagram_post_url TEXT,
  sold             BOOLEAN DEFAULT FALSE,
  sale_price       NUMERIC(10,2),
  time_spent_hours NUMERIC(6,2),
  dimensions       TEXT,
  notes            TEXT,
  completed_date   DATE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ARCHITECTURE PROJECTS ───────────────────────────────────
CREATE TABLE IF NOT EXISTS architecture_projects (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  category      TEXT DEFAULT 'Academic'
                CHECK (category IN ('Academic','Professional','Personal','Competition')),
  status        TEXT DEFAULT 'Concept'
                CHECK (status IN ('Concept','Design Development','Working Drawings','Completed','On Hold')),
  site_area     TEXT,
  built_area    TEXT,
  location      TEXT,
  concept       TEXT,
  program       TEXT,
  style         TEXT,
  year          INTEGER,
  collaborators TEXT[],
  tools_used    TEXT[],
  awards        TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── GOALS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS goals (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  category     TEXT NOT NULL
               CHECK (category IN ('Art','Architecture','YouTube','Income','Learning','Health','Personal')),
  target_value NUMERIC(12,2),
  current_value NUMERIC(12,2) DEFAULT 0,
  unit         TEXT DEFAULT 'units',
  deadline     DATE,
  status       TEXT DEFAULT 'Active'
               CHECK (status IN ('Active','Completed','Paused','Abandoned')),
  priority     INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TASKS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  goal_id      UUID REFERENCES goals(id) ON DELETE SET NULL,
  title        TEXT NOT NULL,
  description  TEXT,
  category     TEXT DEFAULT 'General',
  priority     TEXT DEFAULT 'Medium'
               CHECK (priority IN ('Low','Medium','High','Critical')),
  status       TEXT DEFAULT 'Todo'
               CHECK (status IN ('Todo','In Progress','Done','Cancelled')),
  due_date     DATE,
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CONTENT CALENDAR ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS content_items (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  idea_id        UUID REFERENCES ideas(id) ON DELETE SET NULL,
  title          TEXT NOT NULL,
  content_type   TEXT DEFAULT 'Long Video'
                 CHECK (content_type IN ('Long Video','Short','Reel','Tutorial','Documentary','Vlog')),
  platform       TEXT DEFAULT 'YouTube'
                 CHECK (platform IN ('YouTube','Instagram','Both')),
  pipeline_stage TEXT DEFAULT 'Idea'
                 CHECK (pipeline_stage IN ('Idea','Research','Script','Thumbnail','Recording','Editing','Scheduled','Published')),
  scheduled_date DATE,
  published_date DATE,
  youtube_url    TEXT,
  thumbnail_url  TEXT,
  views          INTEGER,
  likes          INTEGER,
  comments       INTEGER,
  ctr            NUMERIC(5,2),
  retention_pct  NUMERIC(5,2),
  revenue        NUMERIC(10,2),
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SCRIPTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scripts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_item_id UUID REFERENCES content_items(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  script_type     TEXT DEFAULT 'Long-form'
                  CHECK (script_type IN ('Long-form','Short','Educational','Storytelling','Documentary')),
  hook            TEXT,
  body            TEXT,
  cta             TEXT,
  full_script     TEXT,
  word_count      INTEGER,
  estimated_duration_mins NUMERIC(5,1),
  status          TEXT DEFAULT 'Draft'
                  CHECK (status IN ('Draft','Review','Final')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── RESEARCH NOTES ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS research_notes (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  content      TEXT,
  category     TEXT DEFAULT 'General'
               CHECK (category IN ('Reference','Competitor','Book','Quote','Link','Framework','Inspiration','General')),
  source_url   TEXT,
  tags         TEXT[] DEFAULT '{}',
  is_favorite  BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── DAILY REVIEWS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_reviews (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  review_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  published_today  TEXT,
  learned_today    TEXT,
  next_priority    TEXT,
  mood_score       INTEGER CHECK (mood_score BETWEEN 1 AND 10),
  productivity_score INTEGER CHECK (productivity_score BETWEEN 1 AND 10),
  wins             TEXT[],
  challenges       TEXT[],
  ai_report        TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, review_date)
);

-- ─── YOUTUBE ANALYTICS SNAPSHOTS ─────────────────────────────
CREATE TABLE IF NOT EXISTS youtube_snapshots (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  snapshot_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  subscribers     INTEGER,
  total_views     BIGINT,
  monthly_views   INTEGER,
  watch_time_hrs  NUMERIC(12,2),
  avg_ctr         NUMERIC(5,2),
  avg_retention   NUMERIC(5,2),
  monthly_revenue NUMERIC(10,2),
  rpm             NUMERIC(8,2),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, snapshot_date)
);

-- ─── SECOND BRAIN ENTRIES ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS brain_entries (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  content      TEXT,
  entry_type   TEXT DEFAULT 'Note'
               CHECK (entry_type IN ('Idea','Quote','Book','Framework','Lesson','Script','Note','Principle')),
  tags         TEXT[] DEFAULT '{}',
  source       TEXT,
  is_favorite  BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── RLS POLICIES ────────────────────────────────────────────
ALTER TABLE profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas               ENABLE ROW LEVEL SECURITY;
ALTER TABLE artworks            ENABLE ROW LEVEL SECURITY;
ALTER TABLE architecture_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals               ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks               ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE scripts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_notes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reviews       ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_snapshots   ENABLE ROW LEVEL SECURITY;
ALTER TABLE brain_entries       ENABLE ROW LEVEL SECURITY;

-- Generic user-owns-row policy generator
DO $$ 
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['ideas','artworks','architecture_projects','goals','tasks',
    'content_items','scripts','research_notes','daily_reviews','youtube_snapshots','brain_entries']
  LOOP
    EXECUTE format('
      CREATE POLICY "%s_owner" ON %s
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid());
    ', tbl, tbl);
  END LOOP;
END $$;

CREATE POLICY "profiles_owner" ON profiles
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ─── AUTO-UPDATE TRIGGERS ─────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['profiles','ideas','artworks','architecture_projects',
    'goals','tasks','content_items','scripts','research_notes','brain_entries']
  LOOP
    EXECUTE format('
      CREATE TRIGGER trg_%s_updated_at
      BEFORE UPDATE ON %s
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    ', tbl, tbl);
  END LOOP;
END $$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── INDEXES ─────────────────────────────────────────────────
CREATE INDEX idx_ideas_user          ON ideas(user_id, created_at DESC);
CREATE INDEX idx_ideas_category      ON ideas(user_id, category);
CREATE INDEX idx_artworks_user       ON artworks(user_id, created_at DESC);
CREATE INDEX idx_arch_user           ON architecture_projects(user_id, created_at DESC);
CREATE INDEX idx_goals_user          ON goals(user_id, status);
CREATE INDEX idx_tasks_user          ON tasks(user_id, status, due_date);
CREATE INDEX idx_content_user        ON content_items(user_id, pipeline_stage);
CREATE INDEX idx_content_scheduled   ON content_items(user_id, scheduled_date);
CREATE INDEX idx_brain_user          ON brain_entries(user_id, entry_type);
CREATE INDEX idx_reviews_user        ON daily_reviews(user_id, review_date DESC);
