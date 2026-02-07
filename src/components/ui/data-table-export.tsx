'use client'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

type ExportFormat = 'csv' | 'xlsx' | 'pdf'

interface DataTableExportProps<TData> {
  data: Array<TData>
  filename?: string
  onExport?: (format: ExportFormat, data: Array<TData>) => void
  formats?: Array<ExportFormat>
  className?: string
}

/**
 * Export button with multi-format dropdown.
 * Supports CSV, XLSX, and PDF export formats.
 */
function DataTableExport<TData>({
  data,
  filename = 'export',
  onExport,
  formats = ['csv', 'xlsx', 'pdf'],
  className,
}: DataTableExportProps<TData>) {
  const formatLabels: Record<ExportFormat, string> = {
    csv: 'CSV',
    xlsx: 'Excel (XLSX)',
    pdf: 'PDF',
  }

  const handleExport = (format: ExportFormat) => {
    if (onExport) {
      onExport(format, data)
    } else {
      // Default CSV export
      if (format === 'csv') {
        exportToCsv(data, filename)
      }
    }
  }

  // Show dropdown if multiple formats, otherwise single button
  if (formats.length === 1) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={cn('h-9', className)}
        onClick={() => handleExport(formats[0])}
      >
        <Download className="h-4 w-4" />
        Export
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={cn('h-9', className)}>
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {formats.map((format) => (
          <DropdownMenuItem key={format} onClick={() => handleExport(format)}>
            {formatLabels[format]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Default CSV export helper function
 */
function exportToCsv<TData>(data: Array<TData>, filename: string) {
  if (data.length === 0) return

  const firstRow = data[0]
  if (typeof firstRow !== 'object' || firstRow === null) return

  const headers = Object.keys(firstRow as Record<string, unknown>)
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = (row as Record<string, unknown>)[header]
          const stringValue = value?.toString() ?? ''
          // Escape quotes and wrap in quotes if contains comma
          if (stringValue.includes(',') || stringValue.includes('"')) {
            return `"${stringValue.replace(/"/g, '""')}"`
          }
          return stringValue
        })
        .join(','),
    ),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}

export { DataTableExport, exportToCsv }
export type { ExportFormat, DataTableExportProps }
