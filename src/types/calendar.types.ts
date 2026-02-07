import type { CoverOccurrence } from './club.types';

/**
 * Calendar event representation for react-big-calendar
 * Wraps CoverOccurrence with display properties
 */
export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    displayStart: Date;
    displayEnd: Date;
    resource: CoverOccurrence;
}

/**
 * Event drop info from react-big-calendar drag-and-drop
 */
export interface EventDropInfo {
    event: CalendarEvent;
    start: Date;
    end?: Date;
}

/**
 * Drop from outside the calendar (e.g., from popover)
 */
export interface DropFromOutsideInfo {
    start: Date;
    end?: Date;
    allDay?: boolean;
}

/**
 * Slot metrics for "show more" popover
 */
export interface SlotMetrics {
    date: Date;
}

/**
 * Props for custom "show more" component
 */
export interface ShowMoreProps {
    events: Array<CalendarEvent>;
    label?: string;
    slotMetrics?: SlotMetrics;
}

/**
 * Props for custom event rendering components
 */
export interface EventComponentProps {
    event: CalendarEvent;
}

/**
 * Props for date cell wrapper component
 */
export interface DateCellWrapperProps {
    children: React.ReactNode;
    value: Date;
}
