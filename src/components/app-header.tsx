import { SidebarTrigger } from '@/components/ui/sidebar'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'

interface AppHeaderProps {
    breadcrumbs?: {
        label: string
        href?: string
    }[]
}

export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
    return (
        <header className="flex fixed top-1 mr-3 z-10 h-14 shrink-0 items-center gap-2 bg-white w-full shadow-sm px-4">            <SidebarTrigger />
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
