import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createFileRoute } from '@tanstack/react-router'
import { AppHeader } from '@/components/common/app-header'
import useTeachers from '@/hooks/use-teachers'
import { DataTable } from '@/features/teachers/components/data-table'
import { columns } from '@/features/teachers/components/column'
import { DataTableToolbar, DataTableFilter, DataTableShowEntries, DataTableSearch, DataTableExport } from "@/components/ui/data-table-components"
import { Button } from '@/components/ui/button'
import { ICON_SIZES } from '@/constants/sizes'
import { HugeiconsIcon } from '@hugeicons/react'
import { Add01Icon } from '@hugeicons/core-free-icons'
import { TeacherFormSheet } from '@/features/teachers/components/teacher-form-sheet'
import { TeacherViewSheet } from '@/features/teachers/components/teacher-view-sheet'
import { DeleteTeacherDialog } from '@/features/teachers/components/delete-teacher-dialog'
import { useState } from 'react'
import { Teacher } from '@/types/teacher.types'

export const Route = createFileRoute('/_protected/teachers/teacher-list')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: teachers } = useTeachers();
  const [formSheetOpen, setFormSheetOpen] = useState(false)
  const [viewSheetOpen, setViewSheetOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [isFromViewSheet, setIsFromViewSheet] = useState(false)

  const handleAddTeacher = () => {
    setSelectedTeacher(null)
    setIsFromViewSheet(false)
    setFormSheetOpen(true)
  }

  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setIsFromViewSheet(viewSheetOpen) // Track if we came from view sheet
    setViewSheetOpen(false)
    setFormSheetOpen(true)
  }

  const handleCancelEdit = () => {
    // If we came from view sheet, return to it
    if (isFromViewSheet && selectedTeacher) {
      setFormSheetOpen(false)
      setViewSheetOpen(true)
    } else {
      setFormSheetOpen(false)
    }
  }

  const handleDeleteTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setViewSheetOpen(false)
    setDeleteDialogOpen(true)
  }

  const handleRowClick = (teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setViewSheetOpen(true)
  }

  const handleSaveTeacher = (teacher: Partial<Teacher>) => {
    // TODO: Implement API call to save teacher
    console.log('Saving teacher:', teacher)
    // After save, return to view sheet if we came from there
    if (isFromViewSheet && selectedTeacher) {
      setViewSheetOpen(true)
    }
  }

  const handleConfirmDelete = (teacher: Teacher) => {
    // TODO: Implement API call to delete teacher
    console.log('Deleting teacher:', teacher)
  }

  return (
    <>
      <AppHeader breadcrumbs={[{ label: 'Teachers' }]} />
      <main className="flex-1 overflow-auto p-6 bg-background">
        <div className="mx-auto space-y-6">
          <div>
            <CardHeader className="flex flex-row justify-between items-center">
              <section className="flex flex-col gap-2">
                <CardTitle>Teacher Management</CardTitle>
                <CardDescription>
                  View and manage all teachers on your platform
                </CardDescription>
              </section>
              <section>
                <Button onClick={handleAddTeacher}>
                  <HugeiconsIcon icon={Add01Icon} className={ICON_SIZES.lg} />
                  Add Teacher</Button>
              </section>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={teachers ?? []}
                onRowClick={handleRowClick}
                meta={{
                  onEdit: handleEditTeacher,
                  onDelete: handleDeleteTeacher,
                }}
                toolbar={(table) => (
                  <DataTableToolbar>
                    <section className="flex flex-1 flex-col justify-between items-center gap-2">
                      <div className="flex w-full items-end justify-end ">
                        <DataTableSearch
                          value={(table.getState().globalFilter as string) ?? ""}
                          onChange={(value) => table.setGlobalFilter(value)}
                          placeholder="Search teachers..."
                        />
                      </div>
                      <div className="flex w-full justify-between">
                        <DataTableShowEntries
                          pageSize={table.getState().pagination.pageSize}
                          onPageSizeChange={(size) => table.setPageSize(size)}
                        />
                        <div className="flex flex-row gap-2">
                          <DataTableExport
                            data={table.getFilteredRowModel().rows.map((row) => row.original)}
                            filename="teachers"
                          />
                          <DataTableFilter
                            column={table.getColumn("primary_styles")}
                            title="Primary Styles"
                            options={Array.from(table.getColumn("primary_styles")?.getFacetedUniqueValues()?.keys() ?? []).map((value) => ({
                              label: value ?? "N/A",
                              value: value ?? "",
                            }))}
                          />
                        </div>
                      </div>
                    </section>
                  </DataTableToolbar>
                )}
                globalFilterPlaceholder="Search teachers..."
              />
            </CardContent>
          </div>
        </div>
      </main>

      {/* View Sheet - for viewing teacher details */}
      <TeacherViewSheet
        open={viewSheetOpen}
        onOpenChange={setViewSheetOpen}
        teacher={selectedTeacher}
        onEdit={handleEditTeacher}
        onDelete={handleDeleteTeacher}
      />

      {/* Form Sheet - for add/edit operations */}
      <TeacherFormSheet
        open={formSheetOpen}
        onOpenChange={setFormSheetOpen}
        teacher={selectedTeacher}
        onSave={handleSaveTeacher}
        onCancel={handleCancelEdit}
        isEditMode={isFromViewSheet}
      />

      <DeleteTeacherDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        teacher={selectedTeacher}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}


