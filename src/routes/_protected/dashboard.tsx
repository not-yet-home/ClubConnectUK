import {
  ActivityIcon,
  Alert01Icon,
  Calendar02Icon,
  Message01Icon,
  PlusSignIcon,
  School01Icon,
  Tick01Icon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { createFileRoute } from '@tanstack/react-router'
import { format } from 'date-fns'

import type { CoverOccurrence } from '@/types/club.types'
import { PageLayout } from '@/components/common/page-layout'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  useDashboardStats,
  useUpcomingAgenda,
} from '@/features/dashboard/api/queries'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_protected/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: agenda } = useUpcomingAgenda()

  const kpis = [
    {
      title: 'Total Active Clubs',
      value: stats?.totalClubs ?? '0',
      icon: School01Icon,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Open Cover Requests',
      value: stats?.openCovers ?? '0',
      icon: Alert01Icon,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      title: 'Active Teachers',
      value: stats?.activeTeachers ?? '0',
      icon: UserGroupIcon,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      title: 'Msg. Success Rate',
      value: stats?.messageSuccessRate ?? '100%',
      icon: Message01Icon,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ]

  return (
    <PageLayout breadcrumbs={[{ label: 'Dashboard' }]}>
      <div className="mx-auto space-y-8">
        {/* KPI Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <Card key={kpi.title} className="border-none transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <div className={cn('p-2 rounded-lg', kpi.bg)}>
                  <HugeiconsIcon
                    icon={kpi.icon}
                    className={cn('h-5 w-5', kpi.color)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {statsLoading ? (
                    <div className="h-8 w-16 bg-gray-100 animate-pulse rounded" />
                  ) : (
                    kpi.value
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content: Command Center Layout */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column: Upcoming Priorities (2/3) */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="border-none border-gray-100">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">Upcoming Priorities</CardTitle>
                  <CardDescription>
                    Next 7 days of club meetings and cover assignments
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary font-medium"
                >
                  View Calendar
                </Button>
              </CardHeader>
              <CardContent className="px-0">
                <div className="divide-y divide-gray-50">
                  {agenda === undefined ? (
                    [1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="p-6 h-20 bg-gray-50/50 animate-pulse"
                      />
                    ))
                  ) : agenda.length > 0 ? (
                    agenda.map((item: CoverOccurrence) => {
                      const statusId = (item.assignments?.[0]?.status ??
                        'unstaffed') as
                        | 'confirmed'
                        | 'accepted'
                        | 'pending'
                        | 'invited'
                        | 'unstaffed'

                      const statusConfig: Record<
                        string,
                        { label: string; color: string; icon: any }
                      > = {
                        confirmed: {
                          label: 'Staffed',
                          color: 'bg-emerald-100 text-emerald-700',
                          icon: Tick01Icon,
                        },
                        accepted: {
                          label: 'Staffed',
                          color: 'bg-emerald-100 text-emerald-700',
                          icon: Tick01Icon,
                        },
                        pending: {
                          label: 'Pending',
                          color: 'bg-amber-100 text-amber-700',
                          icon: Calendar02Icon,
                        },
                        invited: {
                          label: 'Invited',
                          color: 'bg-amber-100 text-amber-700',
                          icon: Calendar02Icon,
                        },
                        unstaffed: {
                          label: 'Urgent',
                          color: 'bg-rose-100 text-rose-700 animate-pulse',
                          icon: Alert01Icon,
                        },
                      }

                      const currentStatus = statusConfig[statusId]

                      return (
                        <div
                          key={item.id}
                          className="group flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex gap-4 items-center">
                            <div
                              className={cn(
                                'p-2 rounded-full',
                                statusId === 'unstaffed'
                                  ? 'bg-rose-50'
                                  : 'bg-gray-50',
                              )}
                            >
                              <HugeiconsIcon
                                icon={currentStatus.icon}
                                className={cn(
                                  'h-5 w-5',
                                  statusId === 'unstaffed'
                                    ? 'text-rose-600'
                                    : 'text-gray-400',
                                )}
                              />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {item.cover_rule?.club?.club_name}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {format(
                                  new Date(item.meeting_date),
                                  'EEEE, MMMM do',
                                )}{' '}
                                • {item.cover_rule?.start_time}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span
                              className={cn(
                                'px-2.5 py-0.5 rounded-full text-xs font-medium',
                                currentStatus.color,
                              )}
                            >
                              {currentStatus.label}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              Details
                            </Button>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="p-12 text-center">
                      <HugeiconsIcon
                        icon={Calendar02Icon}
                        className="h-12 w-12 mx-auto text-gray-300 mb-4"
                      />
                      <p className="text-gray-500 font-medium">
                        No upcoming club meetings found.
                      </p>
                      <p className="text-sm text-gray-400">
                        Time to schedule some fun!
                      </p>
                    </div>
                  )}
                </div>
                {agenda && agenda.length > 0 && (
                  <div className="p-4 border-t border-gray-50 text-center">
                    <Button
                      variant="link"
                      size="sm"
                      className="text-muted-foreground font-normal"
                    >
                      Load more priorities
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Quick Actions & Live Activity (1/3) */}
          <div className="lg:col-span-4 space-y-8">
            {/* Quick Actions Card */}
            <Card className="border-none bg-primary text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <HugeiconsIcon
                  icon={PlusSignIcon}
                  className="h-24 w-24 transform rotate-12"
                />
              </div>
              <CardHeader className="relative">
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription className="text-white/80">
                  Launch common task flows
                </CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-3">
                <Button className="w-full bg-white text-primary hover:outline-1 hover:bg-secondary cursor-pointer justify-start gap-2 font-semibold">
                  <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4" />
                  New Cover Request
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-[var(--primary)] border-[--background] hover:text-white hover:bg-[var(--primary-light)] text-white justify-start gap-2 font-medium cursor-pointer"
                >
                  <HugeiconsIcon icon={Message01Icon} className="h-4 w-4" />
                  Broadcast Message
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity Card */}
            <Card className="border-none border-gray-100 flex-1">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <HugeiconsIcon
                    icon={ActivityIcon}
                    className="h-5 w-5 text-indigo-500"
                  />
                  Live Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 pt-0">
                <div className="space-y-1">
                  {[
                    {
                      user: 'Mr. Smith',
                      action: 'accepted cover for',
                      target: 'Dance Club',
                      time: '10m ago',
                    },
                    {
                      user: 'System',
                      action: 'sent broadcast for',
                      target: 'Urgent: Debate Club',
                      time: '2h ago',
                    },
                    {
                      user: 'Admin',
                      action: 'added a new club:',
                      target: 'Robotics 101',
                      time: '5h ago',
                    },
                  ].map((act, i) => (
                    <div
                      key={i}
                      className="px-6 py-4 flex gap-3 hover:bg-gray-50 transition-colors cursor-default"
                    >
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        <HugeiconsIcon
                          icon={UserGroupIcon}
                          className="h-4 w-4 text-gray-500"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-snug">
                          <span className="font-semibold text-gray-900">
                            {act.user}
                          </span>{' '}
                          <span className="text-gray-600">{act.action}</span>{' '}
                          <span className="font-medium text-gray-900 truncate block sm:inline">
                            {act.target}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {act.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
