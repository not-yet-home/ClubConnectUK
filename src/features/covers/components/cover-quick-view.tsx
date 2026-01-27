
import { format } from "date-fns"
import {
    Clock,
    MapPin,
    User,
    Pencil,
    Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogTitle
} from "@/components/ui/dialog"
import type { CoverOccurrence } from "@/types/club.types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatEventTime, getClubColors } from "../utils/formatters"

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
            <DialogContent className="p-0 gap-0 overflow-hidden sm:max-w-[400px] border-0 shadow-2xl">
                {/* Header Strip with Actions usually found in GCal */}
                <div className={`h-2 ${colors.dot} w-full`} />

                <div className="flex justify-between items-start p-4 pb-0">
                    <div>
                        <DialogTitle className="text-xl font-normal text-gray-900 leading-tight mb-1">
                            {clubName}
                        </DialogTitle>
                        <p className="text-sm text-gray-500 font-normal">
                            Event
                        </p>
                    </div>

                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500" onClick={() => onEdit(occurrence)}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500" onClick={() => onDelete(occurrence)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="p-4 space-y-4">
                    {/* Time & Date */}
                    <div className="flex gap-3 items-start">
                        <div className="mt-0.5 text-gray-400">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div className="text-sm text-gray-700">
                            <p className="font-medium">
                                {format(new Date(occurrence.meeting_date), 'EEEE, MMMM d')}
                            </p>
                            <p>
                                {formatEventTime(cover_rule?.start_time)} - {formatEventTime(cover_rule?.end_time)}
                            </p>
                        </div>
                    </div>

                    {/* School / Location */}
                    <div className="flex gap-3 items-start">
                        <div className="mt-0.5 text-gray-400">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div className="text-sm text-gray-700">
                            {schoolName}
                        </div>
                    </div>

                    {/* Teacher */}
                    <div className="flex gap-3 items-center">
                        <div className="mt-0.5 text-gray-400">
                            <User className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-[10px] bg-blue-100 text-blue-700">
                                    {teacherName[0]}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-700">{teacherName}</span>
                        </div>
                    </div>

                    {/* Description if any */}
                    {cover_rule?.club?.description && (
                        <div className="flex gap-3 items-start">
                            <div className="w-5" /> {/* Spacer */}
                            <p className="text-sm text-gray-500 leading-relaxed">
                                {cover_rule.club.description}
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
