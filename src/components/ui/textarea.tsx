import * as React from 'react'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const textareaVariants = cva(
  'flex w-full transition-colors placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm',
        underline:
          'min-h-[60px] border-0 border-b border-muted/50 hover:border-muted focus:border-primary rounded-none bg-transparent px-0 py-1 shadow-none resize-none',
      },
      size: {
        default: 'text-sm',
        sm: 'text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  VariantProps<typeof textareaVariants> { }

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <textarea
        className={cn(textareaVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Textarea.displayName = 'Textarea'

export { Textarea }
