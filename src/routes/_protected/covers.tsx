
import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { CalendarView } from '@/features/covers/components/calendar-view';
import { EventDetailsPanel } from '@/features/covers/components/event-details-panel';
import { generateMockCovers } from '@/features/covers/utils/mock-data';
import { CoverOccurrence } from '@/types/club.types';
import { Button } from '@/components/ui/button';
import { Filter, ChevronDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export const Route = createFileRoute('/_protected/covers')({
    component: CoversCalendarPage,
});

function CoversCalendarPage() {
    const [selectedEvent, setSelectedEvent] = useState<CoverOccurrence | null>(null);

    // Memoize mock data generation to avoid regeneration on every render
    const events = useMemo(() => generateMockCovers(new Date()), []);

    return (
        <div className="flex h-[calc(100vh-26px)] rounded-md overflow-hidden">
            {/* Main Content Area - Calendar */}
            <div className="flex-1 flex flex-col min-w-0 bg-gray-50/50">

                {/* Filters Header */}
                <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm z-10">
                    <div className="flex items-center gap-6">
                        <Button variant="outline" className="flex items-center gap-2 text-gray-700">
                            <Filter className="w-4 h-4" />
                            <span>All Schools</span>
                            <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
                        </Button>

                        <div className="flex items-center space-x-2">
                            <Checkbox id="show-availability" />
                            <Label htmlFor="show-availability" className="text-gray-600 font-medium">Show Teacher Availability</Label>
                        </div>
                    </div>

                    <div>
                        {/* Right side actions if needed */}
                        <Button>New Cover Request</Button>
                    </div>
                </div>

                {/* Scrollable Calendar Area */}
                <div className="flex-1 p-6 overflow-hidden">
                    <CalendarView
                        events={events}
                        onSelectEvent={setSelectedEvent}
                    />
                </div>
            </div>

            {/* Side Panel - Details */}
            {selectedEvent && (
                <div className="shrink-0 h-full border-l animate-in slide-in-from-right-5 duration-300">
                    <EventDetailsPanel
                        occurrence={selectedEvent}
                        onClose={() => setSelectedEvent(null)}
                    />
                </div>
            )}
        </div>
    );
}
