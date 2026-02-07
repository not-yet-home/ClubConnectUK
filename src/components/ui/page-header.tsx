'use client'

import * as React from 'react'
import { PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  action?: {
    label: string
    icon?: React.ReactNode
    onClick: () => void
  }
  children?: React.ReactNode
  className?: string
}

/**
 * Reusable page header with title and optional action button.
 * Displays title on left, action button on right.
 */
function PageHeader({
  title,
  description,
  action,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div
      data-slot="page-header"
      className={cn(
        'flex flex-col gap-4 md:flex-row md:items-center md:justify-between',
        className,
      )}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {children}
        {action && (
          <Button onClick={action.onClick}>
            {action.icon ?? <PlusCircle className="h-4 w-4" />}
            {action.label}
          </Button>
        )}
      </div>
    </div>
  )
}

export { PageHeader }
export type { PageHeaderProps }
