
import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { CalendarView } from '@/features/covers/components/calendar-view';
import { EventDetailsPanel } from '@/features/covers/components/event-details-panel';
import { CoverOccurrence } from '@/types/club.types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { PageLayout } from '@/components/common/page-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTableToolbar, DataTableToolbarLeft, DataTableToolbarRight } from '@/components/ui/data-table-components';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon } from '@hugeicons/core-free-icons';
import { ICON_SIZES } from '@/constants/sizes';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { CoverRequestSheet } from '@/features/covers/components/cover-request-sheet';

import { useCoverOccurrences } from '@/hooks/use-covers';
import { useSchools } from '@/hooks/use-schools';

export const Route = createFileRoute('/_protected/covers')({
    component: CoversCalendarPage,
});

function CoversCalendarPage() {
    const [selectedEvent, setSelectedEvent] = useState<CoverOccurrence | null>(null);
    const [schoolId, setSchoolId] = useState('all');
    const [requestSheetOpen, setRequestSheetOpen] = useState(false);

    const { data: schools } = useSchools();
    const { data: occurrences, isLoading } = useCoverOccurrences({ schoolId });

    // Fallback to empty array if still loading or error
    const events = useMemo(() => occurrences || [], [occurrences]);

    return (
        <>
            <PageLayout breadcrumbs={[{ label: 'Covers Scheduling' }]}>
                <div className="mx-auto space-y-6">
                    <Card className="border-none shadow-none bg-transparent">
                        <CardHeader className="flex flex-row justify-between items-center px-0 pt-0">
                            <section className="flex flex-col gap-2">
                                <CardTitle>Covers Scheduling</CardTitle>
                                <CardDescription>
                                    Manage and monitor club cover assignments and teacher availability
                                </CardDescription>
                            </section>
                            <section>
                                <Button onClick={() => setRequestSheetOpen(true)}>
                                    <HugeiconsIcon icon={Add01Icon} className={ICON_SIZES.lg} />
                                    New Cover Request
                                </Button>
                            </section>
                        </CardHeader>
                        <CardContent className="px-0">
                            <div className="flex flex-col gap-4">
                                <DataTableToolbar className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                                    <DataTableToolbarLeft>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <Label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Filter by School:</Label>
                                                <Select value={schoolId} onValueChange={setSchoolId}>
                                                    <SelectTrigger className="w-[200px] h-9">
                                                        <SelectValue placeholder="All Schools" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Schools</SelectItem>
                                                        {schools?.map((school) => (
                                                            <SelectItem key={school.id} value={school.id}>
                                                                {school.school_name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100">
                                                <Checkbox id="show-availability" />
                                                <Label htmlFor="show-availability" className="text-sm font-medium cursor-pointer">Show Teacher Availability</Label>
                                            </div>
                                        </div>
                                    </DataTableToolbarLeft>
                                    <DataTableToolbarRight>
                                        {/* Additional actions can go here */}
                                    </DataTableToolbarRight>
                                </DataTableToolbar>

                                <div className="flex h-[calc(100vh-320px)] min-h-[600px] gap-6">
                                    {/* Calendar Area */}
                                    <div className="flex-1 min-w-0">
                                        <CalendarView
                                            events={events}
                                            onSelectEvent={setSelectedEvent}
                                        />
                                    </div>

                                    {/* Side Panel - Details */}
                                    {selectedEvent && (
                                        <div className="w-80 shrink-0 h-full border rounded-lg bg-white overflow-hidden animate-in slide-in-from-right-5 duration-300 shadow-sm">
                                            <EventDetailsPanel
                                                occurrence={selectedEvent}
                                                onClose={() => setSelectedEvent(null)}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </PageLayout>

            <CoverRequestSheet
                open={requestSheetOpen}
                onOpenChange={setRequestSheetOpen}
            />
        </>
    );
}
