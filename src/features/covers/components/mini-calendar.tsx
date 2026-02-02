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

    // Sync currentMonth when selectedDate changes from external source
    React.useEffect(() => {
        if (!isSameMonth(selectedDate, currentMonth)) {
            setCurrentMonth(selectedDate)
        }
    }, [selectedDate])

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

    const handleDateClick = (day: Date, isCurrentMonth: boolean) => {
        // Only allow clicking on current month days
        if (!isCurrentMonth) return
        onSelectDate(day)
    }

    return (
        <div className="w-full">
            {/* Month Navigation - Google Calendar style */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900">
                    {format(currentMonth, 'MMMM yyyy')}
                </h3>
                <div className="flex items-center">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-gray-100 rounded-full"
                        onClick={handlePrevMonth}
                    >
                        <ChevronLeft className="h-4 w-4 text-gray-600" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-gray-100 rounded-full"
                        onClick={handleNextMonth}
                    >
                        <ChevronRight className="h-4 w-4 text-gray-600" />
                    </Button>
                </div>
            </div>

            {/* Week Days Header - Google Calendar style */}
            <div className="grid grid-cols-7 mb-1">
                {weekDays.map((day, i) => (
                    <div
                        key={i}
                        className="text-[10px] font-medium text-gray-500 text-center py-1"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid - Google Calendar style */}
            <div className="grid grid-cols-7">
                {days.map((day, i) => {
                    const isCurrentMonth = isSameMonth(day, currentMonth)
                    const isSelected = isSameDay(day, selectedDate)
                    const isTodayDate = isToday(day)
                    const hasEvent = hasOccurrence(day)

                    return (
                        <div
                            key={i}
                            onClick={() => handleDateClick(day, isCurrentMonth)}
                            className={cn(
                                "relative flex items-center justify-center h-8 w-full",
                                // Gray out non-current month days and make non-clickable
                                isCurrentMonth
                                    ? "cursor-pointer hover:bg-gray-100 rounded-full transition-colors"
                                    : "cursor-default"
                            )}
                        >
                            <span
                                className={cn(
                                    "flex items-center justify-center w-7 h-7 text-xs font-medium rounded-full transition-colors",
                                    // Non-current month days are grayed out
                                    !isCurrentMonth && "text-gray-300",
                                    // Current month days
                                    isCurrentMonth && !isSelected && !isTodayDate && "text-gray-700",
                                    // Today's date - blue circle with white text (Google style)
                                    isTodayDate && !isSelected && "bg-blue-600 text-white",
                                    // Selected date
                                    isSelected && !isTodayDate && "bg-blue-100 text-blue-700",
                                    // Selected + Today
                                    isSelected && isTodayDate && "bg-blue-600 text-white ring-2 ring-blue-200"
                                )}
                            >
                                {format(day, 'd')}
                            </span>
                            {/* Event indicator dot */}
                            {hasEvent && isCurrentMonth && (
                                <div className={cn(
                                    "absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full",
                                    isSelected || isTodayDate ? "bg-blue-300" : "bg-blue-500"
                                )} />
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
