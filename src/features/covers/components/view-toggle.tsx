import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export type ViewType = 'day' | 'week' | 'month' | 'year' | 'schedule' | '4days'

interface ViewToggleProps {
    value: ViewType
    onChange: (value: ViewType) => void
}

const viewLabels: Record<ViewType, { label: string; shortcut: string }> = {
    day: { label: 'Day', shortcut: 'D' },
    week: { label: 'Week', shortcut: 'W' },
    month: { label: 'Month', shortcut: 'M' },
    year: { label: 'Year', shortcut: 'Y' },
    schedule: { label: 'Schedule', shortcut: 'A' },
    '4days': { label: '4 days', shortcut: 'X' },
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="min-w-[100px]">
                    {viewLabels[value].label}
                    <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                {Object.entries(viewLabels).map(([key, { label, shortcut }]) => (
                    <DropdownMenuItem
                        key={key}
                        onClick={() => onChange(key as ViewType)}
                        className="flex items-center justify-between"
                    >
                        <span>{label}</span>
                        <span className="text-xs text-muted-foreground">{shortcut}</span>
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                    More options coming soon
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
