import { useEffect, useMemo, useState } from 'react';
import { Calendar, Views, dateFnsLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { addHours, endOfWeek, format, getDay, parse, set, startOfWeek } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { getClubColors, parseLocalDate } from '../utils/formatters';
import type { View } from 'react-big-calendar';
import type { ViewType } from '@/features/covers/components/view-toggle';
import type { CoverOccurrence } from '@/types/club.types';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const DragAndDropCalendar = withDragAndDrop(Calendar as any);

// ... (rbcStyleOverrides remains unchanged) ...

const rbcStyleOverrides = `
.rbc-calendar {
    font-family: inherit;
}
.rbc-event {
    min-height: auto !important;
    margin: 0 !important;
    padding: 1px !important;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1) !important;
    transition: all 0.2s ease-in-out;
}
.rbc-event:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
    z-index: 50 !important;
}
.rbc-event-content {
    font-size: 0.75rem;
    padding: 2px 4px;
    height: 100%;
}
.rbc-event-label {
    display: none !important;
}
.rbc-time-slot {
    min-height: 28px;
}
.rbc-current-time-indicator {
    display: none !important;
}
.rbc-time-header-content {
    border-left: 1px solid #e5e7eb !important;
}
.rbc-timeslot-group {
    border-bottom: 1px solid #f3f4f6 !important;
}
@media (max-width: 640px) {
    .rbc-time-gutter {
        width: 38px !important;
        font-size: 10px !important;
    }
    .rbc-time-header-content {
        font-size: 10px !important;
    }
    .rbc-header {
        padding: 4px 2px !important;
    }
    .rbc-time-slot {
        min-height: 24px !important;
    }
    .rbc-event-content {
        font-size: 0.6rem !important;
        line-height: 1.1 !important;
        padding: 1px !important;
    }
    .rbc-time-view .rbc-header + .rbc-header {
        border-left: 1px solid #f3f4f6 !important;
    }
}
`;

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
    onSelectSlot?: (date: Date) => void;
    onDrillDown?: (date: Date) => void;
    onEventDrop?: (event: CoverOccurrence, newDate: Date) => void;
    viewMode?: ViewType;
    date?: Date;
    onNavigate?: (date: Date) => void;
    onViewChange?: (view: ViewType) => void;
}

