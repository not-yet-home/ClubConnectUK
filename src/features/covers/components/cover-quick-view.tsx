import { useNavigate } from '@tanstack/react-router';
import { format } from "date-fns"
import {
    Clock,
    MapPin,
    MoreHorizontal,
    Pencil,
    Trash2,
    User,
} from "lucide-react"

import { formatEventTime, getClubColors } from "../utils/formatters"
import type { CoverOccurrence } from "@/types/club.types"
import { cn } from "@/lib/utils"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
    const schoolName = cover_rule?.school?.school_name || "Unknown School"
    const assignment = occurrence.assignments?.[0]
    const teacher = assignment?.teacher
    const teacherName = teacher
        ? `${teacher.person_details.first_name} ${teacher.person_details.last_name}`
        : "Unassigned"

    const colors = getClubColors(clubName);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-0 gap-0 overflow-hidden sm:max-w-[400px] border-0 shadow-2xl rounded-2xl">
                {/* Visual Header */}
                <div className={cn("h-auto min-h-[128px] w-full p-6 flex flex-col justify-end relative", colors.dot)}>
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10">
                        <TooltipProvider delayDuration={400}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="h-8 w-8 rounded-full bg-dark/20 hover:bg-dark/40 border-0 text-white backdrop-blur-md transition-all duration-300"
                                        onClick={() => {
                                            onOpenChange(false);
                                            navigate({ to: '/covers/$occurrenceId', params: { occurrenceId: occurrence.id } });
                                        }}
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="bg-gray-900 text-white border-0">
                                    <p className="text-xs font-medium">More cover details</p>
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="h-8 w-8 rounded-full bg-white/20 hover:bg-dark/80 border-0 text-white backdrop-blur-md transition-all duration-300"
                                        onClick={() => onEdit(occurrence)}
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="bg-gray-900 text-white border-0">
                                    <p className="text-xs font-medium">Edit session</p>
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="h-8 w-8 rounded-full bg-white/20 hover:bg-red-500/80 border-0 text-white backdrop-blur-md transition-all duration-300"
                                        onClick={() => onDelete(occurrence)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="bg-red-600 text-white border-0">
                                    <p className="text-xs font-medium">Delete session</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    <div className="z-10 pr-28 pb-1">
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-sm")}>
                                {cover_rule?.frequency || 'One-off'}
                            </span>
                        </div>
                        <DialogTitle className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">
                            {clubName}
                        </DialogTitle>
                    </div>

                    {/* Decorative element */}
                    <div className="absolute -bottom-6 -right-6 h-32 w-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                </div>

                <div className="p-6 space-y-6 bg-white">
                    {/* Time & Date Block */}
                    <div className="flex gap-4 items-start group">
                        <div className={cn("p-2.5 rounded-xl transition-colors duration-300", colors.bg, "bg-opacity-10 text-opacity-100")}>
                            <Clock className={cn("w-5 h-5", colors.text)} />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-sm font-bold text-gray-900">
                                {format(new Date(occurrence.meeting_date), 'EEEE, MMMM d')}
                            </p>
                            <p className="text-sm text-gray-500 font-medium">
                                {formatEventTime(cover_rule?.start_time)} - {formatEventTime(cover_rule?.end_time)}
                            </p>
                        </div>
                    </div>

                    {/* School / Location Block */}
                    <div className="flex gap-4 items-start group">
                        <div className="p-2.5 rounded-xl bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors duration-300">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-sm font-bold text-gray-900">{schoolName}</p>
                            <p className="text-xs text-gray-500 font-medium italic">Primary Venue</p>
                        </div>
                    </div>

                    {/* Teacher Block */}
                    <div className="flex gap-4 items-center group">
                        <div className="p-2.5 rounded-xl bg-gray-50 text-gray-400 group-hover:bg-purple-50 group-hover:text-purple-500 transition-colors duration-300">
                            <User className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm transition-transform duration-300 group-hover:scale-105">
                                <AvatarFallback className={cn("text-xs font-bold", colors.dot, "text-white")}>
                                    {teacherName[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-0.5">
                                <p className="text-sm font-bold text-gray-900">{teacherName}</p>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                    {teacher ? "Assigned Staff" : "Needs Assignment"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Description if any */}
                    {cover_rule?.club?.description && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description</p>
                            <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                {cover_rule.club.description}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer simple action */}
                <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex justify-center">
                    <Button
                        variant="ghost"
                        className="text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest gap-2"
                        onClick={() => onOpenChange(false)}
                    >
                        Close Preview
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
