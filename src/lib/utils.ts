import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ClassValue } from 'clsx'

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

export function isDirty<T extends Record<string, any>>(
  current: T,
  initial: T | null,
): boolean {
  if (!initial) return false
  return Object.keys(initial).some((key) => current[key] !== initial[key])
}
