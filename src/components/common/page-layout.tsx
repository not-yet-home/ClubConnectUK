import { AppHeader } from '@/components/common/app-header'
import { cn } from '@/lib/utils'

interface PageLayoutProps {
    children: React.ReactNode
    breadcrumbs?: Array<{ label: string; href?: string }>
    actions?: React.ReactNode
    className?: string
}

export function PageLayout({ children, breadcrumbs = [], actions, className }: PageLayoutProps) {
    return (
        <>
            <AppHeader breadcrumbs={breadcrumbs} actions={actions} />
            <main className={cn("flex-1 overflow-auto p-3 sm:p-4 rounded-b-md bg-background", className)}>
                {children}
            </main>
        </>
    )
}
