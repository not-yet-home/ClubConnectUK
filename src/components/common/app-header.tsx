import { SidebarTrigger } from '@/components/ui/sidebar'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

interface AppHeaderProps {
    breadcrumbs?: Array<{
        label: string
        href?: string
    }>
}

export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
    return (
        <header className="flex sticky top-0 z-50 h-14 shrink-0 items-center gap-2 bg-background rounded-tl-md rounded-tr-md border-b border-border px-4">
            <SidebarTrigger />
            <Breadcrumb>
                <BreadcrumbList>
                    {breadcrumbs.map((crumb, index) => (
                        <div key={index} className="flex items-center gap-2">
                            {index > 0 && <BreadcrumbSeparator />}
                            <BreadcrumbItem>
                                {crumb.href ? (
                                    <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                                ) : (
                                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                                )}
                            </BreadcrumbItem>
                        </div>
                    ))}
                </BreadcrumbList>
            </Breadcrumb>
        </header>
    )
}
