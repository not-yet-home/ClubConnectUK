import { format, isSameDay, isToday, isTomorrow, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns'
import { Calendar as CalendarIcon, Clock, User, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { CoverOccurrence } from '@/types/club.types'

interface CoversListViewProps {
    occurrences: CoverOccurrence[]
    onSelectOccurrence: (occurrence: CoverOccurrence) => void
}

export function CoversListView({ occurrences, onSelectOccurrence }: CoversListViewProps) {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const weekStart = startOfWeek(today)
    const weekEnd = endOfWeek(today)

    // Group occurrences by time period
    const todayOccurrences = occurrences.filter(occ =>
        isSameDay(new Date(occ.meeting_date), today)
    )

    const tomorrowOccurrences = occurrences.filter(occ =>
        isTomorrow(new Date(occ.meeting_date))
    )

    const thisWeekOccurrences = occurrences.filter(occ => {
        const date = new Date(occ.meeting_date)
        return isWithinInterval(date, { start: weekStart, end: weekEnd }) &&
            !isToday(date) && !isTomorrow(date)
    })

    const laterOccurrences = occurrences.filter(occ => {
        const date = new Date(occ.meeting_date)
        return !isWithinInterval(date, { start: weekStart, end: weekEnd })
    })

    return (
        <div className="space-y-6 pb-8">
            {todayOccurrences.length > 0 && (
                <Section title="Today" occurrences={todayOccurrences} onSelect={onSelectOccurrence} />
            )}

            {tomorrowOccurrences.length > 0 && (
                <Section title="Tomorrow" occurrences={tomorrowOccurrences} onSelect={onSelectOccurrence} />
            )}

            {thisWeekOccurrences.length > 0 && (
                <Section title="This Week" occurrences={thisWeekOccurrences} onSelect={onSelectOccurrence} />
            )}

            {laterOccurrences.length > 0 && (
                <Section title="Later" occurrences={laterOccurrences} onSelect={onSelectOccurrence} />
            )}

            {occurrences.length === 0 && (
                <div className="text-center py-16">
                    <CalendarIcon className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-4 text-sm font-medium text-gray-900">No cover sessions</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        No cover sessions scheduled for the selected period.
                    </p>
                </div>
            )}
        </div>
    )
}

function Section({
    title,
    occurrences,
    onSelect
}: {
    title: string
    occurrences: CoverOccurrence[]
    onSelect: (occ: CoverOccurrence) => void
}) {
    return (
        <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>
            <div className="space-y-2">
                {occurrences.map((occ) => (
                    <OccurrenceCard
                        key={occ.id}
                        occurrence={occ}
                        onClick={() => onSelect(occ)}
                    />
                ))}
            </div>
        </div>
    )
}

function OccurrenceCard({ occurrence, onClick }: { occurrence: CoverOccurrence, onClick: () => void }) {
    const { cover_rule } = occurrence
    const clubName = cover_rule?.club?.club_name || 'Unknown Club'
    const schoolName = cover_rule?.school?.school_name || 'Unknown School'
    const teacher = occurrence.assignments?.[0]?.teacher
    const teacherName = teacher
        ? `${teacher.person_details.first_name} ${teacher.person_details.last_name}`
        : 'Unassigned'

    const getStatusColor = () => {
        const status = occurrence.assignments?.[0]?.status
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-700 border-green-200'
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
            default: return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    return (
        <Card
            className="p-4 cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
            onClick={onClick}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-base font-semibold text-gray-900">{clubName}</h4>
                        <Badge variant="outline" className={cn("text-xs", getStatusColor())}>
                            {occurrence.assignments?.[0]?.status || 'Unassigned'}
                        </Badge>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">{schoolName}</p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                            <CalendarIcon className="h-4 w-4 text-gray-400" />
                            <span>{format(new Date(occurrence.meeting_date), 'EEE, d MMM')}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>
                                {cover_rule?.start_time.slice(0, 5)} - {cover_rule?.end_time.slice(0, 5)}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className={!teacher ? 'text-orange-600 italic' : ''}>
                                {teacherName}
                            </span>
                        </div>
                    </div>
                </div>

                <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 ml-4" />
            </div>
        </Card>
    )
}
