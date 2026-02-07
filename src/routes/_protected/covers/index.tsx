import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons'
import type { ViewType } from '@/features/covers/components/view-toggle'
import type { CoverOccurrence } from '@/types/club.types'
import { ICON_SIZES } from '@/constants/sizes'
import {
  useDeleteCoverOccurrence,
  useMoveCoverOccurrence,
} from '@/features/covers/api/mutations'
import { CalendarView } from '@/features/covers/components/calendar-view'
import { CoverQuickView } from '@/features/covers/components/cover-quick-view'
import { CoverQuickAdd } from '@/features/covers/components/cover-quick-add'
import { CoversListView } from '@/features/covers/components/covers-list-view'
import { ViewToggle } from '@/features/covers/components/view-toggle'
import { YearView } from '@/features/covers/components/year-view'

import { PageLayout } from '@/components/common/page-layout'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useCoverOccurrences } from '@/hooks/use-covers'
import { useSchools } from '@/hooks/use-schools'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_protected/covers/')({
  component: CoversCalendarPage,
})

function CoversCalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewType, setViewType] = useState<ViewType>('month')
  const [schoolId, setSchoolId] = useState('all')
  const [preselectedDate, setPreselectedDate] = useState<Date | null>(null)

  // Quick View & Edit State
  const [quickViewOpen, setQuickViewOpen] = useState(false)
  const [selectedOccurrence, setSelectedOccurrence] =
    useState<CoverOccurrence | null>(null)

  // Delete Confirmation State
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
  const [occurrenceToDelete, setOccurrenceToDelete] =
    useState<CoverOccurrence | null>(null)

  // Quick Add State
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  const handleSelectSlot = (date: Date) => {
    setSelectedOccurrence(null)
    setPreselectedDate(date)
    setQuickAddOpen(true)
  }

  const { data: schools } = useSchools()
  const { data: occurrences, isLoading } = useCoverOccurrences({ schoolId })
  const deleteOccurrence = useDeleteCoverOccurrence()
  const moveOccurrence = useMoveCoverOccurrence()

  const events = useMemo(() => occurrences || [], [occurrences])

  const handleSelectOccurrence = (occurrence: CoverOccurrence) => {
    setSelectedOccurrence(occurrence)
    setQuickViewOpen(true)
  }

  const handleEventDrop = async (
    occurrence: CoverOccurrence,
    newDate: Date,
  ) => {
    const dateStr = format(newDate, 'yyyy-MM-dd')

    try {
      await moveOccurrence.mutateAsync({
        id: occurrence.id,
        newDate: dateStr,
      })
      toast.success(`Moved cover to ${format(newDate, 'PPP')}`)
    } catch (error) {
      console.error('Failed to move cover', error)
      toast.error('Failed to move cover session')
    }
  }

  const handleEditFromQuickView = (occurrence: CoverOccurrence) => {
    setQuickViewOpen(false)
    setSelectedOccurrence(occurrence)
    setQuickAddOpen(true)
  }

  const handleDeleteFromQuickView = (occurrence: CoverOccurrence) => {
    setOccurrenceToDelete(occurrence)
    setDeleteConfirmationOpen(true)
  }

  const confirmDelete = async () => {
    if (!occurrenceToDelete) return

    try {
      await deleteOccurrence.mutateAsync(occurrenceToDelete.id)
      toast.success('Cover session deleted')
      setDeleteConfirmationOpen(false)
      setOccurrenceToDelete(null)
      setSelectedOccurrence(null)
      setQuickViewOpen(false)
    } catch (error) {
      console.error('Failed to delete', error)
      toast.error('Failed to delete cover session')
    }
  }

  return (
    <>
      <PageLayout
        breadcrumbs={[{ label: 'Covers Scheduling' }]}
        className="flex flex-col h-full p-0"
      >
        {/* Unified Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between py-2 bg-white gap-3 z-10 shrink-0">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => {
                  const newDate = new Date(selectedDate)
                  if (viewType === 'month')
                    newDate.setMonth(newDate.getMonth() - 1)
                  else if (viewType === 'week' || viewType === '4days')
                    newDate.setDate(newDate.getDate() - 7)
                  else newDate.setDate(newDate.getDate() - 1)
                  setSelectedDate(newDate)
                }}
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={ICON_SIZES.sm} />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => {
                  const newDate = new Date(selectedDate)
                  if (viewType === 'month')
                    newDate.setMonth(newDate.getMonth() + 1)
                  else if (viewType === 'week' || viewType === '4days')
                    newDate.setDate(newDate.getDate() + 7)
                  else newDate.setDate(newDate.getDate() + 1)
                  setSelectedDate(newDate)
                }}
              >
                <HugeiconsIcon icon={ArrowRight01Icon} size={ICON_SIZES.sm} />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(new Date())}
            >
              Today
            </Button>
            <h2 className="text-lg font-semibold text-foreground ml-1 truncate">
              {viewType === 'month'
                ? format(selectedDate, 'MMMM yyyy')
                : viewType === 'year'
                  ? selectedDate.getFullYear()
                  : format(selectedDate, 'MMM d, yyyy')}
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-muted-foreground whitespace-nowrap hidden lg:block">
                School:
              </Label>
              <Select value={schoolId} onValueChange={setSchoolId}>
                <SelectTrigger size="sm" className="w-full sm:w-[180px]">
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

            <div className="flex-shrink-0">
              <ViewToggle value={viewType} onChange={setViewType} />
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full flex flex-col">
            <div
              className={cn(
                'flex-1 h-full overflow-hidden',
                viewType === 'schedule' || viewType === 'year'
                  ? 'bg-white rounded-xl border border-border shadow-sm'
                  : '',
              )}
            >
              {/* Calendar Views */}
              {(viewType === 'day' ||
                viewType === 'week' ||
                viewType === 'month' ||
                viewType === '4days') && (
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
          </div>
        </div>
      </PageLayout>

      <CoverQuickAdd
        open={quickAddOpen}
        onOpenChange={(open) => {
          setQuickAddOpen(open)
          if (!open) setSelectedOccurrence(null)
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

      <Dialog
        open={deleteConfirmationOpen}
        onOpenChange={setDeleteConfirmationOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Cover Session?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              cover session for{' '}
              <span className="font-medium text-foreground">
                {occurrenceToDelete?.cover_rule?.club?.club_name}
              </span>
              .
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDeleteConfirmationOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteOccurrence.isPending}
            >
              {deleteOccurrence.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
