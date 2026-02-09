import { useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Calendar02Icon,
  Cancel01Icon,
  Delete02Icon,
  MoreVerticalIcon,
  Note01Icon,
  PencilEdit01Icon,
  School01Icon,
  Tick01Icon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons'

import {
  formatEventTime,
  getClubColors,
  parseLocalDate,
} from '../utils/formatters'
import type { CoverOccurrence } from '@/types/club.types'
import { cn } from '@/lib/utils'
import { ICON_SIZES } from '@/constants/sizes'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'

interface CoverQuickViewProps {
  occurrence: CoverOccurrence | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (occurrence: CoverOccurrence) => void
  onDelete: (occurrence: CoverOccurrence) => void
}

export function CoverQuickView({
  occurrence,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: CoverQuickViewProps) {
  const navigate = useNavigate()
  if (!occurrence) return null

  const { cover_rule } = occurrence
  const clubName = cover_rule?.club?.club_name || 'Unknown Club'
  const schoolName = cover_rule?.school?.school_name || 'Unknown School'
  const assignment = occurrence.assignments?.[0]
  const teacher = assignment?.teacher
  const teacherName = teacher
    ? `${teacher.person_details.first_name} ${teacher.person_details.last_name}`
    : 'Unassigned'

  const colors = getClubColors(clubName)
  const meetingDate = parseLocalDate(occurrence.meeting_date)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-0 gap-0 overflow-hidden sm:max-w-[400px] border border-gray-200 shadow-2xl rounded-xl bg-white"
        aria-describedby={undefined}
      >
        {/* Top Icon Toolbar */}
        <div className="flex items-center justify-end gap-1 p-2 border-b bg-gray-50/50">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-full hover:bg-white hover:shadow-sm"
                  onClick={() => onEdit(occurrence)}
                >
                  <HugeiconsIcon icon={PencilEdit01Icon} className={ICON_SIZES.sm} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">Edit event</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-full hover:bg-white hover:shadow-sm text-red-500 hover:text-red-600"
                  onClick={() => onDelete(occurrence)}
                >
                  <HugeiconsIcon icon={Delete02Icon} className={ICON_SIZES.sm} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">Delete event</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-full hover:bg-white hover:shadow-sm"
                  onClick={() => {
                    onOpenChange(false)
                    navigate({
                      to: '/covers/$occurrenceId',
                      params: { occurrenceId: occurrence.id },
                    })
                  }}
                >
                  <HugeiconsIcon icon={MoreVerticalIcon} className={ICON_SIZES.sm} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">More options</p>
              </TooltipContent>
            </Tooltip>

            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-full hover:bg-white hover:shadow-sm"
              onClick={() => onOpenChange(false)}
            >
              <HugeiconsIcon icon={Cancel01Icon} className={ICON_SIZES.sm} />
            </Button>
          </TooltipProvider>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Header Info */}
          <div className="flex items-start gap-4">
            <div
              className={cn(
                'w-4 h-4 rounded mt-1.5 flex-shrink-0 shadow-sm',
                colors.bg,
                colors.border,
                'border'
              )}
            />
            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold text-gray-900 leading-tight tracking-tight">
                {clubName}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="px-2 py-0 text-[10px] uppercase font-bold tracking-widest bg-gray-100 text-gray-600 border-none">
                  {cover_rule?.frequency || 'One-off'}
                </Badge>
                {occurrence.priority === 'high' && (
                  <Badge variant="destructive" className="px-2 py-0 text-[10px] uppercase font-bold tracking-widest border-none">
                    High Priority
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="space-y-5">
            {/* Date & Time */}
            <div className="flex items-start gap-4 text-sm">
              <div className="mt-2 p-1.5 bg-blue-50 rounded-lg">
                <HugeiconsIcon icon={Calendar02Icon} className={ICON_SIZES.sm + ' text-blue-600'} />
              </div>
              <div className="flex flex-col space-y-0.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Schedule</span>
                <span className="font-bold text-gray-900">
                  {format(meetingDate, 'EEEE, MMMM d, yyyy')}
                </span>
                <span className="text-gray-500 font-medium">
                  {formatEventTime(cover_rule?.start_time)} - {formatEventTime(cover_rule?.end_time)}
                </span>
              </div>
            </div>

            {/* School */}
            <div className="flex items-start gap-4 text-sm">
              <div className="mt-2 p-1.5 bg-purple-50 rounded-lg">
                <HugeiconsIcon icon={School01Icon} className={ICON_SIZES.sm + ' text-purple-600'} />
              </div>
              <div className="flex flex-col space-y-0.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Location</span>
                <span className="font-semibold text-gray-700">{schoolName}</span>
              </div>
            </div>

            {/* Teacher */}
            <div className="flex items-start gap-4 text-sm">
              <div className="mt-2 p-1.5 bg-amber-50 rounded-lg">
                <HugeiconsIcon icon={UserGroupIcon} className={ICON_SIZES.sm + ' text-amber-600'} />
              </div>
              <div className="flex flex-col space-y-0.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Teacher Assignment</span>
                <span className={cn(
                  "font-semibold",
                  teacher ? "text-gray-700" : "text-amber-700 italic"
                )}>
                  {teacherName}
                </span>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-start gap-4 text-sm">
              <div className="mt-2 p-1.5 bg-emerald-50 rounded-lg">
                <HugeiconsIcon icon={Tick01Icon} className={ICON_SIZES.sm + ' text-emerald-600'} />
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Progress Status</span>
                <Badge
                  variant="outline"
                  className={cn(
                    "capitalize border shadow-none font-bold text-[10px] w-fit",
                    occurrence.status === 'completed' && "bg-emerald-50 text-emerald-700 border-emerald-100",
                    occurrence.status === 'in_progress' && "bg-blue-50 text-blue-700 border-blue-100",
                    occurrence.status === 'not_started' && "bg-gray-50 text-gray-600 border-gray-100",
                  )}
                >
                  {occurrence.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {occurrence.notes && (
            <>
              <Separator className="opacity-50" />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <HugeiconsIcon icon={Note01Icon} className="w-3 h-3" />
                  <span>Notes</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                  "{occurrence.notes}"
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer Action */}
        <div className="p-4 bg-gray-50/80 border-t flex justify-center">
          <Button
            variant="link"
            className="text-xs font-bold text-primary uppercase tracking-widest hover:no-underline hover:text-primary/80"
            onClick={() => {
              onOpenChange(false)
              navigate({
                to: '/covers/$occurrenceId',
                params: { occurrenceId: occurrence.id },
              })
            }}
          >
            View full occurrence details
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
