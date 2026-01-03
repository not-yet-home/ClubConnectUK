"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface DataTableSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  debounceMs?: number
}

/**
 * Search input for filtering table data.
 * Supports debounced input for performance.
 */
function DataTableSearch({
  value,
  onChange,
  placeholder = "Search...",
  className,
  debounceMs = 300,
}: DataTableSearchProps) {
  const [internalValue, setInternalValue] = React.useState(value)
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  React.useEffect(() => {
    setInternalValue(value)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInternalValue(newValue)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      onChange(newValue)
    }, debounceMs)
  }

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div
      data-slot="data-table-search"
      className={cn("relative", className)}
    >
      <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        value={internalValue}
        onChange={handleChange}
        className="pl-8 w-[200px] lg:w-[250px]"
      />
    </div>
  )
}

export { DataTableSearch }
