import * as React from 'react'
import {
    LayoutDashboard,
    Settings,
    GraduationCap,
} from 'lucide-react'

import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
    SidebarGroup,
    SidebarGroupLabel,
} from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/use-auth'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { user } = useAuth()

    const navItems = [
        {
            title: 'Dashboard',
            url: '/dashboard',
            icon: LayoutDashboard,
            isActive: false,
        },
        {
            title: 'Teachers',
            url: '/teachers/teacher-list',
            icon: GraduationCap,
            isActive: false,
        },
        {
            title: 'Settings',
            url: '/settings',
            icon: Settings,
            isActive: false,
        },
    ]

    const userData = {
        name: user?.email?.split('@')[0] || 'User',
        email: user?.email || 'user@example.com',
        avatar: '',
    }

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarGroup>
                    <div className="flex items-center gap-2 px-2 py-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <span className="text-sm font-bold">CC</span>
                        </div>
                        <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                            <span className="text-sm font-semibold">ClubConnect</span>
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
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={userData} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
