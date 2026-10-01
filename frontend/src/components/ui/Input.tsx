import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

// Date: October 1, 2026
// Name: Sri
// Desc: The one text/number input primitive, styled to match Card and Button.
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-lime-400 focus:outline-none',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'
