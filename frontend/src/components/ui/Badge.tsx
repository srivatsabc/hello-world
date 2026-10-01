import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type Tone = 'lime' | 'blue' | 'zinc' | 'red'

const toneClasses: Record<Tone, string> = {
  lime: 'bg-lime-400/10 text-lime-300 ring-lime-400/30',
  blue: 'bg-indigo-400/10 text-indigo-300 ring-indigo-400/30',
  zinc: 'bg-zinc-400/10 text-zinc-300 ring-zinc-400/30',
  red: 'bg-red-400/10 text-red-300 ring-red-400/30',
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
}

// Date: October 1, 2026
// Name: Sri
// Desc: The small pill used for an answer label (e.g. "billing", "Yes").
export function Badge({ tone = 'zinc', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3 py-1 font-mono text-sm ring-1',
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  )
}
