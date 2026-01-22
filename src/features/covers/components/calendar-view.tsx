
import { useMemo, useState } from 'react';
import { Calendar, Views, dateFnsLocalizer } from 'react-big-calendar';
import { format, getDay, parse, startOfWeek } from 'date-fns';
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
}

export function CalendarView({ events, onSelectEvent }: CalendarViewProps) {
    const [view, setView] = useState<View>(Views.MONTH);
    const [date, setDate] = useState(new Date());

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

        const label = () => {
            return (
                <span className="text-xl font-bold text-gray-900">
                    {format(toolbar.date, 'MMMM yyyy')}
                </span>
            );
        };

        return (
            <div className="flex items-center justify-between mb-4 p-2">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={goToBack}><ChevronLeft className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={goToNext}><ChevronRight className="h-4 w-4" /></Button>
                    </div>
                    {label()}
                    <Button variant="outline" size="sm" onClick={goToToday}>Today</Button>
                </div>
            </div>
        );
    };

    // Transform CoverOccurrence to Calendar Event
    const calendarEvents = useMemo(() => {
        return events.map(occ => {
            const start = new Date(occ.meeting_date);
            // Default to provided start time in rule, or assume 1 hour if parsed failing
            // We really should parse the rule time properly, but for mock display we'll trust rule
            // In real app, `meeting_date` is TIMESTAMPTZ so it has time. 
            // But `cover_rule` has `start_time` and `end_time` separately as TIME.
            // For the mock data, `meeting_date` has the time set.

            let end = new Date(start);
            if (occ.cover_rule) {
                // Basic parsing 'HH:mm:ss'
                const [startH, startM] = occ.cover_rule.start_time.split(':').map(Number);
                const [endH, endM] = occ.cover_rule.end_time.split(':').map(Number);
                // Reset start based on rule time? No, meeting_date is truth.
                // Calculate duration
                const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
                end = addMinutes(start, durationMinutes);
            } else {
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

    // Custom Event Component
    const EventComponent = ({ event }: any) => {
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
        )
    }

    return (
        <div className="h-full bg-white rounded-lg border border-gray-100 overflow-hidden">
            <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }} // Fill parent container
                view={view}
                onView={setView}
                date={date}
                onNavigate={setDate}
                components={{
                    toolbar: CustomToolbar,
                    event: EventComponent
                }}
                eventPropGetter={(event: any) => {
                    return {
                        className: cn("rounded-md border-l-4 border-l-transparent px-2 py-1 text-xs shadow-sm cursor-pointer hover:opacity-90 transition-opacity", event.className)
                    }
                }}
                onSelectEvent={(event: any) => onSelectEvent(event.resource)}
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

function addMinutes(date: Date, minutes: number) {
    return new Date(date.getTime() + minutes * 60000);
}
