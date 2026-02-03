import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';


import type { CoverOccurrence } from '@/types/club.types';

import type { ViewType } from '@/features/covers/components/view-toggle';
import { useDeleteCoverOccurrence, useMoveCoverOccurrence } from '@/features/covers/api/mutations';
import { CalendarView } from '@/features/covers/components/calendar-view';
import { CoverQuickView } from '@/features/covers/components/cover-quick-view';
import { CoverQuickAdd } from '@/features/covers/components/cover-quick-add';
import { CoversListView } from '@/features/covers/components/covers-list-view';
import { ViewToggle } from '@/features/covers/components/view-toggle';
import { YearView } from '@/features/covers/components/year-view';

import { PageLayout } from '@/components/common/page-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { useCoverOccurrences } from '@/hooks/use-covers';
import { useSchools } from '@/hooks/use-schools';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/_protected/covers/')({
    component: CoversCalendarPage,
});

function CoversCalendarPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewType, setViewType] = useState<ViewType>('month');
    const [schoolId, setSchoolId] = useState('all');
    const [preselectedDate, setPreselectedDate] = useState<Date | null>(null);

    // Quick View & Edit State
    const [quickViewOpen, setQuickViewOpen] = useState(false);
    const [selectedOccurrence, setSelectedOccurrence] = useState<CoverOccurrence | null>(null);


    // Delete Confirmation State
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const [occurrenceToDelete, setOccurrenceToDelete] = useState<CoverOccurrence | null>(null);

    // Quick Add State
    const [quickAddOpen, setQuickAddOpen] = useState(false);

    const handleSelectSlot = (date: Date) => {
        setPreselectedDate(date);
        setQuickAddOpen(true);
    };


    const { data: schools } = useSchools();
    const { data: occurrences, isLoading } = useCoverOccurrences({ schoolId });
    const deleteOccurrence = useDeleteCoverOccurrence();
    const moveOccurrence = useMoveCoverOccurrence();

    const events = useMemo(() => occurrences || [], [occurrences]);

    const handleSelectOccurrence = (occurrence: CoverOccurrence) => {
        setSelectedOccurrence(occurrence);
        setQuickViewOpen(true);
    };

    const handleEventDrop = async (occurrence: CoverOccurrence, newDate: Date) => {
        const dateStr = format(newDate, 'yyyy-MM-dd');

        try {
            await moveOccurrence.mutateAsync({
                id: occurrence.id,
                newDate: dateStr
            });
            toast.success(`Moved cover to ${format(newDate, 'PPP')}`);
        } catch (error) {
            console.error("Failed to move cover", error);
            toast.error("Failed to move cover session");
        }
    };

    const handleEditFromQuickView = (occurrence: CoverOccurrence) => {
        setQuickViewOpen(false);
        setSelectedOccurrence(occurrence);
        setQuickAddOpen(true);
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


                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 flex gap-4 min-h-0">
                        <Card className="flex-1 border-gray-200 overflow-hidden flex flex-col">
                            <CardContent className="p-0 h-full">
                                <div className={cn(
                                    "h-full overflow-auto",
                                    (viewType === 'schedule' || viewType === 'year') ? "p-0" : "p-0"
                                )}>
                                    {/* Calendar Views */}
                                    {(viewType === 'day' || viewType === 'week' || viewType === 'month' || viewType === '4days') && (
                                        <CalendarView
                                            events={events}
                                            onSelectEvent={(occ) => handleSelectOccurrence(occ)}
                                            onSelectSlot={handleSelectSlot}
                                            onDrillDown={handleSelectSlot}
                                            onEventDrop={handleEventDrop}
                                            viewMode={viewType}
                                            onViewChange={setViewType}
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
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </PageLayout>

            <CoverQuickAdd
                open={quickAddOpen}
                onOpenChange={(open) => {
                    setQuickAddOpen(open);
                    if (!open) setSelectedOccurrence(null);
                }}
                date={preselectedDate || selectedDate}
                initialSchoolId={schoolId}
                editingOccurrence={selectedOccurrence}
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
