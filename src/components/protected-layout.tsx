import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'

interface ProtectedLayoutProps {
    children: React.ReactNode
    breadcrumbs?: Array<{ label: string; href?: string }>
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <section className="bg-sidebar p-3">
                <SidebarInset>{children}</SidebarInset>
            </section>

        </SidebarProvider>
    )
}
