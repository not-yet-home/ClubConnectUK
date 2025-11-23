import { createFileRoute } from '@tanstack/react-router'
import { AppHeader } from '@/components/app-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/_protected/users')({
    component: UsersPage,
})

function UsersPage() {
    return (
        <>
            <AppHeader breadcrumbs={[{ label: 'Users' }]} />
            <main className="flex-1 overflow-auto p-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                        <p className="text-muted-foreground">
                            Manage your platform users
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>User Management</CardTitle>
                            <CardDescription>
                                View and manage all users on your platform
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12 text-muted-foreground">
                                User management interface coming soon...
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </>
    )
}
