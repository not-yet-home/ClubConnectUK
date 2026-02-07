import { ArrowDown01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { ICON_SIZES } from '@/constants/sizes'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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
                <Button variant="outline" size="sm">
                    {viewLabels[value].label}
                    <HugeiconsIcon icon={ArrowDown01Icon} className={"ml-2 " + ICON_SIZES.sm} />
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
