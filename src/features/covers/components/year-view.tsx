import { Calendar as CalendarIcon } from 'lucide-react'

import type { CoverOccurrence } from '@/types/club.types'

import { Card } from '@/components/ui/card'

interface YearViewProps {
    occurrences: Array<CoverOccurrence>
    selectedYear: number
    onSelectMonth: (month: number) => void
}

export function YearView({ occurrences, selectedYear, onSelectMonth }: YearViewProps) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]

    // Count occurrences per month
    const getMonthCount = (month: number) => {
        return occurrences.filter(occ => {
            const date = new Date(occ.meeting_date)
            return date.getFullYear() === selectedYear && date.getMonth() === month
        }).length
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedYear}</h2>
                <p className="text-sm text-gray-500">{occurrences.length} cover sessions this year</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {months.map((month, index) => {
                    const count = getMonthCount(index)
                    return (
                        <Card
                            key={month}
                            className="p-4 cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500 hover:bg-gray-50"
                            onClick={() => onSelectMonth(index)}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-gray-900">{month}</h3>
                                <CalendarIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <p className="text-2xl font-bold text-blue-600">{count}</p>
                            <p className="text-xs text-gray-500">
                                {count === 0 ? 'No sessions' : count === 1 ? 'session' : 'sessions'}
                            </p>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
