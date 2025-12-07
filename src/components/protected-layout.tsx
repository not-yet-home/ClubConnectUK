import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { AppHeader } from './app-header'

interface ProtectedLayoutProps {
    children: React.ReactNode
    breadcrumbs?: Array<{ label: string; href?: string }>
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="mt-10">{children}</SidebarInset>
        </SidebarProvider>
    )
}
