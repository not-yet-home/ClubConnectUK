import { useNavigate } from '@tanstack/react-router';
import { format } from "date-fns"
import {
    Bell,
    MoreVertical,
    Pencil,
    Trash2,
    User,
    X,
} from "lucide-react"

import { formatEventTime, getClubColors, parseLocalDate } from "../utils/formatters"
import type { CoverOccurrence } from "@/types/club.types"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogTitle
} from "@/components/ui/dialog"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

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
    onDelete
}: CoverQuickViewProps) {
    const navigate = useNavigate();
    if (!occurrence) return null

    const { cover_rule } = occurrence
    const clubName = cover_rule?.club?.club_name || "Unknown Club"
    const assignment = occurrence.assignments?.[0]
    const teacher = assignment?.teacher
    const teacherName = teacher
        ? `${teacher.person_details.first_name} ${teacher.person_details.last_name}`
        : "Unassigned"

    const colors = getClubColors(clubName);
    const meetingDate = parseLocalDate(occurrence.meeting_date);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-0 gap-0 overflow-hidden sm:max-w-[320px] border border-gray-200 shadow-lg rounded-lg bg-white">
                {/* Top Icon Toolbar - Google Calendar style */}
                <div className="flex items-center justify-end gap-0.5 p-2 border-b border-gray-100">
                    <TooltipProvider delayDuration={300}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="rounded-full hover:bg-gray-100"
                                    onClick={() => onEdit(occurrence)}
                                >
                                    <Pencil className="h-4 w-4 text-gray-600" />
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
                                    className="rounded-full hover:bg-gray-100"
                                    onClick={() => onDelete(occurrence)}
                                >
                                    <Trash2 className="h-4 w-4 text-gray-600" />
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
                                    className="rounded-full hover:bg-gray-100"
                                    onClick={() => {
                                        onOpenChange(false);
                                        navigate({ to: '/covers/$occurrenceId', params: { occurrenceId: occurrence.id } });
                                    }}
                                >
                                    <MoreVertical className="h-4 w-4 text-gray-600" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                <p className="text-xs">More options</p>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="rounded-full hover:bg-gray-100"
                                    onClick={() => onOpenChange(false)}
                                >
                                    <X className="h-4 w-4 text-gray-600" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                <p className="text-xs">Close</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                {/* Content - Google Calendar style */}
                <div className="p-4 space-y-4">
                    {/* Title with colored indicator */}
                    <div className="flex items-start gap-3">
                        <div className={cn("w-3 h-3 rounded-sm mt-1 flex-shrink-0", colors.dot)} />
                        <div>
                            <DialogTitle className="text-base font-normal text-gray-900 leading-tight">
                                {clubName}
                            </DialogTitle>
                            <p className="text-sm text-gray-500 mt-0.5">
                                {format(meetingDate, 'EEEE, MMMM d')}
                            </p>
                        </div>
                    </div>

                    {/* Info rows with icons */}
                    <div className="space-y-3 pt-2">
                        {/* Reminder info */}
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <Bell className="h-4 w-4 text-gray-400" />
                            <span>
                                {formatEventTime(cover_rule?.start_time)} - {formatEventTime(cover_rule?.end_time)}
                            </span>
                        </div>

                        {/* Assigned person */}
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className={!teacher ? 'text-orange-600 italic' : ''}>
                                {teacherName}
                            </span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}