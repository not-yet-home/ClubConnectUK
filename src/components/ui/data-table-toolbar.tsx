'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface DataTableToolbarProps {
  children?: React.ReactNode
  className?: string
}

/**
 * Wrapper component for table toolbar elements.
 * Arranges children in a flexible layout with responsive spacing.
 */
function DataTableToolbar({ children, className }: DataTableToolbarProps) {
  return (
    <div
      data-slot="data-table-toolbar"
      className={cn('flex flex-wrap items-center gap-2', className)}
    >
      {children}
    </div>
  )
}

/**
 * Left-aligned section of the toolbar.
 * Use for show entries selector and primary filters.
 */
function DataTableToolbarLeft({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      data-slot="data-table-toolbar-left"
      className={cn('flex flex-wrap items-center gap-2', className)}
    >
      {children}
    </div>
  )
}

/**
 * Right-aligned section of the toolbar.
 * Use for search, export, and action buttons.
 */
function DataTableToolbarRight({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      data-slot="data-table-toolbar-right"
      className={cn('ml-auto flex flex-wrap items-center gap-2', className)}
    >
      {children}
    </div>
  )
}

export { DataTableToolbar, DataTableToolbarLeft, DataTableToolbarRight }