export function CalendarView({
    events,
    onSelectEvent,
    onSelectSlot,
    onDrillDown,
    onEventDrop,
    viewMode = 'month',
    date: controlledDate,
    onNavigate: onControlledNavigate,
    onViewChange
}: CalendarViewProps) {
    const getCalendarView = (mode: ViewType): View => {
        switch (mode) {
            case 'day': return Views.DAY;
            case 'week': return Views.WEEK;
            case 'month': return Views.MONTH;
            case 'year': return Views.MONTH; // Placeholder as RBC has no year view
            case 'schedule': return Views.AGENDA;
            case '4days': return Views.WORK_WEEK;
            default: return Views.WEEK;
        }
    };

    const getViewTypeFromRBC = (rbcView: View): ViewType => {
        switch (rbcView) {
            case Views.DAY: return 'day';
            case Views.WEEK: return 'week';
            case Views.MONTH: return 'month';
            case Views.AGENDA: return 'schedule';
            case Views.WORK_WEEK: return '4days';
            default: return 'week';
        }
    };

    const [view, setView] = useState<View>(() => {
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
        // Override week or month with day view on mobile platforms for better legibility
        if ((viewMode === 'week' || viewMode === 'month') && isMobile) return Views.DAY;
        return getCalendarView(viewMode);
    });

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
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
        let newView: View;

        if ((viewMode === 'week' || viewMode === 'month') && isMobile) {
            newView = Views.DAY;
        } else {
            newView = getCalendarView(viewMode);
        }

        setView(newView);
    }, [viewMode]);

    // Handle internal view changes from RBC
    const handleViewChange = (newView: View) => {
        setView(newView);
        if (onViewChange) {
            onViewChange(getViewTypeFromRBC(newView));
        }
    };

    // Notify parent if mobile override happens on mount
    useEffect(() => {
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
        if ((viewMode === 'week' || viewMode === 'month') && isMobile && onViewChange) {
            onViewChange('day');
        }
    }, []);

    // Custom Toolbar
    const CustomToolbar = (toolbar: any) => {
        const goToBack = () => toolbar.onNavigate('PREV');
        const goToNext = () => toolbar.onNavigate('NEXT');
        const goToToday = () => toolbar.onNavigate('TODAY');

        const getLabel = () => {
            if (toolbar.view === Views.DAY) {
                return format(toolbar.date, 'eee, MMM d');
            }
            if (toolbar.view === Views.WEEK || toolbar.view === Views.WORK_WEEK) {
                const start = startOfWeek(toolbar.date);
                const end = endOfWeek(toolbar.date);
                // Use shorter format for mobile
                const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
                if (isMobile) {
                    return `${format(start, 'MMM d')} - ${format(end, 'd')}`;
                }
                return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
            }
            return format(toolbar.date, 'MMMM yyyy');
        };

        return (
            <div className="flex flex-col sm:flex-row items-center justify-between mb-4 px-2 sm:px-4 py-2 border-b border-gray-100 gap-3">
                <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={goToBack} className="h-8 w-8">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={goToNext} className="h-8 w-8">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <span className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                        {getLabel()}
                    </span>
                    <Button variant="outline" size="sm" onClick={goToToday} className="sm:hidden h-8 text-xs font-semibold px-2">Today</Button>
                </div>
                <Button variant="outline" size="sm" onClick={goToToday} className="hidden sm:inline-flex h-8 text-xs font-semibold px-3">Today</Button>
            </div>
        );
    };

    // Transform CoverOccurrence to Calendar Event with proper time
    const calendarEvents = useMemo(() => {
        return events.map(occ => {
            const meetingDate = parseLocalDate(occ.meeting_date);

            // Create start and end times based on cover_rule times
            let start = new Date(meetingDate);
            let end = new Date(meetingDate);
            let displayEnd = new Date(meetingDate);

            if (occ.cover_rule) {
                // Parse 'HH:mm:ss' format
                const [startH, startM = 0] = occ.cover_rule.start_time.split(':').map(Number);
                const [endH, endM = 0] = occ.cover_rule.end_time.split(':').map(Number);

                start = set(meetingDate, { hours: startH, minutes: startM, seconds: 0, milliseconds: 0 });
                // Add 1 hour to end time to make it inclusive of the end hour slot
                displayEnd = set(meetingDate, { hours: endH, minutes: endM, seconds: 0, milliseconds: 0 });
                end = addHours(displayEnd, 1);
            } else {
                start = set(meetingDate, { hours: 9, minutes: 0, seconds: 0, milliseconds: 0 });
                displayEnd = set(meetingDate, { hours: 10, minutes: 0, seconds: 0, milliseconds: 0 });
                end = addHours(displayEnd, 1);
            }

            return {
                id: occ.id,
                title: occ.cover_rule?.club?.club_name || 'Cover',
                start,
                end,
                displayStart: start,
                displayEnd,
                resource: occ
            };
        });
    }, [events]);

    const handleEventDrop = ({ event, start }: any) => {
        if (onEventDrop && event.resource) {
            onEventDrop(event.resource, start);
        }
    };

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
                    {format(event.displayStart, 'h:mm a')} - {format(event.displayEnd, 'h:mm a')}
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
        <div className="h-full bg-white overflow-hidden relative">
            <style>{rbcStyleOverrides}</style>
            <DragAndDropCalendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                view={view}
                onView={handleViewChange}
                date={date}
                onNavigate={handleNavigate}
                defaultView={Views.WEEK}
                views={[Views.MONTH, Views.WEEK, Views.WORK_WEEK, Views.DAY]}
                step={30}
                showMultiDayTimes
                min={set(new Date(), { hours: 7, minutes: 0 })}  // 7 AM
                max={set(new Date(), { hours: 20, minutes: 0 })} // 8 PM
                scrollToTime={set(new Date(), { hours: 9, minutes: 0 })}
                draggableAccessor={() => true}
                selectable={true}
                onSelectSlot={(slotInfo) => {
                    // Prevent clicking on gray areas (off-month days) in Month view
                    if (view === Views.MONTH) {
                        if (slotInfo.start.getMonth() !== date.getMonth()) return;
                    }
                    onSelectSlot?.(slotInfo.start);
                }}
                onDrillDown={(drillDate) => {
                    // Prevent drilling down on gray areas (off-month days) in Month view
                    if (view === Views.MONTH) {
                        if (drillDate.getMonth() !== date.getMonth()) return;
                    }
                    onDrillDown?.(drillDate);
                }}
                onEventDrop={handleEventDrop}
                components={{
                    toolbar: CustomToolbar,
                    event: view === Views.MONTH ? MonthEventComponent : WeekEventComponent
                }}
                eventPropGetter={(event: any) => {
                    const colors = getClubColors(event.resource.cover_rule?.club?.club_name);
                    return {
                        className: cn(
                            "cursor-grab active:cursor-grabbing hover:opacity-90 transition-opacity",
                            view === Views.MONTH ? "px-2 py-1 text-xs" : "px-0 py-0"
                        ),
                        style: {
                            backgroundColor: colors.bgHex,
                            color: colors.textHex,
                            borderColor: colors.borderHex,
                            borderRadius: '4px',
                            borderStyle: 'solid',
                            borderWidth: '1px',
                            borderLeftWidth: '4px',
                            margin: 0,
                            marginBottom: 0
                        }
                    };
                }}
                onSelectEvent={(event: any) => onSelectEvent(event.resource)}
                formats={{
                    dayHeaderFormat: (d) => format(d, 'EEE d'),
                    timeGutterFormat: (d) => format(d, 'h a'),
                    eventTimeRangeFormat: () => '', // Hide default time range as we render it in the component
                }}
            />
        </div>
    );
}


