import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

// Date: October 1, 2026
// Name: Sri
// Desc: The one card primitive every panel in this app is built from —
//       a rounded, dark surface with an optional accent-colored ring.
export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6', className)}
      {...props}
    />
  ),
)
Card.displayName = 'Card'
