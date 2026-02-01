import { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type {
  ColumnDef,
  ColumnFiltersState,
  RowSelectionState,
  SortingState,
} from '@tanstack/react-table'
import type { BroadcastFormState } from '../../hooks/use-broadcast-form'
import type { Teacher } from '@/types/teacher.types'
import useTeachers from '@/hooks/use-teachers'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DataTableColumnHeader,
  DataTablePagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'

import { DataTableFilter } from '@/components/ui/data-table-components'

interface StepAudienceProps {
  formData: BroadcastFormState
  updateField: (field: keyof BroadcastFormState, value: any) => void
  onNext: () => void
  handleCancel: () => void
  handleSaveDraft: () => void
}

export function StepAudience({
  formData,
  updateField,
  onNext,
  handleCancel,
  handleSaveDraft,
}: StepAudienceProps) {
  const { data: teachers, isLoading } = useTeachers()
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  // Convert selectedTeachers array to RowSelectionState object
  const rowSelection: RowSelectionState = useMemo(() => {
    const selection: RowSelectionState = {}
    if (teachers) {
      teachers.forEach((teacher: Teacher, index: number) => {
        if (formData.selectedTeachers.includes(teacher.id)) {
          selection[index] = true
        }
      })
    }
    return selection
  }, [formData.selectedTeachers, teachers])

  const handleRowSelectionChange = (
    updaterOrValue:
      | RowSelectionState
      | ((old: RowSelectionState) => RowSelectionState),
  ) => {
    const newSelection =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(rowSelection)
        : updaterOrValue

    if (teachers) {
      const selectedIds = Object.entries(newSelection)
        .filter(([_, isSelected]) => isSelected)
        .map(([index]) => teachers[parseInt(index)]?.id)
        .filter(Boolean) as Array<string>
      updateField('selectedTeachers', selectedIds)
    }
  }

  const columns: Array<ColumnDef<Teacher>> = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: 'teacher',
        accessorFn: (row) =>
          `${row.person_details.first_name} ${row.person_details.last_name}`,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Teacher" />
        ),
        cell: ({ row }) => {
          const teacher = row.original
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {teacher.person_details.first_name[0] || 'T'}
                  {teacher.person_details.last_name[0] || ''}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-zinc-900">
                  {teacher.person_details.first_name}{' '}
                  {teacher.person_details.last_name}
                </p>
                <p className="text-xs text-zinc-400">
                  {(teacher.person_details.email as string) || 'No email'}
                </p>
              </div>
            </div>
          )
        },
      },
      {
        id: 'primary_styles',
        accessorKey: 'primary_styles',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Primary Style" />
        ),
        cell: ({ row }) => (
          <span className="inline-flex items-center px-2 py-1 rounded bg-zinc-100 text-zinc-700 text-xs font-medium border">
            {(row.original.primary_styles as string) || 'N/A'}
          </span>
        ),
      },
      {
        id: 'status',
        accessorFn: (row) => (row.is_blocked ? 'Blocked' : 'Active'),
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
          const isBlocked = row.original.is_blocked
          return (
            <span
              className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                isBlocked
                  ? 'bg-red-100 text-red-700 border border-red-200'
                  : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
              }`}
            >
              {isBlocked ? 'Blocked' : 'Active'}
            </span>
          )
        },
      },
      {
        id: 'contact',
        accessorFn: (row) => (row.person_details.contact as string) || '',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Contact" />
        ),
      },
    ],
    [],
  )

  const table = useReactTable({
    data: teachers ?? [],
    columns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: handleRowSelectionChange,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  const selectedCount = formData.selectedTeachers.length
  const selectedTeacherObjects =
    teachers?.filter((t: Teacher) =>
      formData.selectedTeachers.includes(t.id),
    ) ?? []

  const removeTeacher = (teacherId: string) => {
    updateField(
      'selectedTeachers',
      formData.selectedTeachers.filter((id) => id !== teacherId),
    )
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-right-5 duration-300">
      <div className="bg-white rounded-xl overflow-hidden">
        {/* Filter Bar */}
        <div className="flex flex-wrap justify-between gap-3 p-4 items-center">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Input
                placeholder="Search teacher..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-64"
              />
            </div>
            {/* Primary Styles Filter */}
            <DataTableFilter
              column={table.getColumn('primary_styles')}
              title="Primary Styles"
              options={Array.from(
                table
                  .getColumn('primary_styles')
                  ?.getFacetedUniqueValues()
                  .keys() ?? [],
              ).map((value) => ({
                label: value ?? 'N/A',
                value: value ?? '',
              }))}
            />
            {/* Status Filter */}
            <DataTableFilter
              column={table.getColumn('status')}
              title="Status"
              options={Array.from(
                table.getColumn('status')?.getFacetedUniqueValues().keys() ??
                  [],
              ).map((value) => ({
                label: value ?? 'N/A',
                value: value ?? '',
              }))}
            />
          </div>
          <div className="flex items-center gap-4">
            {/* Selected Preview */}
            {selectedCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center -space-x-2">
                  {selectedTeacherObjects.slice(0, 3).map((t: Teacher) => (
                    <div
                      key={t.id}
                      className="w-7 h-7 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center text-[10px] font-medium ring-2 ring-white"
                    >
                      {t.person_details.first_name[0]}
                      {t.person_details.last_name[0]}
                    </div>
                  ))}
                  {selectedCount > 3 && (
                    <div className="w-7 h-7 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center text-[10px] font-medium ring-2 ring-white">
                      +{selectedCount - 3}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* View Selected Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <span className="flex items-center justify-center bg-zinc-900 text-white text-xs rounded-full h-5 w-5">
                    {selectedCount}
                  </span>
                  <span>Selected</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Selected Teachers ({selectedCount})</SheetTitle>
                  <SheetDescription>
                    Review the list of recipients for this broadcast.
                  </SheetDescription>
                </SheetHeader>
                <div className="h-[calc(100vh-120px)] mt-4 pr-4 overflow-y-auto">
                  <div className="space-y-2">
                    {selectedCount === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No teachers selected.
                      </p>
                    )}
                    {selectedTeacherObjects.map((teacher: Teacher) => (
                      <div
                        key={teacher.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-zinc-50"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {teacher.person_details.first_name[0] || 'T'}
                              {teacher.person_details.last_name[0] || ''}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">
                              {teacher.person_details.first_name}{' '}
                              {teacher.person_details.last_name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {(teacher.person_details.email as string) ||
                                'No email'}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeTeacher(teacher.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border-border rounded-md">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading teachers...
            </div>
          ) : (
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        checkbox={header.id === 'select'}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      className={row.getIsSelected() ? 'bg-zinc-50' : ''}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          checkbox={cell.column.id === 'select'}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No teachers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && teachers && teachers.length > 0 && (
          <div className="px-2">
            <DataTablePagination
              pageIndex={table.getState().pagination.pageIndex}
              pageCount={table.getPageCount()}
              pageSize={table.getState().pagination.pageSize}
              totalRows={table.getFilteredRowModel().rows.length}
              onPageChange={(page) => table.setPageIndex(page)}
            />
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <div className="flex gap-3">
          <Button variant="ghost" onClick={handleSaveDraft}>
            Save Draft
          </Button>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
        <Button onClick={onNext} disabled={selectedCount === 0} size="lg">
          Next
        </Button>
      </div>
    </div>
  )
}
