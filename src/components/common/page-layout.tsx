import { AppHeader } from '@/components/common/app-header'
import { cn } from '@/lib/utils'

interface PageLayoutProps {
    children: React.ReactNode
    breadcrumbs?: { label: string; href?: string }[]
    className?: string
}

export function PageLayout({ children, breadcrumbs = [], className }: PageLayoutProps) {
    return (
        <>
            <AppHeader breadcrumbs={breadcrumbs} />
            <main className={cn("flex-1 overflow-auto p-6 rounded-b-md bg-background", className)}>
                {children}
            </main>
        </>
    )
}
