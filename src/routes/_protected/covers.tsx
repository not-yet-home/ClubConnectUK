
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon } from '@hugeicons/core-free-icons';
import { Menu } from 'lucide-react';
import type { CoverOccurrence } from '@/types/club.types';
import { CalendarView } from '@/features/covers/components/calendar-view';
import { MiniCalendar } from '@/features/covers/components/mini-calendar';
import { ViewToggle, type ViewType } from '@/features/covers/components/view-toggle';
import { CoversListView } from '@/features/covers/components/covers-list-view';
import { YearView } from '@/features/covers/components/year-view';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PageLayout } from '@/components/common/page-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { CoverRequestSheet } from '@/features/covers/components/cover-request-sheet';
import { CoverQuickView } from '@/features/covers/components/cover-quick-view';
import { useDeleteCoverOccurrence } from '@/features/covers/api/mutations';
import { toast } from 'sonner';

import { useCoverOccurrences } from '@/hooks/use-covers';
import { useSchools } from '@/hooks/use-schools';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/_protected/covers')({
    component: CoversCalendarPage,
});

function CoversCalendarPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewType, setViewType] = useState<ViewType>('week');
    const [schoolId, setSchoolId] = useState('all');
    const [requestSheetOpen, setRequestSheetOpen] = useState(false);

    // Quick View & Edit State
    const [quickViewOpen, setQuickViewOpen] = useState(false);
    const [selectedOccurrence, setSelectedOccurrence] = useState<CoverOccurrence | null>(null);
    const [editingBoxOpen, setEditingBoxOpen] = useState(false);

    const navigate = useNavigate();

    const { data: schools } = useSchools();
    const { data: occurrences, isLoading } = useCoverOccurrences({ schoolId });
    const deleteOccurrence = useDeleteCoverOccurrence();

    const events = useMemo(() => occurrences || [], [occurrences]);

    const handleSelectOccurrence = (occurrence: CoverOccurrence) => {
        setSelectedOccurrence(occurrence);
        setQuickViewOpen(true);
    };

    const handleEditFromQuickView = (occurrence: CoverOccurrence) => {
        setQuickViewOpen(false);
        // Small delay to allow dialog to close smoothly
        setTimeout(() => {
            setSelectedOccurrence(occurrence);
            setEditingBoxOpen(true);
        }, 100);
    };

    const handleDeleteFromQuickView = async (occurrence: CoverOccurrence) => {
        if (!window.confirm("Are you sure you want to delete this cover session?")) return;

        try {
            await deleteOccurrence.mutateAsync(occurrence.id);
            toast.success("Cover session deleted");
            setQuickViewOpen(false);
        } catch (error) {
            console.error("Failed to delete", error);
            toast.error("Failed to delete cover session");
        }
    };

    const handleViewDetails = (occurrence: CoverOccurrence) => {
        setQuickViewOpen(false);
        navigate({ to: `/covers/${occurrence.id}` });
    };

    return (
        <>
            <PageLayout breadcrumbs={[{ label: 'Covers Scheduling' }]}>
                <div className="h-[calc(100vh-120px)] flex flex-col">
                    {/* Header Toolbar */}
                    <div className="flex items-center justify-between mb-4 gap-4">
                        <div className="flex items-center gap-3">
                            {/* Mobile Menu Toggle for Mini Calendar */}
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="icon" className="lg:hidden">
                                        <Menu className="h-4 w-4" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-[280px] sm:w-[320px]">
                                    <div className="mt-6">
                                        <MiniCalendar
                                            selectedDate={selectedDate}
                                            onSelectDate={setSelectedDate}
                                            occurrences={events}
                                        />
                                    </div>
                                </SheetContent>
                            </Sheet>

                            {/* School Filter */}
                            <div className="flex items-center gap-2">
                                <Label className="text-sm font-medium text-muted-foreground whitespace-nowrap hidden sm:block">
                                    School:
                                </Label>
                                <Select value={schoolId} onValueChange={setSchoolId}>
                                    <SelectTrigger className="w-[180px] h-9">
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

                            {/* View Toggle */}
                            <ViewToggle value={viewType} onChange={setViewType} />
                        </div>

                        {/* New Request Button */}
                        <Button onClick={() => setRequestSheetOpen(true)} size="sm">
                            <HugeiconsIcon icon={Add01Icon} className="h-4 w-4 mr-1.5" />
                            <span className="hidden sm:inline">New Request</span>
                            <span className="sm:hidden">New</span>
                        </Button>
                    </div>

                    {/* Main Content Area */}
                    <Card className="flex-1 border-gray-200 overflow-hidden">
                        <CardContent className="p-0 h-full">
                            <div className="flex h-full">
                                {/* Left Sidebar - Mini Calendar (Desktop Only) */}
                                <div className="hidden lg:block w-64 border-r border-gray-200 p-4 bg-gray-50/50">
                                    <MiniCalendar
                                        selectedDate={selectedDate}
                                        onSelectDate={setSelectedDate}
                                        occurrences={events}
                                    />

                                    {/* Additional Sidebar Content */}
                                    <div className="mt-6">
                                        <h3 className="text-sm font-semibold text-gray-900 mb-3">My Calendars</h3>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                                <input type="checkbox" defaultChecked className="rounded" />
                                                <span>All Schools</span>
                                            </label>
                                            {schools?.slice(0, 3).map((school) => (
                                                <label key={school.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                                    <input type="checkbox" className="rounded" />
                                                    <span className="truncate">{school.school_name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Main Calendar/List Area */}
                                <div className={cn(
                                    "flex-1 overflow-auto",
                                    (viewType === 'schedule' || viewType === 'year') ? "p-0" : "p-0"
                                )}>
                                    {/* Calendar Views */}
                                    {(viewType === 'day' || viewType === 'week' || viewType === 'month' || viewType === '4days') && (
                                        <CalendarView
                                            events={events}
                                            onSelectEvent={(occ) => handleSelectOccurrence(occ)}
                                            viewMode={viewType}
                                            date={selectedDate}
                                            onNavigate={setSelectedDate}
                                        />
                                    )}

                                    {/* Schedule (Agenda) View */}
                                    {viewType === 'schedule' && (
                                        <div className="p-6">
                                            <CoversListView
                                                occurrences={events}
                                                onSelectOccurrence={handleSelectOccurrence}
                                            />
                                        </div>
                                    )}

                                    {/* Year View */}
                                    {viewType === 'year' && (
                                        <YearView
                                            occurrences={events}
                                            selectedYear={selectedDate.getFullYear()}
                                            onSelectMonth={(month) => {
                                                const newDate = new Date(selectedDate)
                                                newDate.setMonth(month)
                                                setSelectedDate(newDate)
                                                setViewType('month')
                                            }}
                                        />
                                    )}

                                    {isLoading && (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="text-center">
                                                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                                                <p className="text-sm text-gray-500">Loading covers...</p>
                                            </div>
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

            {/* Edit Sheet (reusing same component) */}
            <CoverRequestSheet
                open={editingBoxOpen}
                onOpenChange={setEditingBoxOpen}
                existingData={selectedOccurrence}
            />

            {/* Quick View Dialog */}
            <CoverQuickView
                open={quickViewOpen}
                onOpenChange={setQuickViewOpen}
                occurrence={selectedOccurrence}
                onEdit={handleEditFromQuickView}
                onDelete={handleDeleteFromQuickView}
                onViewDetails={handleViewDetails}
            />
        </>
    );
}
