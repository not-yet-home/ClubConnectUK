"use client"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface DataTableShowEntriesProps {
  pageSize: number
  onPageSizeChange: (size: number) => void
  options?: Array<number>
  className?: string
}

/**
 * Page size selector for table pagination.
 * Displays "Show entries" label with a dropdown of configurable options.
 */
function DataTableShowEntries({
  pageSize,
  onPageSizeChange,
  options = [10, 25, 50, 100],
  className,
}: DataTableShowEntriesProps) {
  return (
    <div
      data-slot="data-table-show-entries"
      className={cn("flex items-center gap-2", className)}
    >
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        Show entries
      </span>
      <Select
        value={String(pageSize)}
        onValueChange={(value) => onPageSizeChange(Number(value))}
      >
        <SelectTrigger className="h-9 w-[70px]">
          <SelectValue placeholder={pageSize} />
        </SelectTrigger>
        <SelectContent side="bottom" align="start" avoidCollisions={false}>
          {options.map((size) => (
            <SelectItem key={size} value={String(size)}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export { DataTableShowEntries }
