"use client"
import { Club } from "@/types/club.types"
import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Edit02Icon, Delete02Icon, ViewIcon } from "@hugeicons/core-free-icons"
import { ICON_SIZES } from "@/constants/sizes"
import { Badge } from "@/components/ui/badge"

export const columns: ColumnDef<Club>[] = [
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
    accessorKey: "club_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Club Name" />
    ),
  },
  {
    accessorKey: "club_code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Code" />
    ),
  },
  {
    id: "school",
    accessorFn: (row) => row.school?.school_name ?? "",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="School" />
    ),
  },
  {
    accessorKey: "members_count",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Members" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("members_count") ?? 0}</span>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge variant={status === "active" ? "default" : "secondary"}>
          {status}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const club = row.original
      const meta = table.options.meta as {
        onView?: (club: Club) => void
        onEdit?: (club: Club) => void
        onDelete?: (club: Club) => void
      } | undefined

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation()
              meta?.onView?.(club)
            }}
          >
            <HugeiconsIcon icon={ViewIcon} className={ICON_SIZES.md} />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation()
              meta?.onEdit?.(club)
            }}
          >
            <HugeiconsIcon icon={Edit02Icon} className={ICON_SIZES.md} />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation()
              meta?.onDelete?.(club)
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
