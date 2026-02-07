import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { Add01Icon } from '@hugeicons/core-free-icons'
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { PageLayout } from '@/components/common/page-layout'
import { DataTable } from '@/features/broadcast/components/data-table'
import { columns } from '@/features/broadcast/components/columns'
import {
  DataTableFilter,
  DataTableSearch,
  DataTableShowEntries,
  DataTableToolbar,
} from '@/components/ui/data-table-components'
import { Button } from '@/components/ui/button'
import { ICON_SIZES } from '@/constants/sizes'
import { useBroadcasts } from '@/features/broadcast/hooks/use-broadcasts'

export const Route = createFileRoute('/_protected/broadcast/')({
  component: BroadcastListPage,
})

function BroadcastListPage() {
  const navigate = useNavigate()
  const { data: broadcasts, isLoading } = useBroadcasts()

  const handleAddBroadcast = () => {
    navigate({ to: '/broadcast/new' })
  }

  const handleRowClick = (broadcast: any) => {
    console.log('Clicked broadcast', broadcast)
  }

  return (
    <PageLayout breadcrumbs={[{ label: 'Broadcasts' }]}>
      <div className="mx-auto space-y-6">
        <div>
          <CardHeader className="flex flex-row justify-between items-center">
            <section className="flex flex-col gap-2">
              <CardTitle>Broadcast Management</CardTitle>
              <CardDescription>
                Manage and monitor your broadcast messages
              </CardDescription>
            </section>
            <section>
              <Button onClick={handleAddBroadcast}>
                <HugeiconsIcon icon={Add01Icon} className={ICON_SIZES.lg} />
                New Broadcast
              </Button>
            </section>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-4 text-center">Loading broadcasts...</div>
            ) : (
              <DataTable
                columns={columns}
                data={broadcasts ?? []}
                onRowClick={handleRowClick}
                toolbar={(table) => (
                  <DataTableToolbar>
                    <section className="flex flex-1 flex-col justify-between items-center gap-2">
                      <div className="flex w-full items-end justify-end">
                        <DataTableSearch
                          value={table.getState().globalFilter as string}
                          onChange={(value) => table.setGlobalFilter(value)}
                          placeholder="Search broadcasts..."
                        />
                      </div>
                      <div className="flex w-full justify-between">
                        <DataTableShowEntries
                          pageSize={table.getState().pagination.pageSize}
                          onPageSizeChange={(size) => table.setPageSize(size)}
                        />
                        <div className="flex flex-row gap-2">
                          <DataTableFilter
                            column={table.getColumn('status')}
                            title="Status"
                            options={[
                              { label: 'Draft', value: 'draft' },
                              { label: 'Scheduled', value: 'scheduled' },
                              { label: 'Sent', value: 'sent' },
                              { label: 'Failed', value: 'failed' },
                            ]}
                          />
                        </div>
                      </div>
                    </section>
                  </DataTableToolbar>
                )}
                globalFilterPlaceholder="Search broadcasts..."
              />
            )}
          </CardContent>
        </div>
      </div>
    </PageLayout>
  )
}
