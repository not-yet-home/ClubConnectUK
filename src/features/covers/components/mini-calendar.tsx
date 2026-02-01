import * as React from 'react'
import {
    addMonths,
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    format,
    isSameDay,
    isSameMonth,
    isToday,
    startOfMonth,
    startOfWeek,
    subMonths,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import type { CoverOccurrence } from '@/types/club.types'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MiniCalendarProps {
    selectedDate: Date
    onSelectDate: (date: Date) => void
    occurrences: Array<CoverOccurrence>
}

export function MiniCalendar({ selectedDate, onSelectDate, occurrences }: MiniCalendarProps) {
    const [currentMonth, setCurrentMonth] = React.useState(selectedDate)

    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

    // Check if a date has any occurrences
    const hasOccurrence = (date: Date) => {
        return occurrences.some(occ =>
            isSameDay(new Date(occ.meeting_date), date)
        )
    }

    const handlePrevMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1))
    }

    const handleNextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1))
    }

    const handleDateClick = (date: Date) => {
        onSelectDate(date)
    }

    return (
        <div className="w-full bg-white rounded-lg border border-gray-200 p-4">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">
                    {format(currentMonth, 'MMMM yyyy')}
                </h3>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={handlePrevMonth}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={handleNextMonth}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Week Days Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day, i) => (
                    <div
                        key={i}
                        className="text-xs font-medium text-gray-500 text-center py-1"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
                {days.map((day, i) => {
                    const isCurrentMonth = isSameMonth(day, currentMonth)
                    const isSelected = isSameDay(day, selectedDate)
                    const isTodayDate = isToday(day)
                    const hasEvent = hasOccurrence(day)

                    return (
                        <button
                            key={i}
                            onClick={() => handleDateClick(day)}
                            className={cn(
                                "relative h-8 w-full text-xs font-medium rounded-md transition-colors",
                                "hover:bg-gray-100",
                                !isCurrentMonth && "text-gray-300",
                                isCurrentMonth && "text-gray-700",
                                isTodayDate && "bg-blue-50 text-blue-600 font-semibold",
                                isSelected && "bg-blue-500 text-white hover:bg-blue-600",
                                isSelected && isTodayDate && "bg-blue-600"
                            )}
                        >
                            {format(day, 'd')}
                            {hasEvent && (
                                <div className={cn(
                                    "absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full",
                                    isSelected ? "bg-white" : "bg-blue-500"
                                )} />
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
