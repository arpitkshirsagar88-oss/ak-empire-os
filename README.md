# AK Empire OS 🏛️
### The Complete Creator Operating System for Arpit Kshirsagar

---

## ⚡ Run on Your Laptop in 5 Minutes

### Step 1 — Install Node.js
Download from https://nodejs.org (v18 or higher)

### Step 2 — Install dependencies
```bash
cd ak-empire-os
npm install
```

### Step 3 — Set up environment variables
Edit `.env.local` in the project root:

```env
# Required for database sync (optional — app works offline without this)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Required for AI features (Script Generator, Hooks, Strategy, etc.)
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**To get your Anthropic API key:**
1. Go to https://console.anthropic.com
2. Create an account → API Keys → Create Key
3. Paste it into `.env.local`

**The app works fully offline (without Supabase/API keys):**
- All data saves to your browser's localStorage
- AI features show a setup message until key is added

### Step 4 — Start the app
```bash
npm run dev
```

Open http://localhost:3000 in your browser. That's it.

---

## 🗄️ Set Up Supabase (Optional — for cloud sync)

1. Go to https://supabase.com → New Project
2. Go to SQL Editor → paste the entire contents of `supabase/migrations/001_initial_schema.sql`
3. Run it
4. Go to Settings → API → copy your URL and anon key into `.env.local`
5. Enable Google auth: Authentication → Providers → Google (add your Google OAuth credentials)

---

## 📦 What's Built

### 12 Modules
| Module | Features |
|--------|----------|
| 🏠 Dashboard | KPIs, Today's Tasks, Goal Progress, Pipeline Overview |
| 💡 Idea Vault | Full CRUD, Search, Filter, Priority/Viral/Evergreen scores |
| 🎨 Art Portfolio | Gallery, Medium tracking, Sold/Revenue tracking |
| 🏛️ Architecture | Project vault, Academic/Professional/Competition |
| 🎯 Goals | Goal tracker + Task manager, Progress bars |
| 📅 Content Calendar | Monthly calendar, Schedule scheduling |
| ⚡ Pipeline | Drag-and-drop Kanban (8 stages) |
| 🔬 Research Hub | Notes, Competitor analysis, AI summarizer |
| 📊 Analytics | Charts, Pipeline distribution, Goal progress |
| ✨ AI Studio | Script, Hooks, Titles, Thumbnails, Growth Advisor |
| 🧠 Second Brain | Knowledge vault, AI semantic search |
| 👁 CEO Review | Daily/Weekly/Quarterly + AI report generation |

### Tech Stack
- **Next.js 15** (App Router)
- **TypeScript** (fully typed)
- **Tailwind CSS** (custom dark luxury theme)
- **Zustand** (global state + localStorage persistence)
- **Supabase** (PostgreSQL + Auth)
- **Recharts** (analytics charts)
- **Claude API** (AI features)

---

## 🚀 Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Set your environment variables in Vercel dashboard → Settings → Environment Variables.

---

## 📁 Project Structure

```
ak-empire-os/
├── app/
│   ├── (auth)/login/          # Login page
│   ├── (app)/                 # All protected pages
│   │   ├── dashboard/
│   │   ├── ideas/
│   │   ├── art/
│   │   ├── architecture/
│   │   ├── goals/
│   │   ├── content/
│   │   ├── pipeline/
│   │   ├── research/
│   │   ├── analytics/
│   │   ├── ai-studio/
│   │   ├── brain/
│   │   └── ceo-review/
│   └── api/ai/chat/           # Claude streaming endpoint
├── components/
│   ├── ui/                    # Button, Card, Modal, etc.
│   └── layout/                # Sidebar, TopBar
├── lib/
│   ├── db.ts                  # Supabase + localStorage abstraction
│   ├── local-storage.ts       # Full offline fallback
│   ├── supabase-client.ts
│   └── utils.ts
├── store/index.ts             # Zustand global store
├── types/index.ts             # All TypeScript types
└── supabase/migrations/       # Full SQL schema
```
