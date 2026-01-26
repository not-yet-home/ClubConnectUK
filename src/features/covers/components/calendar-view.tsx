


import { useMemo, useState, useEffect } from 'react';
import { Calendar, Views, dateFnsLocalizer } from 'react-big-calendar';
import { format, getDay, parse, startOfWeek, endOfWeek } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { View } from 'react-big-calendar';
import type { CoverOccurrence } from '@/types/club.types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Setup the localizer
const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface CalendarViewProps {
    events: Array<CoverOccurrence>;
    onSelectEvent: (event: CoverOccurrence) => void;
    viewMode?: 'day' | 'week' | 'month' | '4days';
    date?: Date;
    onNavigate?: (date: Date) => void;
}

export function CalendarView({ events, onSelectEvent, viewMode = 'week', date: controlledDate, onNavigate: onControlledNavigate }: CalendarViewProps) {
    const getCalendarView = (): View => {
        switch (viewMode) {
            case 'day': return Views.DAY;
            case 'week': return Views.WEEK;
            case 'month': return Views.MONTH;
            case '4days': return Views.WORK_WEEK; // Use WORK_WEEK for 4-day view
            default: return Views.WEEK;
        }
    };

    const [view, setView] = useState<View>(getCalendarView());
    const [internalDate, setInternalDate] = useState(new Date());

    const date = controlledDate ?? internalDate;

    const handleNavigate = (newDate: Date) => {
        if (onControlledNavigate) {
            onControlledNavigate(newDate);
        } else {
            setInternalDate(newDate);
        }
    };

    // Update view when viewMode prop changes
    useEffect(() => {
        setView(getCalendarView());
    }, [viewMode]);

    // Custom Toolbar
    const CustomToolbar = (toolbar: any) => {
        const goToBack = () => {
            toolbar.onNavigate('PREV');
        };
        const goToNext = () => {
            toolbar.onNavigate('NEXT');
        };
        const goToToday = () => {
            toolbar.onNavigate('TODAY');
        };

        const getLabel = () => {
            if (toolbar.view === Views.DAY) {
                return format(toolbar.date, 'EEEE, MMMM d, yyyy');
            }
            if (toolbar.view === Views.WEEK || toolbar.view === Views.WORK_WEEK) {
                const start = startOfWeek(toolbar.date);
                const end = endOfWeek(toolbar.date);
                return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
            }
            return format(toolbar.date, 'MMMM yyyy');
        };

        return (
            <div className="flex items-center justify-between mb-4 px-4 py-2 border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={goToBack}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={goToNext}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <span className="text-xl font-bold text-gray-900">
                        {getLabel()}
                    </span>
                    <Button variant="outline" size="sm" onClick={goToToday}>Today</Button>
                </div>
            </div>
        );
    };

    // Transform CoverOccurrence to Calendar Event with proper time
    const calendarEvents = useMemo(() => {
        return events.map(occ => {
            // Parse the meeting_date
            const meetingDate = new Date(occ.meeting_date);

            // Create start and end times based on cover_rule times
            let start = new Date(meetingDate);
            let end = new Date(meetingDate);

            if (occ.cover_rule) {
                // Parse 'HH:mm:ss' format
                const [startH, startM] = occ.cover_rule.start_time.split(':').map(Number);
                const [endH, endM] = occ.cover_rule.end_time.split(':').map(Number);

                // Set the time on the date
                start.setHours(startH, startM, 0, 0);
                end.setHours(endH, endM, 0, 0);
            } else {
                // Default to 1 hour duration
                end.setHours(start.getHours() + 1);
            }

            return {
                title: occ.cover_rule?.club?.club_name || 'Cover',
                start,
                end,
                resource: occ,
                className: getEventColor(occ)
            };
        });
    }, [events]);

    // Custom Event Component for Week/Day view
    const WeekEventComponent = ({ event }: any) => {
        const occ = event.resource as CoverOccurrence;
        const teacher = occ.assignments?.[0]?.teacher;
        const teacherName = teacher
            ? `${teacher.person_details.first_name} ${teacher.person_details.last_name}`
            : 'Unassigned';

        return (
            <div className="h-full w-full px-1.5 py-1">
                <div className="font-semibold text-xs mb-0.5">{event.title}</div>
                <div className="text-[10px] opacity-90">
                    {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                </div>
                <div className="text-[10px] opacity-75 mt-0.5">{teacherName}</div>
            </div>
        );
    };

    // Custom Event Component for Month view
    const MonthEventComponent = ({ event }: any) => {
        const occ = event.resource as CoverOccurrence;
        const teacher = occ.assignments?.[0]?.teacher;
        const teacherName = teacher ? `${teacher.person_details.first_name[0]}${teacher.person_details.last_name[0]}` : null;

        return (
            <div className="flex justify-between items-center text-[10px] h-full w-full px-1">
                <span className="truncate font-medium">{event.title}</span>
                {teacherName && (
                    <span className="bg-white/40 rounded px-1 ml-1 font-bold">
                        {teacherName}
                    </span>
                )}
            </div>
        );
    };

    return (
        <div className="h-full bg-white overflow-hidden">
            <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                view={view}
                onView={setView}
                date={date}
                onNavigate={handleNavigate}
                defaultView={Views.WEEK}
                views={[Views.MONTH, Views.WEEK, Views.WORK_WEEK, Views.DAY]}
                step={30}
                showMultiDayTimes
                min={new Date(2024, 0, 1, 7, 0, 0)}  // 7 AM
                max={new Date(2024, 0, 1, 20, 0, 0)} // 8 PM
                components={{
                    toolbar: CustomToolbar,
                    event: view === Views.MONTH ? MonthEventComponent : WeekEventComponent
                }}
                eventPropGetter={(event: any) => {
                    return {
                        className: cn(
                            "rounded border-l-4 shadow-sm cursor-pointer hover:opacity-90 transition-opacity",
                            view === Views.MONTH ? "px-2 py-1 text-xs" : "px-1.5 py-1 text-xs",
                            event.className
                        )
                    }
                }}
                onSelectEvent={(event: any) => onSelectEvent(event.resource)}
                formats={{
                    dayHeaderFormat: (date) => format(date, 'EEE d'),
                    timeGutterFormat: (date) => format(date, 'h a'),
                }}
            />
        </div>
    );
}

function getEventColor(occurrence: CoverOccurrence): string {
    // This logic simulates the status coloring from the image
    // In a real app, this would be based on real status fields.
    // For mock, we used the passed 'status' in creating mock data, but we didn't save it on the type!
    // We should infer it or just randomize for "mock" visual if not present.
    // Actually, let's use the Club color logic or random for now, matching the image classes directly.

    // The image has:
    // Purple (Art Club)
    // Blue (Coding Club)
    // Green (Football)
    // Pink (Dance Class)

    const name = occurrence.cover_rule?.club?.club_name || '';
    if (name.includes('Art')) return 'bg-purple-100 text-purple-700 border-l-purple-500';
    if (name.includes('Coding')) return 'bg-blue-100 text-blue-700 border-l-blue-500';
    if (name.includes('Football')) return 'bg-green-100 text-green-700 border-l-green-500';
    if (name.includes('Dance')) return 'bg-pink-100 text-pink-700 border-l-pink-500';
    return 'bg-gray-100 text-gray-700';
}

