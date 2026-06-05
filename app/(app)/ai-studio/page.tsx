'use client'
import { useState } from 'react'
import { useStore } from '@/store'
import { Card, Button, Field, Select, SectionTitle, Badge, useToast, Tabs } from '@/components/ui'
import { Sparkles, Copy, Download } from 'lucide-react'

const SCRIPT_TYPES = ['Long-form','Short','Educational','Storytelling','Documentary']
const HOOK_STYLES = ['question','statement','story','statistic','controversy']

export default function AIStudioPage() {
  const { profile } = useStore()
  const [activeTab, setActiveTab] = useState('script')
  const [loading, setLoading] = useState(false)
  const [output, setOutput] = useState('')

  // Script state
  const [scriptTopic, setScriptTopic] = useState('')
  const [scriptType, setScriptType] = useState('Long-form')
  const [scriptDuration, setScriptDuration] = useState('10')
  const [scriptTone, setScriptTone] = useState('educational and engaging')

  // Hook state
  const [hookTopic, setHookTopic] = useState('')
  const [hookStyle, setHookStyle] = useState('question')

  // Title state
  const [titleTopic, setTitleTopic] = useState('')
  const [titleCount, setTitleCount] = useState('10')

  // Thumbnail state
  const [thumbTitle, setThumbTitle] = useState('')

  // Content plan state
  const [planNiche, setPlanNiche] = useState('architecture, design, and hyperrealistic art')
  const [planWeeks, setPlanWeeks] = useState('4')

  const { toast, ToastContainer } = useToast()

  const call = async (prompt: string, system: string) => {
    setLoading(true); setOutput('')
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt: system, message: prompt, stream: true }),
      })
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const reader = res.body!.getReader()
      const dec = new TextDecoder()
      let full = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += dec.decode(value)
        setOutput(full)
      }
    } catch (e: any) {
      setOutput(`Error: ${e.message}\n\nMake sure ANTHROPIC_API_KEY is set in .env.local`)
    }
    setLoading(false)
  }

  const generateScript = () => {
    if (!scriptTopic.trim()) { toast.error('Enter a topic first'); return }
    const sys = `You are a world-class YouTube scriptwriter for Arpit Kshirsagar, a creator covering ${planNiche}. Write compelling ${scriptType} scripts. Structure: HOOK (0-30s), OPEN LOOP, BODY (multiple scenes with B-roll suggestions), RETENTION TRIGGERS, CTA, CLOSE. Be specific, visual, and retain attention every 60 seconds.`
    call(`Write a complete YouTube script for: "${scriptTopic}"\nTarget duration: ${scriptDuration} minutes\nTone: ${scriptTone}\n\nInclude:\n- Irresistible hook in first 5 seconds\n- Open loop that pays off at the end\n- 3+ retention triggers\n- Mid-video CTA\n- Scene-by-scene breakdown with B-roll suggestions\n- Strong close`, sys)
  }

  const generateHooks = () => {
    if (!hookTopic.trim()) { toast.error('Enter a topic'); return }
    const sys = `You are a YouTube hook specialist. Generate 10 ultra-compelling hooks that stop the scroll and force viewers to keep watching. Each hook under 2 sentences. Style: ${hookStyle}.`
    call(`Generate 10 powerful ${hookStyle}-style hooks for a YouTube video about: "${hookTopic}"\n\nFor each hook, rate its estimated CTR boost (Low/Medium/High/Viral) and explain in one line WHY it works psychologically.`, sys)
  }

  const generateTitles = () => {
    if (!titleTopic.trim()) { toast.error('Enter a topic'); return }
    const sys = `You are a YouTube SEO and click-through rate optimization expert. Generate titles that are searchable, emotional, and impossible to ignore.`
    call(`Generate ${titleCount} YouTube video titles for: "${titleTopic}"\n\nFor each title include:\n- The title itself\n- Estimated CTR rating (1-10)\n- Which emotion it triggers\n- SEO keyword embedded\n\nMix: curiosity gaps, numbers, controversy, transformation, authority.`, sys)
  }

  const generateThumbnailStrategy = () => {
    if (!thumbTitle.trim()) { toast.error('Enter a video title'); return }
    const sys = `You are a YouTube thumbnail strategist. Generate detailed thumbnail concepts that maximize CTR through visual psychology.`
    call(`Create 3 distinct thumbnail concepts for: "${thumbTitle}"\n\nFor each concept:\n1. Visual composition (what goes where)\n2. Color palette and why\n3. Text overlay (max 4 words) and font style\n4. Facial expression (if applicable)\n5. Emotion triggered in viewer\n6. Estimated CTR range\n7. Which audience it best targets\n\nMake each concept completely different in approach.`, sys)
  }

  const generateContentPlan = () => {
    const sys = `You are a content strategist and YouTube growth expert. Create detailed, executable content plans that compound subscriber growth.`
    call(`Create a ${planWeeks}-week YouTube content plan for a creator in the ${planNiche} niche.\n\nFor each week provide:\n- 1 long-form video idea (title + hook + why it'll perform)\n- 3 YouTube Shorts ideas (title + concept)\n- 1 Instagram Reel concept\n- Publishing schedule (days/times)\n- Repurposing strategy\n\nFocus on: compounding growth, searchability, and building audience trust.`, sys)
  }

  const generateGrowthAdvice = () => {
    const sys = `You are a YouTube channel growth advisor and business strategist. Give hyper-specific, actionable advice based on data and psychology.`
    call(`I'm Arpit Kshirsagar, a creator covering architecture, hyperrealistic art, and design. Channel stats: ${profile?.upload_streak ?? 0} day upload streak. Give me:\n\n1. My biggest growth opportunity right now (specific, not generic)\n2. The #1 thing killing most creator channels in my niche\n3. A 90-day growth sprint plan\n4. Monetization strategy beyond AdSense\n5. Personal brand differentiation strategy\n6. Content pillars I should build\n\nBe brutally honest and specific. No generic advice.`, sys)
  }

  const tabs = [
    { id: 'script', label: '📝 Script' },
    { id: 'hooks', label: '🎣 Hooks' },
    { id: 'titles', label: '📌 Titles' },
    { id: 'thumbnail', label: '🖼 Thumbnails' },
    { id: 'plan', label: '📅 Content Plan' },
    { id: 'growth', label: '📈 Growth Advisor' },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ToastContainer />
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">AI Studio</h1>
        <p className="text-ink-3 text-sm mt-0.5">Powered by Claude · Script Generator · Hook Writer · Title Optimizer · Growth Advisor</p>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); setOutput('') }}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${activeTab === tab.id ? 'bg-gold/15 text-gold border-gold/30' : 'border-border text-ink-3 hover:text-ink'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <Card>
          <SectionTitle>Configure</SectionTitle>

          {activeTab === 'script' && (
            <div className="space-y-4">
              <Field label="Video Topic / Title" required>
                <input value={scriptTopic} onChange={e => setScriptTopic(e.target.value)} placeholder="e.g. Why architects hate open floor plans" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Script Type">
                  <Select value={scriptType} onChange={e => setScriptType(e.target.value)} options={SCRIPT_TYPES.map(t => ({ value:t, label:t }))} />
                </Field>
                <Field label="Target Duration (min)">
                  <input type="number" value={scriptDuration} onChange={e => setScriptDuration(e.target.value)} min="1" max="60" />
                </Field>
              </div>
              <Field label="Tone / Style">
                <input value={scriptTone} onChange={e => setScriptTone(e.target.value)} placeholder="educational and engaging, storytelling, documentary..." />
              </Field>
              <Button variant="gold" onClick={generateScript} loading={loading} className="w-full py-3">
                <Sparkles size={16} /> Generate Full Script
              </Button>
            </div>
          )}

          {activeTab === 'hooks' && (
            <div className="space-y-4">
              <Field label="Video Topic" required>
                <input value={hookTopic} onChange={e => setHookTopic(e.target.value)} placeholder="What's the video about?" />
              </Field>
              <Field label="Hook Style">
                <Select value={hookStyle} onChange={e => setHookStyle(e.target.value)} options={HOOK_STYLES.map(s => ({ value:s, label:s.charAt(0).toUpperCase() + s.slice(1) }))} />
              </Field>
              <Button variant="gold" onClick={generateHooks} loading={loading} className="w-full py-3">
                <Sparkles size={16} /> Generate 10 Hooks
              </Button>
            </div>
          )}

          {activeTab === 'titles' && (
            <div className="space-y-4">
              <Field label="Video Topic" required>
                <input value={titleTopic} onChange={e => setTitleTopic(e.target.value)} placeholder="What's the video about?" />
              </Field>
              <Field label="Number of Titles">
                <Select value={titleCount} onChange={e => setTitleCount(e.target.value)} options={['5','10','15','20'].map(n => ({ value:n, label:`${n} titles` }))} />
              </Field>
              <Button variant="gold" onClick={generateTitles} loading={loading} className="w-full py-3">
                <Sparkles size={16} /> Generate Titles
              </Button>
            </div>
          )}

          {activeTab === 'thumbnail' && (
            <div className="space-y-4">
              <Field label="Video Title" required>
                <input value={thumbTitle} onChange={e => setThumbTitle(e.target.value)} placeholder="Enter the exact video title..." />
              </Field>
              <div className="p-4 bg-bg-4 border border-border rounded-xl text-xs text-ink-3 space-y-1.5">
                <p className="font-semibold text-ink-2">Thumbnail Strategy includes:</p>
                <p>• Visual composition & layout</p>
                <p>• Color psychology</p>
                <p>• Text overlay (max 4 words)</p>
                <p>• Emotional trigger</p>
                <p>• Estimated CTR range</p>
              </div>
              <Button variant="gold" onClick={generateThumbnailStrategy} loading={loading} className="w-full py-3">
                <Sparkles size={16} /> Generate 3 Concepts
              </Button>
            </div>
          )}

          {activeTab === 'plan' && (
            <div className="space-y-4">
              <Field label="Your Niche">
                <input value={planNiche} onChange={e => setPlanNiche(e.target.value)} placeholder="architecture, design, art..." />
              </Field>
              <Field label="Plan Duration">
                <Select value={planWeeks} onChange={e => setPlanWeeks(e.target.value)} options={['2','4','8','12'].map(w => ({ value:w, label:`${w} weeks` }))} />
              </Field>
              <Button variant="gold" onClick={generateContentPlan} loading={loading} className="w-full py-3">
                <Sparkles size={16} /> Generate Content Plan
              </Button>
            </div>
          )}

          {activeTab === 'growth' && (
            <div className="space-y-4">
              <div className="p-4 bg-gold/[0.06] border border-gold/20 rounded-xl">
                <p className="text-sm font-semibold text-gold mb-2">Personalized Growth Analysis</p>
                <p className="text-xs text-ink-3">The AI will analyze your niche, competition landscape, and content strategy to give you a custom growth blueprint.</p>
              </div>
              <div className="p-3 bg-bg-4 border border-border rounded-xl text-xs text-ink-3 space-y-1">
                <p>Creator: Arpit Kshirsagar</p>
                <p>Niche: Architecture + Hyperrealistic Art</p>
                <p>Streak: {profile?.upload_streak ?? 0} days</p>
              </div>
              <Button variant="gold" onClick={generateGrowthAdvice} loading={loading} className="w-full py-3">
                <Sparkles size={16} /> Generate Growth Strategy
              </Button>
            </div>
          )}
        </Card>

        {/* Output Panel */}
        <Card className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>AI Output</SectionTitle>
            {output && (
              <div className="flex gap-2">
                <button onClick={() => { navigator.clipboard.writeText(output); toast.success('Copied!') }}
                  className="text-ink-3 hover:text-gold transition-colors p-1.5 rounded-lg hover:bg-gold/10">
                  <Copy size={14} />
                </button>
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto min-h-[400px] max-h-[600px]">
            {!output && !loading && (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <Sparkles size={32} className="text-gold/30 mb-3" />
                <p className="text-ink-3 text-sm">Configure your parameters and generate</p>
                <p className="text-ink-3/60 text-xs mt-1">Powered by Claude AI</p>
              </div>
            )}
            {output && (
              <div className="text-sm text-ink-2 leading-relaxed whitespace-pre-wrap font-mono text-[12px]">
                {output}
                {loading && <span className="animate-pulse text-gold">▋</span>}
              </div>
            )}
            {loading && !output && (
              <div className="flex items-center justify-center h-full">
                <div className="flex items-center gap-3 text-ink-3">
                  <Sparkles size={18} className="animate-pulse text-gold" />
                  <span className="text-sm">Generating with Claude AI...</span>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
