import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createFileRoute } from '@tanstack/react-router'
import { AppHeader } from '@/components/app-header'
import useTeachers from '@/hooks/use-teachers'
import { DataTable } from '@/components/teachers/data-table'
import { columns } from '@/components/teachers/column'
import { DataTableToolbar, DataTableFilter, DataTableShowEntries, DataTableSearch, DataTableExport } from "@/components/ui/data-table-components"
import { Button } from '@/components/ui/button'
import { ICON_SIZES } from '@/constants/sizes'
import { HugeiconsIcon } from '@hugeicons/react'
import { Add01Icon } from '@hugeicons/core-free-icons'
import { TeacherFormSheet } from '@/components/teachers/teacher-form-sheet'
import { DeleteTeacherDialog } from '@/components/teachers/delete-teacher-dialog'
import { useState } from 'react'
import { Teacher } from '@/types/teacher.types'

export const Route = createFileRoute('/_protected/teachers/teacher-list')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: teachers } = useTeachers();
  const [sheetOpen, setSheetOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)

  const handleAddTeacher = () => {
    setSelectedTeacher(null)
    setSheetOpen(true)
  }

  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setSheetOpen(true)
  }

  const handleDeleteTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setDeleteDialogOpen(true)
  }

  const handleRowClick = (teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setSheetOpen(true)
  }

  const handleSaveTeacher = (teacher: Partial<Teacher>) => {
    // TODO: Implement API call to save teacher
    console.log('Saving teacher:', teacher)
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

      <TeacherFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        teacher={selectedTeacher}
        onSave={handleSaveTeacher}
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
