import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createFileRoute } from '@tanstack/react-router'
import { AppHeader } from '@/components/app-header'
import useTeachers from '@/hooks/use-teachers'
import { DataTable } from './data-table'
import { columns } from './column'

export const Route = createFileRoute('/_protected/teachers/teacher-list')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: teachers } = useTeachers();
  console.log(teachers);
  return (
    <>
      <AppHeader breadcrumbs={[{ label: 'Teachers' }]} />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto space-y-6">
          <div>
            <CardHeader>
              <CardTitle>Teacher Management</CardTitle>
              <CardDescription>
                View and manage all teachers on your platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={teachers ?? []} />
            </CardContent>
          </div>
        </div>
      </main>
    </>
  )
}
