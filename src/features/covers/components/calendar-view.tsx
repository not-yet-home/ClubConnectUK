import { useCallback, useEffect, useMemo, useState } from 'react';
import { Calendar, Views, dateFnsLocalizer } from 'react-big-calendar';
import withDragAndDropAcccent from 'react-big-calendar/lib/addons/dragAndDrop';
import { addHours, format, getDay, parse, set, startOfWeek } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import '../styles/calendar-overrides.css';

import { getSchoolColors, parseLocalDate } from '../utils/formatters';
import type { SlotInfo, View } from 'react-big-calendar';
import type { ViewType } from '@/features/covers/components/view-toggle';
import type { CoverOccurrence } from '@/types/club.types';
import type {
    CalendarEvent,
    DateCellWrapperProps,
    DropFromOutsideInfo,
    EventComponentProps,
    EventDropInfo,
    ShowMoreProps,
} from '@/types/calendar.types';
import { ICON_SIZES } from '@/constants/sizes';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    Popover,
    PopoverClose,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

// Note: Type assertions to 'any' are required here due to react-big-calendar's 
// drag-and-drop addon having incomplete/incompatible TypeScript definitions.
// The addon may export as default or named export depending on bundler configuration.
const withDragAndDrop: any = (withDragAndDropAcccent as any).default || withDragAndDropAcccent;
 
const DragAndDropCalendar = withDragAndDrop(Calendar as any);

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

const getCalendarView = (mode: ViewType): View => {
    switch (mode) {
        case 'day': return Views.DAY;
        case 'week': return Views.WEEK;
        case 'month': return Views.MONTH;
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

interface CalendarViewProps {
    events: Array<CoverOccurrence>;
    onSelectEvent: (event: CoverOccurrence) => void;
    onSelectSlot?: (date: Date) => void;
    onDrillDown?: (date: Date) => void;
    onEventDrop?: (event: CoverOccurrence, newDate: Date) => void;
    viewMode?: ViewType;
    date: Date;
    onNavigate: (date: Date) => void;
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
    const [view, setView] = useState<View>(() => {
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
        if ((viewMode === 'week' || viewMode === 'month') && isMobile) return Views.DAY;
        return getCalendarView(viewMode);
    });

    const [draggedOutsideEvent, setDraggedOutsideEvent] = useState<CalendarEvent | null>(null);

    const date = controlledDate;
    const handleNavigate = (newDate: Date) => {
        onControlledNavigate(newDate);
    };

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

    const handleViewChange = useCallback((newView: View) => {
        setView(newView);
        if (onViewChange) {
            onViewChange(getViewTypeFromRBC(newView));
        }
    }, [onViewChange]);

    useEffect(() => {
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
        if ((viewMode === 'week' || viewMode === 'month') && isMobile && onViewChange) {
            onViewChange('day');
        }
    }, [viewMode, onViewChange]);



    const calendarEvents = useMemo((): Array<CalendarEvent> => {
        return events.map(occ => {
            const meetingDate = parseLocalDate(occ.meeting_date);

            let start = new Date(meetingDate);
            let end = new Date(meetingDate);
            let displayEnd = new Date(meetingDate);

            if (occ.cover_rule) {
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

    const handleEventDrop = (info: EventDropInfo) => {
        if (onEventDrop) {
            onEventDrop(info.event.resource, info.start);
        }
    };



    // Custom Day cell component for Month view - shows stacked events with overflow
    const CustomDateCellWrapper = (props: DateCellWrapperProps) => {
        const { children } = props;
        return (
            <div className="h-full flex flex-col bg-white">
                {children}
            </div>
        );
    };

    // Custom Event Component for Week/Day view
    const WeekEventComponent = ({ event }: EventComponentProps) => {
        const occ = event.resource;
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
    const MonthEventComponent = ({ event }: EventComponentProps) => {
        const occ = event.resource;
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
    const CustomShowMore = ({ events: dayEvents, label, slotMetrics }: ShowMoreProps) => {
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
                            {format(slotMetrics?.date || (dayEvents.length > 0 ? dayEvents[0].start : new Date()), 'EEEE, MMM d')}
                        </span>
                        <PopoverClose asChild>
                            <Button variant="ghost" size="icon-xs" className="rounded-full hover:bg-black/5">
                                <HugeiconsIcon icon={Cancel01Icon} className={ICON_SIZES.xs} />
                            </Button>
                        </PopoverClose>
                    </div>
                    <div className="p-2 space-y-1.5 max-h-[300px] overflow-y-auto">
                        {dayEvents.map((event: CalendarEvent, idx: number) => (
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
            <DragAndDropCalendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                toolbar={false}
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
                onDropFromOutside={(info: DropFromOutsideInfo) => {
                    if (draggedOutsideEvent) {
                        handleEventDrop({ event: draggedOutsideEvent, start: info.start });
                        setDraggedOutsideEvent(null);
                    }
                }}
                components={{
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
                            border: 'none',
                        }
                    };
                }}
                onSelectEvent={(event: CalendarEvent) => onSelectEvent(event.resource)}
                formats={{
                    dayHeaderFormat: (d: Date) => format(d, 'EEE d'),
                    timeGutterFormat: (d: Date) => format(d, 'h a'),
                    eventTimeRangeFormat: () => '', // Hide default time range as we render it in the component
                }}
            />
        </div>
    );
}
