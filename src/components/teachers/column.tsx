"use client"
import { Teacher } from "@/types/teacher.types"
import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Edit02Icon, Delete02Icon } from "@hugeicons/core-free-icons"
import { ICON_SIZES } from "@/constants/sizes"
import { Tooltip, TooltipContent, TooltipTrigger } from "@radix-ui/react-tooltip"

export const columns: ColumnDef<Teacher>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllPageRowsSelected()}
        ref={(input) => {
          if (input) {
            input.indeterminate = table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
          }
        }}
        onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={(e) => row.toggleSelected(!!e.target.checked)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "first_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="First Name" />
    ),
  },
  {
    accessorKey: "last_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Name" />
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
  },
  {
    accessorKey: "department",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Department" />
    ),
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
  },
  {
    accessorKey: "school_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="School ID" />
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const teacher = row.original
      const meta = table.options.meta as {
        onEdit?: (teacher: Teacher) => void
        onDelete?: (teacher: Teacher) => void
      } | undefined

      return (
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={(e) => {
                  e.stopPropagation()
              meta?.onEdit?.(teacher)
            }}
          >
            <HugeiconsIcon icon={Edit02Icon} className={ICON_SIZES.md} />
          </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Edit Teacher</p>
          </TooltipContent>
          </Tooltip>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation()
              meta?.onDelete?.(teacher)
            }}
          >
            <HugeiconsIcon icon={Delete02Icon} className={ICON_SIZES.md} />
          </Button>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
]
