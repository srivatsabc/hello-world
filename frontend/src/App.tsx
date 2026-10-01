import { useState } from 'react'
import { AiPage } from './pages/AiPage'
import { ArchitecturePage } from './pages/ArchitecturePage'
import { ConventionalPage } from './pages/ConventionalPage'
import { cn } from './lib/cn'

type Section = 'conventional' | 'ai' | 'architecture'

const SECTION_LABELS: Record<Section, string> = {
  conventional: 'Conventional',
  ai: 'AI',
  architecture: 'Architecture',
}

// Date: October 1, 2026
// Name: Sri
// Desc: Top-level tabs, Conventional (direct API calls), AI (a LangChain
//       agent using tools) and Architecture (embeds the separate diagram
//       service). A plain state switch rather than a router: this
//       is a small demo and no page needs a shareable URL.
export default function App() {
  const [section, setSection] = useState<Section>('conventional')

  return (
    <div>
      <div className="flex justify-center gap-2 border-b border-zinc-800 bg-zinc-950/80 py-3">
        {(['conventional', 'ai', 'architecture'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSection(s)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-semibold uppercase tracking-wide transition-colors',
              section === s ? 'bg-zinc-50 text-zinc-950' : 'text-zinc-400 hover:text-zinc-100',
            )}
          >
            {SECTION_LABELS[s]}
          </button>
        ))}
      </div>
      {section === 'conventional' && <ConventionalPage />}
      {section === 'ai' && <AiPage />}
      {section === 'architecture' && <ArchitecturePage />}
    </div>
  )
}
