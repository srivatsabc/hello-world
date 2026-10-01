import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Date: October 1, 2026
// Name: Sri
// Desc: Merges caller className with a component's base classes, same
//       helper every other frontend in this repo uses.
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
