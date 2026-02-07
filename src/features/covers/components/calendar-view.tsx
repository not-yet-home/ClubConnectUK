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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
    PopoverClose,
} from "@/components/ui/popover";
import { X } from 'lucide-react';

const withDragAndDrop: any = (withDragAndDropAcccent as any).default || withDragAndDropAcccent;
const DragAndDropCalendar = withDragAndDrop(Calendar as any);

const rbcStyleOverrides = `
.rbc-calendar {
    font-family: inherit;
    background: #fff;
}

/* Day/Month Header styling */
.rbc-header {
    border-bottom: 1px solid #e5e7eb !important;
    border-left: 1px solid #e5e7eb !important;
    padding: 10px 0 !important;
    font-weight: 600 !important;
    font-size: 11px !important;
    text-transform: uppercase !important;
    letter-spacing: 0.8px !important;
    color: #5f6368 !important;
}

.rbc-header:first-child {
    border-left: none !important;
}

/* Event styling */
.rbc-event {
    min-height: 32px !important;
    margin: 2px 4px !important;
    padding: 0 !important;
    border: none !important;
    background-color: transparent !important;
    box-shadow: none !important;
}
.rbc-event:focus {
    outline: none !important;
}

.rbc-event-content {
    font-size: 0.75rem;
    height: 100%;
}

.rbc-event-label {
    display: none !important;
}

/* Month View styling */
.rbc-month-view {
    border: 1px solid #e5e7eb !important;
    border-radius: 8px !important;
    overflow: auto !important;
}

.rbc-month-row {
    border-top: 1px solid #e5e7eb !important;
}

.rbc-day-bg {
    border-left: 1px solid #e5e7eb !important;
    transition: background-color 0.1s ease;
}

.rbc-day-bg:first-child {
    border-left: none !important;
}

.rbc-day-bg.rbc-today {
    background-color: transparent !important;
}

.rbc-off-range-bg {
    background-color: #f8f9fa !important;
}

/* Date cell numbering */
.rbc-date-cell {
    padding: 6px 8px !important;
    text-align: center !important;
}

.rbc-date-cell > a {
    font-size: 12px !important;
    font-weight: 500 !important;
    color: #3c4043 !important;
    width: 24px !important;
    height: 24px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    border-radius: 50% !important;
    transition: background-color 0.2s;
}

.rbc-date-cell.rbc-now > a {
    background-color: #1a73e8 !important;
    color: white !important;
}

.rbc-date-cell.rbc-off-range > a {
    color: #c4c7c5 !important;
}

/* More +N link */
.rbc-show-more {
    font-size: 11px !important;
    font-weight: 700 !important;
    color: #1a73e8 !important;
    padding: 3px 8px !important;
    margin: 2px 4px !important;
    background: rgba(26, 115, 232, 0.05) !important;
    border-radius: 4px !important;
    text-decoration: none !important;
    display: inline-block !important;
    transition: all 0.2s ease !important;
}
.rbc-show-more:hover {
    background: rgba(26, 115, 232, 0.12) !important;
    color: #174ea6 !important;
}

/* Popover styling */
.rbc-overlay {
    border-radius: 8px !important;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
    border: 1px solid #e5e7eb !important;
    padding: 8px !important;
    z-index: 100 !important;
}

.rbc-overlay-header {
    border-bottom: 1px solid #f1f3f4 !important;
    margin-bottom: 8px !important;
    padding-bottom: 4px !important;
    font-weight: 600 !important;
    color: #3c4043 !important;
    font-size: 14px !important;
}

/* Time View styling */
.rbc-time-view {
    border: 1px solid #e5e7eb !important;
    border-radius: 8px !important;
}

.rbc-time-header-content {
    border-left: 1px solid #e5e7eb !important;
}

.rbc-time-gutter .rbc-timeslot-group {
    border-bottom: none !important;
    font-size: 11px !important;
    color: #70757a !important;
}

.rbc-timeslot-group {
    min-height: 48px !important;
    border-bottom: 1px solid #e5e7eb !important;
}

.rbc-day-slot .rbc-timeslot-group {
    border-left: 1px solid #e5e7eb !important;
}

/* Mobile responsive tweaks */
@media (max-width: 640px) {
    .rbc-header {
        padding: 8px 0 !important;
        font-size: 10px !important;
    }
    .rbc-date-cell {
        padding: 4px !important;
    }
    .rbc-date-cell > a {
        font-size: 11px !important;
        width: 20px !important;
        height: 20px !important;
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
            //case 'year': return Views.MONTH; // Placeholder as RBC has no year view
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
    const [draggedOutsideEvent, setDraggedOutsideEvent] = useState<any>(null);

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
                title: occ.cover_rule?.club?.club_name || occ.cover_rule?.school?.school_name || 'Cover',
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



    // Custom Day cell component for Month view - shows stacked events with overflow
    const CustomDateCellWrapper = (props: any) => {
        const { children } = props;
        return (
            <div className="h-full flex flex-col bg-white">
                {children}
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
        const colors = getSchoolColors(schoolName);

        return (
            <div
                className="h-full w-full px-2 py-1.5 border-l-4 rounded-r shadow-sm overflow-hidden"
                style={{
                    backgroundColor: colors.bgHex,
                    color: colors.textHex,
                    borderLeftColor: colors.borderHex,
                }}
            >
                <div className="font-bold text-xs truncate leading-tight">{clubName || event.title}</div>
                {schoolName && (
                    <div className="text-[10px] opacity-90 mt-1 font-semibold truncate">{schoolName}</div>
                )}
                <div className="text-[10px] opacity-80 mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                    <span className="truncate">{teacherName}</span>
                </div>
            </div>
        );
    };

    // Custom Event Component for Month view - shows compact event blocks
    const MonthEventComponent = ({ event }: any) => {
        const occ = event.resource as CoverOccurrence;
        const teacher = occ.assignments?.[0]?.teacher;
        const teacherInitials = teacher ? `${teacher.person_details.first_name[0]}${teacher.person_details.last_name[0]}` : null;
        const schoolName = occ.cover_rule?.school?.school_name || '';
        const clubName = occ.cover_rule?.club?.club_name || '';
        const colors = getSchoolColors(schoolName);

        return (
            <div
                className="flex flex-col text-[10px] w-full px-2 py-1.5 rounded border-l-2 shadow-sm"
                style={{
                    backgroundColor: colors.bgHex,
                    color: colors.textHex,
                    borderLeftColor: colors.borderHex,
                }}
            >
                <div className="flex items-center justify-between gap-1 overflow-hidden">
                    <span className="truncate font-bold text-[10.5px] leading-tight">{clubName || event.title}</span>
                    {teacherInitials && (
                        <span className="bg-black/10 rounded px-1 font-bold text-[8px] whitespace-nowrap opacity-70">
                            {teacherInitials}
                        </span>
                    )}
                </div>
                {schoolName && (
                    <div className="text-[9.5px] opacity-80 truncate leading-tight mt-1">{schoolName}</div>
                )}
            </div>
        );
    };

    // Custom Show More component using Radix Popover for better "open/close" behavior
    const CustomShowMore = ({ events: dayEvents, label, slotMetrics }: any) => {
        return (
            <Popover>
                <PopoverTrigger asChild>
                    <button
                        className="rbc-show-more focus:outline-none w-full text-left"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {label || `+${dayEvents.length - 1} more`}
                    </button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-72 p-0 shadow-2xl border border-border overflow-hidden rounded-xl z-50 bg-white"
                    align="center"
                    sideOffset={5}
                >
                    <div className="bg-muted/50 px-3 py-2 border-b flex items-center justify-between">
                        <span className="font-semibold text-sm text-foreground/80">
                            {format(slotMetrics?.date || dayEvents?.[0]?.start || new Date(), 'EEEE, MMM d')}
                        </span>
                        <PopoverClose asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-black/5">
                                <X className="h-3 w-3" />
                            </Button>
                        </PopoverClose>
                    </div>
                    <div className="p-2 space-y-1.5 max-h-[300px] overflow-y-auto">
                        {dayEvents.map((event: any, idx: number) => (
                            <div
                                key={event.id || idx}
                                draggable
                                onDragStart={() => {
                                    setDraggedOutsideEvent(event);
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectEvent(event.resource);
                                }}
                                className="cursor-pointer"
                            >
                                <MonthEventComponent event={event} />
                            </div>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
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
                max={set(new Date(), { hours: 22, minutes: 0 })} // 10 PM
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
                onDropFromOutside={({ start }: any) => {
                    if (draggedOutsideEvent) {
                        handleEventDrop({ event: draggedOutsideEvent, start });
                        setDraggedOutsideEvent(null);
                    }
                }}
                components={{
                    toolbar: CustomToolbar,
                    event: view === Views.MONTH ? MonthEventComponent : WeekEventComponent,
                    dateCellWrapper: CustomDateCellWrapper,
                    showMore: CustomShowMore
                }}
                eventPropGetter={() => {
                    return {
                        className: cn(
                            "cursor-grab active:cursor-grabbing hover:opacity-90 transition-opacity",
                            view === Views.MONTH ? "month-event" : "week-event"
                        ),
                        style: {
                            // Basic style reset as we handle colors in components
                            border: 'none',
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


