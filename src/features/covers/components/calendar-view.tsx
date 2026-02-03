import { useEffect, useMemo, useState } from 'react';
import { Calendar, Views, dateFnsLocalizer } from 'react-big-calendar';
import withDragAndDropAcccent from 'react-big-calendar/lib/addons/dragAndDrop';
import { addHours, endOfWeek, format, getDay, parse, set, startOfWeek } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { getSchoolColors, parseLocalDate } from '../utils/formatters';
import type { SlotInfo, View } from 'react-big-calendar';
import type { ViewType } from '@/features/covers/components/view-toggle';
import type { CoverOccurrence } from '@/types/club.types';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const withDragAndDrop: any = (withDragAndDropAcccent as any).default || withDragAndDropAcccent;
const DragAndDropCalendar = withDragAndDrop(Calendar as any);

const rbcStyleOverrides = `
.rbc-calendar {
    font-family: inherit;
}
/* Event styling */
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

/* Month View - Google Calendar style */
.rbc-month-view {
    border: none !important;
}
.rbc-month-view .rbc-header {
    border-bottom: 1px solid #e5e7eb !important;
    padding: 8px 0 !important;
    font-weight: 500 !important;
    font-size: 11px !important;
    text-transform: uppercase !important;
    color: #70757a !important;
}
.rbc-month-row {
    border: none !important;
}
.rbc-month-row + .rbc-month-row {
    border-top: 1px solid #e5e7eb !important;
}
.rbc-day-bg {
    border-left: 1px solid #e5e7eb !important;
    transition: background-color 0.15s ease;
}
.rbc-day-bg:first-child {
    border-left: none !important;
}
.rbc-day-bg:hover {
    background-color: #f8f9fa !important;
}
/* Off-month (gray) days - non-clickable appearance */
.rbc-day-bg.rbc-off-range-bg {
    background-color: #f8f9fa !important;
    cursor: default !important;
}
.rbc-day-bg.rbc-off-range-bg:hover {
    background-color: #f8f9fa !important;
}
/* Today highlight */
.rbc-day-bg.rbc-today {
    background-color: #e8f0fe !important;
}
/* Date cell content */
.rbc-date-cell {
    padding: 4px 8px !important;
    text-align: right !important;
}
.rbc-date-cell > a {
    font-size: 12px !important;
    font-weight: 500 !important;
    color: #3c4043 !important;
    pointer-events: none !important;
}
.rbc-date-cell.rbc-off-range > a {
    color: #c4c7c5 !important;
}
.rbc-date-cell.rbc-now > a {
    background-color: #1a73e8 !important;
    color: white !important;
    width: 24px !important;
    height: 24px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    border-radius: 50% !important;
}
.rbc-row-content {
    z-index: 1 !important;
}
.rbc-row-segment {
    padding: 0 2px 2px 2px !important;
}

/* Time View styling */
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

/* Mobile responsive */
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
    .rbc-date-cell {
        padding: 2px 4px !important;
    }
    .rbc-date-cell > a {
        font-size: 10px !important;
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
                title: occ.cover_rule?.school?.school_name || occ.cover_rule?.club?.club_name || 'Cover',
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

    // Group events by date for dynamic display in month view
    const eventsByDate = useMemo(() => {
        const grouped: Record<string, typeof calendarEvents> = {}
        calendarEvents.forEach(evt => {
            const dateKey = format(evt.start, 'yyyy-MM-dd')
            grouped[dateKey] ??= []
            grouped[dateKey].push(evt)
        })
        return grouped
    }, [calendarEvents])

    // Custom Day cell component for Month view - shows stacked events with overflow
    const CustomDateCellWrapper = (props: any) => {
        const { day } = props;
        
        // Validate that day is a valid Date object
        if (!day || !(day instanceof Date) || Number.isNaN(day.getTime())) {
            return <div className="h-full bg-white" />;
        }
        
        const dateKey = format(day, 'yyyy-MM-dd');
        const dayEvents = eventsByDate[dateKey] ?? [];
        const maxVisibleEvents = 3; // Show up to 3 events, then "+N more"
        const visibleEvents = dayEvents.slice(0, maxVisibleEvents);
        const moreCount = Math.max(0, dayEvents.length - maxVisibleEvents);

        return (
            <div className="h-full flex flex-col bg-white relative">
                <div className="flex-1 overflow-hidden p-1 space-y-0.5">
                    {visibleEvents.map((evt) => {
                        const occ = evt.resource
                        const colors = getSchoolColors(occ.cover_rule?.school?.school_name)
                        const teacher = occ.assignments?.[0]?.teacher;
                        const teacherInitials = teacher ? `${teacher.person_details.first_name[0]}${teacher.person_details.last_name[0]}` : null;

                        return (
                            <div
                                key={evt.id}
                                className="text-[8px] px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80 transition-opacity"
                                style={{
                                    backgroundColor: colors.bgHex,
                                    color: colors.textHex,
                                    borderLeft: `2px solid ${colors.borderHex}`,
                                }}
                                onClick={() => onSelectEvent(occ)}
                                title={`${evt.title} ${format(evt.displayStart, 'h:mm a')}`}
                            >
                                <span className="font-semibold">{evt.title}</span>
                                {teacherInitials && <span className="ml-1 opacity-75">({teacherInitials})</span>}
                            </div>
                        );
                    })}
                    {moreCount > 0 && (
                        <div className="text-[8px] text-gray-600 px-1 py-0.5 font-medium">
                            +{moreCount} more
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Custom Event Component for Week/Day view
    const WeekEventComponent = ({ event }: any) => {
        const occ = event.resource as CoverOccurrence;
        const teacher = occ.assignments?.[0]?.teacher;
        const teacherName = teacher
            ? `${teacher.person_details.first_name} ${teacher.person_details.last_name}`
            : 'Unassigned';
        const schoolName = occ.cover_rule?.school?.school_name || '';
        const clubName = occ.cover_rule?.club?.club_name || '';

        return (
            <div className="h-full w-full px-1.5 py-1">
                <div className="font-semibold text-xs mb-0.5">{event.title}</div>
                <div className="text-[10px] opacity-90">
                    {format(event.displayStart, 'h:mm a')} - {format(event.displayEnd, 'h:mm a')}
                </div>
                <div className="text-[10px] opacity-75 mt-0.5">{teacherName}</div>
                {schoolName && event.title !== schoolName && (
                    <div className="text-[10px] opacity-90 mt-0.5 font-medium">{schoolName}</div>
                )}
                {clubName && event.title !== clubName && (
                    <div className="text-[10px] opacity-60">{clubName}</div>
                )}
            </div>
        );
    };

    // Custom Event Component for Month view - shows compact event blocks
    const MonthEventComponent = ({ event }: any) => {
        const occ = event.resource as CoverOccurrence;
        const teacher = occ.assignments?.[0]?.teacher;
        const teacherInitials = teacher ? `${teacher.person_details.first_name[0]}${teacher.person_details.last_name[0]}` : null;
        const startTime = occ.cover_rule?.start_time || '';

        return (
            <div className="flex flex-col text-[10px] h-full w-full px-1 py-0.5">
                <div className="flex items-center justify-between gap-1">
                    <span className="truncate font-semibold text-[9px]">{event.title}</span>
                    {teacherInitials && (
                        <span className="bg-white/50 rounded px-0.5 font-bold text-[9px] whitespace-nowrap">
                            {teacherInitials}
                        </span>
                    )}
                </div>
                {startTime && (
                    <div className="text-[9px] opacity-70">{format(event.displayStart, 'h:mm a')}</div>
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
                onSelectSlot={(slotInfo: SlotInfo) => {
                    // Prevent clicking on gray areas (off-month days) in Month view
                    if (view === Views.MONTH) {
                        if (slotInfo.start.getMonth() !== date.getMonth()) return;
                    }
                    onSelectSlot?.(slotInfo.start);
                }}
                onDrillDown={(drillDate: Date) => {
                    // Prevent drilling down on gray areas (off-month days) in Month view
                    if (view === Views.MONTH) {
                        if (drillDate.getMonth() !== date.getMonth()) return;
                    }
                    onDrillDown?.(drillDate);
                }}
                onEventDrop={handleEventDrop}
                components={{
                    toolbar: CustomToolbar,
                    event: view === Views.MONTH ? MonthEventComponent : WeekEventComponent,
                    dateCellWrapper: view === Views.MONTH ? CustomDateCellWrapper : undefined
                }}
                eventPropGetter={(event: any) => {
                    const colors = getSchoolColors(event.resource.cover_rule?.school?.school_name);
                    return {
                        className: cn(
                            "cursor-grab active:cursor-grabbing hover:opacity-90 transition-opacity",
                            view === Views.MONTH ? "px-1.5 py-1 text-[9px]" : "px-0 py-0"
                        ),
                        style: {
                            backgroundColor: colors.bgHex,
                            color: colors.textHex,
                            borderColor: colors.borderHex,
                            borderRadius: '3px',
                            borderStyle: 'solid',
                            borderWidth: '1px',
                            borderLeftWidth: '3px',
                            margin: '1px 0',
                            marginBottom: '1px'
                        }
                    };
                }}
                onSelectEvent={(event: any) => onSelectEvent(event.resource)}
                formats={{
                    dayHeaderFormat: (d: Date) => format(d, 'EEE d'),
                    timeGutterFormat: (d: Date) => format(d, 'h a'),
                    eventTimeRangeFormat: () => '', // Hide default time range as we render it in the component
                }}
            />
        </div>
    );
}


