'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DataTableActionButtonProps {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  variant?:
    | 'default'
    | 'outline'
    | 'ghost'
    | 'secondary'
    | 'destructive'
    | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

/**
 * Composable action button for table toolbar.
 * Use for Templates, Add, or any custom action.
 */
function DataTableActionButton({
  label,
  icon,
  onClick,
  variant = 'outline',
  size = 'sm',
  className,
}: DataTableActionButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      className={cn('h-9', className)}
    >
      {icon}
      {label}
    </Button>
  )
}

export { DataTableActionButton }
export type { DataTableActionButtonProps }
