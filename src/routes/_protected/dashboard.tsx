import { createFileRoute } from '@tanstack/react-router'
import { Activity, DollarSign, TrendingUp, Users } from 'lucide-react'
import { AppHeader } from '@/components/common/app-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'

export const Route = createFileRoute('/_protected/dashboard')({
    component: DashboardPage,
})

function DashboardPage() {
    const { user } = useAuth()

    const stats = [
        {
            title: 'Total Users',
            value: '2,543',
            change: '+12%',
            icon: Users,
            trend: 'up',
        },
        {
            title: 'Active Sessions',
            value: '1,234',
            change: '+5%',
            icon: Activity,
            trend: 'up',
        },
        {
            title: 'Growth',
            value: '45.2%',
            change: '+2.4%',
            icon: TrendingUp,
            trend: 'up',
        },
        {
            title: 'Revenue',
            value: '£12,543',
            change: '+18%',
            icon: DollarSign,
            trend: 'up',
        },
    ]

    return (
        <>
            <AppHeader breadcrumbs={[{ label: 'Dashboard' }]} />
            <main className="flex-1 overflow-auto p-6 lg:p-10 space-y-8 bg-background">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Welcome back, {user?.email?.split('@')[0]}!
                        </h1>
                        <p className="text-muted-foreground">
                            Here's what's happening with your platform today.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {stats.map((stat) => (
                            <Card key={stat.title} className="border-none shadow-md">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
                                    <CardTitle className="text-sm font-medium">
                                        {stat.title}
                                    </CardTitle>
                                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent className="p-6 pt-0">
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    <p className="text-xs text-muted-foreground">
                                        <span
                                            className={
                                                stat.trend === 'up'
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                            }
                                        >
                                            {stat.change}
                                        </span>{' '}
                                        from last month
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:gap-8">
                        <Card className="border-none shadow-md h-full">
                            <CardHeader className="p-8">
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>
                                    Your latest platform activities
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 pt-0">
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-4 rounded-lg bg-secondary/20 p-4"
                                        >
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background/50">
                                                <Activity className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">
                                                    Activity {i}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {i} hour{i > 1 ? 's' : ''} ago
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-md h-full">
                            <CardHeader className="p-8">
                                <CardTitle>Quick Stats</CardTitle>
                                <CardDescription>
                                    Overview of your platform metrics
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 pt-0">
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-secondary/10 transition-colors">
                                        <span className="text-sm text-muted-foreground">
                                            Conversion Rate
                                        </span>
                                        <span className="text-sm font-medium">24.5%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">
                                            Avg. Session Duration
                                        </span>
                                        <span className="text-sm font-medium">4m 32s</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">
                                            Bounce Rate
                                        </span>
                                        <span className="text-sm font-medium">32.1%</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </>
    )
}
