
import { type Column } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b p-3", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b border-border transition-colors",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, checkbox, ...props }: React.ComponentProps<"th"> & { checkbox?: boolean }) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground h-10 p-3 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        checkbox && "w-12 px-4 pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, checkbox, ...props }: React.ComponentProps<"td"> & { checkbox?: boolean }) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        checkbox && "w-12 px-4 pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  )
}

interface DataTablePaginationProps {
  pageIndex: number
  pageCount: number
  pageSize: number
  totalRows: number
  onPageChange: (pageIndex: number) => void
  className?: string
}

function DataTablePagination({
  pageIndex,
  pageCount,
  pageSize,
  totalRows,
  onPageChange,
  className,
}: DataTablePaginationProps) {
  const canGoPrevious = pageIndex > 0
  const canGoNext = pageIndex < pageCount - 1

  const startRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows)

  // Generate page numbers with ellipsis
  const getPageNumbers = (): (number | "ellipsis")[] => {
    const pages: (number | "ellipsis")[] = []

    if (pageCount <= 7) {
      for (let i = 0; i < pageCount; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(0)

      if (pageIndex > 2) {
        pages.push("ellipsis")
      }

      // Pages around current
      const start = Math.max(1, pageIndex - 1)
      const end = Math.min(pageCount - 2, pageIndex + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (pageIndex < pageCount - 3) {
        pages.push("ellipsis")
      }

      // Always show last page
      if (pageCount > 1) {
        pages.push(pageCount - 1)
      }
    }

    return pages
  }

  return (
    <div className={cn("flex items-center justify-between py-4", className)}>
      {/* Left side - Showing X-Y from Z */}
      <div className="text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-medium">{startRow}</span>
        -
        <span className="font-medium">{endRow}</span>
        {" "}from{" "}
        <span className="font-medium">{totalRows}</span>
      </div>

      {/* Right side - Pagination controls */}
      <div className="flex items-center gap-1">
        {/* First page */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(0)}
          disabled={!canGoPrevious}
        >
          <span className="text-xs">{"<<"}</span>
        </Button>
        {/* Previous page */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(pageIndex - 1)}
          disabled={!canGoPrevious}
        >
          <span className="text-xs">{"<"}</span>
        </Button>

        {/* Page numbers */}
        {getPageNumbers().map((page, idx) =>
          page === "ellipsis" ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={pageIndex === page ? "default" : "outline"}
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(page)}
            >
              {page + 1}
            </Button>
          )
        )}

        {/* Next page */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={!canGoNext}
        >
          <span className="text-xs">{">"}</span>
        </Button>
        {/* Last page */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(pageCount - 1)}
          disabled={!canGoNext}
        >
          <span className="text-xs">{">>"}</span>
        </Button>
      </div>
    </div>
  )
}

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>
  title: string
  className?: string
}

function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("-ml-3 h-8 data-[state=open]:bg-accent group", className)}
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title}
      <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {column.getIsSorted() === "desc" ? (
          <ArrowDown className="h-4 w-4" />
        ) : column.getIsSorted() === "asc" ? (
          <ArrowUp className="h-4 w-4" />
        ) : (
          <ArrowUpDown className="h-4 w-4" />
        )}
      </span>
    </Button>
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  DataTablePagination,
  DataTableColumnHeader,
}
