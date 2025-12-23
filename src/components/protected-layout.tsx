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
            <section className="flex min-h-0 w-full flex-1 flex-col bg-secondary p-3">
                <SidebarInset>{children}</SidebarInset>
            </section>

        </SidebarProvider>
    )
}
