import { Add01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import type { Teacher } from '@/types/teacher.types'
import { PageLayout } from '@/components/common/page-layout'
import { Button } from '@/components/ui/button'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DataTableExport,
  DataTableFilter,
  DataTableSearch,
  DataTableShowEntries,
  DataTableToolbar,
} from '@/components/ui/data-table-components'
import { ICON_SIZES } from '@/constants/sizes'
import { useCreateTeacher, useDeleteTeacher, useUpdateTeacher } from '@/features/teachers/api/mutations'
import { columns } from '@/features/teachers/components/column'
import { DataTable } from '@/features/teachers/components/data-table'
import { DeleteTeacherDialog } from '@/features/teachers/components/delete-teacher-dialog'
import { TeacherFormSheet } from '@/features/teachers/components/teacher-form-sheet'
import { TeacherViewSheet } from '@/features/teachers/components/teacher-view-sheet'
import useTeachers from '@/hooks/use-teachers'

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

  const createTeacher = useCreateTeacher()
  const updateTeacher = useUpdateTeacher()
  const deleteTeacher = useDeleteTeacher()

  const handleAddTeacher = () => {
    setSelectedTeacher(null)
    setIsFromViewSheet(false)
    setFormSheetOpen(true)
  }

  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setIsFromViewSheet(viewSheetOpen)
    setViewSheetOpen(false)
    setFormSheetOpen(true)
  }

  const handleCancelEdit = () => {
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

  const handleSaveTeacher = async (teacherData: Partial<Teacher>) => {
    try {
      if (selectedTeacher) {
        // Update existing teacher
        await updateTeacher.mutateAsync({
          id: selectedTeacher.id,
          persons_details_id: selectedTeacher.persons_details_id,
          first_name: teacherData.person_details?.first_name ?? undefined,
          last_name: teacherData.person_details?.last_name ?? undefined,
          email: teacherData.person_details?.email ?? undefined,
          contact: teacherData.person_details?.contact ?? undefined,
          address: teacherData.person_details?.address ?? undefined,
          primary_styles: teacherData.primary_styles ?? undefined,
          secondary_styles: teacherData.secondary_styles ?? undefined,
          general_notes: teacherData.general_notes ?? undefined,
        })
      } else {
        // Create new teacher
        await createTeacher.mutateAsync({
          first_name: teacherData.person_details?.first_name ?? '',
          last_name: teacherData.person_details?.last_name ?? '',
          email: teacherData.person_details?.email ?? undefined,
          contact: teacherData.person_details?.contact ?? undefined,
          address: teacherData.person_details?.address ?? undefined,
          primary_styles: teacherData.primary_styles ?? undefined,
          secondary_styles: teacherData.secondary_styles ?? undefined,
          general_notes: teacherData.general_notes ?? undefined,
        })
      }

      // After save, return to view sheet if we came from there
      if (isFromViewSheet && selectedTeacher) {
        setViewSheetOpen(true)
      }

      toast.success(selectedTeacher ? 'Teacher updated successfully' : 'Teacher created successfully')
    } catch (error) {
      console.error('Error saving teacher:', error)
      toast.error('Failed to save teacher', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      })
    }
  }

  const handleConfirmDelete = async (teacher: Teacher) => {
    try {
      await deleteTeacher.mutateAsync({
        teacherId: teacher.id,
        personsDetailsId: teacher.persons_details_id,
      })
      setDeleteDialogOpen(false)
      setSelectedTeacher(null)
      toast.success('Teacher deleted successfully')
    } catch (error) {
      console.error('Error deleting teacher:', error)
      toast.error('Failed to delete teacher', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      })
    }
  }

  return (
    <>
      <PageLayout breadcrumbs={[{ label: 'Teachers' }]}>
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
                <Button onClick={handleAddTeacher} disabled={createTeacher.isPending}>
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
                          value={table.getState().globalFilter ?? ""}
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
                            options={Array.from(table.getColumn("primary_styles")?.getFacetedUniqueValues().keys() ?? []).map((value) => ({
                              label: (value as string) || "N/A",
                              value: (value as string) || "",
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
      </PageLayout>

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



