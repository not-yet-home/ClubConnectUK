import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AppHeader } from '@/components/app-header'
import { useClubs } from '@/hooks/use-clubs'
import { DataTable } from '@/components/clubs/data-table'
import { columns } from '@/components/clubs/column'
import { DataTableToolbar, DataTableFilter, DataTableShowEntries, DataTableSearch, DataTableExport } from "@/components/ui/data-table-components"
import { Button } from '@/components/ui/button'
import { ICON_SIZES } from '@/constants/sizes'
import { HugeiconsIcon } from '@hugeicons/react'
import { Add01Icon } from '@hugeicons/core-free-icons'
import type { Club } from '@/types/club.types'

export const Route = createFileRoute('/_protected/clubs/club-list')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: clubs, isLoading } = useClubs()
  const navigate = useNavigate()

  const handleAddClub = () => {
    // TODO: Open add club modal/sheet
    console.log('Add club')
  }

  const handleViewClub = (club: Club) => {
    navigate({ to: '/clubs/$clubId', params: { clubId: club.id } })
  }

  const handleEditClub = (club: Club) => {
    // TODO: Open edit club modal/sheet
    console.log('Edit club:', club)
  }

  const handleDeleteClub = (club: Club) => {
    // TODO: Open delete confirmation dialog
    console.log('Delete club:', club)
  }

  const handleRowClick = (club: Club) => {
    handleViewClub(club)
  }

  if (isLoading) {
    return (
      <>
        <AppHeader breadcrumbs={[{ label: 'Clubs' }]} />
        <main className="flex-1 overflow-auto p-6 bg-background">
          <div className="mx-auto space-y-6">
            <p>Loading clubs...</p>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <AppHeader breadcrumbs={[{ label: 'Clubs' }]} />
      <main className="flex-1 overflow-auto p-6 bg-background">
        <div className="mx-auto space-y-6">
          <div>
            <CardHeader className="flex flex-row justify-between items-center">
              <section className="flex flex-col gap-2">
                <CardTitle>Clubs Management</CardTitle>
                <CardDescription>
                  View and manage all clubs across your schools
                </CardDescription>
              </section>
              <section>
                <Button onClick={handleAddClub}>
                  <HugeiconsIcon icon={Add01Icon} className={ICON_SIZES.lg} />
                  Add Club
                </Button>
              </section>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={columns} 
                data={clubs ?? []} 
                onRowClick={handleRowClick}
                meta={{
                  onView: handleViewClub,
                  onEdit: handleEditClub,
                  onDelete: handleDeleteClub,
                }}
                toolbar={(table) => (
                  <DataTableToolbar>
                    <section className="flex flex-1 flex-col justify-between items-center gap-2">
                      <div className="flex w-full items-end justify-end ">
                        <DataTableSearch
                          value={(table.getState().globalFilter as string) ?? ""}
                          onChange={(value) => table.setGlobalFilter(value)}
                          placeholder="Search clubs..."
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
                            filename="clubs"
                          />
                          <DataTableFilter
                            column={table.getColumn("status")}
                            title="Status"
                            options={[
                              { label: "Active", value: "active" },
                              { label: "Inactive", value: "inactive" },
                              { label: "Cancelled", value: "cancelled" },
                            ]}
                          />
                          <DataTableFilter
                            column={table.getColumn("school")}
                            title="School"
                            options={Array.from(table.getColumn("school")?.getFacetedUniqueValues()?.keys() ?? []).map((value) => ({
                                label: value ?? "N/A",
                                value: value ?? "",
                              }))}
                          />
                        </div>
                      </div>
                    </section>
                  </DataTableToolbar>
                )}
                globalFilterPlaceholder="Search clubs..."
                />
            </CardContent>
          </div>
        </div>
      </main>
    </>
  )
}
