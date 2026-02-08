import * as React from 'react'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const inputVariants = cva(
  'flex w-full transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'rounded-md outline outline-input bg-background focus:outline-primary focus:outline-2 px-3 py-2',
        underline:
          'border-0 border-b border-muted/50 hover:border-muted focus:border-primary rounded-none px-0 py-2 bg-transparent shadow-none',
      },
      size: {
        default: 'h-9 text-sm',
        sm: 'h-8 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface InputProps
  extends Omit<React.ComponentProps<'input'>, 'size'>,
  VariantProps<typeof inputVariants> { }

function Input({ className, variant, size, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Input }
