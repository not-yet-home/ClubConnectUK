import * as React from 'react'
import {
    Calendar04Icon,
    DashboardSquare01Icon,
    SentIcon,
    TeachingIcon,
    UserGroupIcon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { useNavigate } from '@tanstack/react-router'
import { ICON_SIZES } from '@/constants/sizes'
import { MiniCalendar } from '@/features/covers/components/mini-calendar'

import { NavMain } from '@/components/common/nav-main'
import { NavUser } from '@/components/common/nav-user'

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarRail,
} from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/use-auth'
import { useCoverOccurrences } from '@/hooks/use-covers'



export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [selectedDate, setSelectedDate] = React.useState(new Date())


    // Fetch cover occurrences for mini calendar and upcoming covers
    const { data: occurrences } = useCoverOccurrences({ schoolId: 'all' })
    const events = React.useMemo(() => occurrences || [], [occurrences])

    const navItems = [
        {
            title: 'Dashboard',
            url: '/dashboard',
            icon: () => <HugeiconsIcon icon={DashboardSquare01Icon} className={ICON_SIZES.md} />,
            isActive: false,
        },
        {
            title: 'Covers',
            url: '/covers',
            icon: () => <HugeiconsIcon icon={Calendar04Icon} className={ICON_SIZES.md} />,
            isActive: false,
        },
        {
            title: 'Teachers',
            url: '/teachers/teacher-list',
            icon: () => <HugeiconsIcon icon={TeachingIcon} className={ICON_SIZES.md} />,
            isActive: false,
        },
        {
            title: 'Clubs',
            url: '/clubs/club-list',
            icon: () => <HugeiconsIcon icon={UserGroupIcon} className={ICON_SIZES.md} />,
            isActive: false,
        },
        {
            title: 'Broadcasts',
            url: '/broadcast',
            icon: () => <HugeiconsIcon icon={SentIcon} className={ICON_SIZES.md} />,
            isActive: false,
        }
    ]

    const userData = {
        name: user?.email?.split('@')[0] || 'User',
        email: user?.email || 'user@example.com',
        avatar: '',
    }

    const handleSelectDate = (date: Date) => {
        setSelectedDate(date)
        // Navigate to covers page with the selected date
        navigate({ to: '/covers' })
    }



    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarGroup>
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <span className="text-sm font-bold">CC</span>
                        </div>
                        <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                            <span className="text-sm font-semibold">Dance & Arts</span>
                            <span className="text-xs text-muted-foreground">UK Platform</span>
                        </div>
                    </div>
                </SidebarGroup>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <NavMain items={navItems} />
                </SidebarGroup>

                {/* Mini Calendar - Hidden when sidebar collapsed */}
                <SidebarGroup className="group-data-[collapsible=icon]:hidden mt-4">
                    <MiniCalendar
                        selectedDate={selectedDate}
                        onSelectDate={handleSelectDate}
                        occurrences={events}
                    />
                </SidebarGroup>


            </SidebarContent>
            <SidebarFooter>
                <NavUser user={userData} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
