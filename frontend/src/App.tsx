import { useState } from 'react'
import { AiPage } from './pages/AiPage'
import { ConventionalPage } from './pages/ConventionalPage'
import { cn } from './lib/cn'

type Section = 'conventional' | 'ai'

const SECTION_LABELS: Record<Section, string> = {
  conventional: 'Conventional',
  ai: 'AI',
}

// Date: October 1, 2026
// Name: Sri
// Desc: Top-level tabs, Conventional (direct API calls) and AI (a LangChain
//       agent using tools). A plain state switch rather than a router: this
//       is a small demo and no page needs a shareable URL.
export default function App() {
  const [section, setSection] = useState<Section>('conventional')

  return (
    <div>
      <div className="flex justify-center gap-2 border-b border-zinc-800 bg-zinc-950/80 py-3">
        {(['conventional', 'ai'] as const).map((s) => (
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
    </div>
  )
}
