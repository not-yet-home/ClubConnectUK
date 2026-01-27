
import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon } from '@hugeicons/core-free-icons';
import { Menu } from 'lucide-react';
import type { CoverOccurrence } from '@/types/club.types';
import { CalendarView } from '@/features/covers/components/calendar-view';
import { UpcomingCoversList } from '@/features/covers/components/upcoming-covers-list';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

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

    // Delete Confirmation State
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const [occurrenceToDelete, setOccurrenceToDelete] = useState<CoverOccurrence | null>(null);


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

    const handleDeleteFromQuickView = (occurrence: CoverOccurrence) => {
        setOccurrenceToDelete(occurrence);
        setDeleteConfirmationOpen(true);
    };

    const confirmDelete = async () => {
        if (!occurrenceToDelete) return;

        try {
            await deleteOccurrence.mutateAsync(occurrenceToDelete.id);
            toast.success("Cover session deleted");
            setDeleteConfirmationOpen(false);
            setOccurrenceToDelete(null);
            setQuickViewOpen(false);
        } catch (error) {
            console.error("Failed to delete", error);
            toast.error("Failed to delete cover session");
        }
    };


    return (
        <>
            <PageLayout breadcrumbs={[{ label: 'Covers Scheduling' }]} className="p-3 sm:p-6">
                <div className="h-[calc(100vh-120px)] flex flex-col">
                    {/* Header Toolbar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 sm:gap-4 px-1 sm:px-0">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            {/* Mobile Menu Toggle for Mini Calendar */}
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="icon" className="lg:hidden h-9 w-9">
                                        <Menu className="h-4 w-4" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-[280px] sm:w-[320px]">
                                    <div className="mt-6 h-[500px]">
                                        <UpcomingCoversList
                                            occurrences={events}
                                            onSelectOccurrence={handleSelectOccurrence}
                                        />
                                    </div>
                                </SheetContent>
                            </Sheet>

                            {/* School Filter */}
                            <div className="flex items-center gap-2">
                                <Label className="text-sm font-medium text-muted-foreground whitespace-nowrap hidden lg:block">
                                    School:
                                </Label>
                                <Select value={schoolId} onValueChange={setSchoolId}>
                                    <SelectTrigger className="w-full sm:w-[180px] h-9">
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
                            <div className="flex-shrink-0">
                                <ViewToggle value={viewType} onChange={setViewType} />
                            </div>
                        </div>

                        {/* New Request Button */}
                        <Button
                            onClick={() => setRequestSheetOpen(true)}
                            size="sm"
                            className="w-full sm:w-auto mt-1 sm:mt-0 h-9"
                        >
                            <HugeiconsIcon icon={Add01Icon} className="h-4 w-4 mr-1.5" />
                            <span>New Request</span>
                        </Button>
                    </div>

                    {/* Main Content Area */}
                    <Card className="flex-1 border-gray-200 overflow-hidden">
                        <CardContent className="p-0 h-full">
                            <div className="flex h-full">
                                {/* Left Sidebar - Upcoming Covers List (Desktop Only) */}
                                <div className="hidden lg:block w-72 border-r border-gray-200 p-4 bg-gray-50/50">
                                    <UpcomingCoversList
                                        occurrences={events}
                                        onSelectOccurrence={handleSelectOccurrence}
                                    />
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
            />

            <Dialog open={deleteConfirmationOpen} onOpenChange={setDeleteConfirmationOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Cover Session?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete the cover session for <span className="font-medium text-foreground">{occurrenceToDelete?.cover_rule?.club?.club_name}</span>.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setDeleteConfirmationOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete} disabled={deleteOccurrence.isPending}>
                            {deleteOccurrence.isPending ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
