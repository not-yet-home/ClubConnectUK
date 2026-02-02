
import * as React from "react"
import { toast } from "sonner"
import { format, getDay } from "date-fns"
import { Building2, Calendar, ChevronDown, Clock, MapPin, Repeat, UserMinus } from "lucide-react"

import type { CoverOccurrence } from "@/types/club.types"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"


import { useSchools } from "@/hooks/use-schools"
import { useClubsBySchool } from "@/hooks/use-clubs"
import useTeachers from "@/hooks/use-teachers"
import { useCreateFullCoverRequest, useUpdateCoverRequest } from "@/features/covers/api/mutations"

interface CoverQuickAddProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    date: Date | null
    initialSchoolId?: string
    editingOccurrence?: CoverOccurrence | null
}

export function CoverQuickAdd({
    open,
    onOpenChange,
    date,
    initialSchoolId,
    editingOccurrence,
}: CoverQuickAddProps) {
    // Context State
    const [schoolId, setSchoolId] = React.useState<string>(initialSchoolId === 'all' ? "" : initialSchoolId || "")
    const [clubId, setClubId] = React.useState<string>("")
    const [startTime, setStartTime] = React.useState<string>("09:00")
    const [endTime, setEndTime] = React.useState<string>("10:00")
    const [requestType, setRequestType] = React.useState<'one-off' | 'recurring'>('one-off')
    const [scheduleType, setScheduleType] = React.useState<'regular' | 'covers'>('covers')
    // New Fields
    const [teacherId, setTeacherId] = React.useState<string>("unassigned")
    const [frequency, setFrequency] = React.useState<'weekly' | 'bi-weekly'>('weekly')
    const [occurrenceCount, setOccurrenceCount] = React.useState<number>(4)
    const [meetingDate, setMeetingDate] = React.useState<string>("")

    // Data Hooks
    const { data: schools } = useSchools()
    const { data: clubs, isLoading: clubsLoading } = useClubsBySchool(schoolId)
    const { data: teachers, isLoading: teachersLoading } = useTeachers()
    const createRequest = useCreateFullCoverRequest()
    const updateRequest = useUpdateCoverRequest()

    // Reset when opening
    React.useEffect(() => {
        if (open) {
            if (editingOccurrence) {
                setSchoolId(editingOccurrence.cover_rule?.school_id || "")
                setClubId(editingOccurrence.cover_rule?.club_id || "")
                setStartTime(editingOccurrence.cover_rule?.start_time || "09:00")
                setEndTime(editingOccurrence.cover_rule?.end_time || "10:00")
                setTeacherId(editingOccurrence.assignments?.[0]?.teacher_id || "unassigned")
                setFrequency((editingOccurrence.cover_rule?.frequency as any) || "weekly")
                // Heuristic: If we are editing, default to 'one-off' view unless we explicitly want to support series edit in UI
                // For now, let's just show the current values.
                setRequestType('one-off')
                setMeetingDate(editingOccurrence.meeting_date ? format(new Date(editingOccurrence.meeting_date), 'yyyy-MM-dd') : "")
                setScheduleType('covers') // Default to covers view for editing
            } else {
                setSchoolId(initialSchoolId === 'all' ? "" : initialSchoolId || "")
                setClubId("")
                setStartTime("09:00")
                setEndTime("10:00")
                setRequestType('one-off')
                setTeacherId("unassigned")
                setFrequency("weekly")
                setOccurrenceCount(4)
                setMeetingDate(date ? format(date, 'yyyy-MM-dd') : "")
            }
        }
    }, [open, initialSchoolId, date, editingOccurrence])

    const handleSubmit = async () => {
        if (!meetingDate) return
        if (!schoolId || !clubId) {
            toast.error("Please select a school and club")
            return
        }

        try {
            const dayOfOccurence = getDay(new Date(meetingDate))

            if (editingOccurrence) {
                console.log("Updating occurrence:", editingOccurrence.id, "with date:", - meetingDate);
                await updateRequest.mutateAsync({
                    occurrence_id: editingOccurrence.id,
                    rule_id: editingOccurrence.cover_rule_id,
                    school_id: schoolId,
                    club_id: clubId,
                    meeting_date: meetingDate,
                    start_time: startTime.includes(':00') ? startTime : `${startTime}:00`,
                    end_time: endTime.includes(':00') ? endTime : `${endTime}:00`,
                    teacher_id: teacherId === 'unassigned' ? undefined : teacherId,
                    frequency: frequency,
                    day_of_occurence: dayOfOccurence,
                    updateType: 'single', // Default to single update for now
                } as any)
                toast.success("Cover request updated")
            } else {
                const payload = {
                    school_id: schoolId,
                    club_id: clubId,
                    frequency: frequency,
                    day_of_occurence: dayOfOccurence,
                    start_time: startTime.includes(':00') ? startTime : `${startTime}:00`,
                    end_time: endTime.includes(':00') ? endTime : `${endTime}:00`,
                    meeting_date: meetingDate,
                    request_type: requestType,
                    occurrences: requestType === 'recurring' ? occurrenceCount : 1,
                    status: 'not_started',
                    teacher_id: teacherId === 'unassigned' ? undefined : teacherId,
                }

                // Fix for one-off type mismatch with frequency
                if (requestType === 'one-off') {
                    payload.occurrences = 1
                }

                await createRequest.mutateAsync(payload as any)
                toast.success("Cover request created")
            }
            onOpenChange(false)
        } catch (error: any) {
            toast.error(`Failed to ${editingOccurrence ? 'update' : 'create'} request: ${error.message || "Unknown error"}`)
            console.error(error)
        }
    }

    if (!date) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[440px] p-0 gap-0 overflow-hidden shadow-2xl">
                {/* 1. Header with minimal title and close only (Close is auto in DialogContent usually, but we want clean) */}
                <DialogHeader className="px-6 py-4 flex flex-row items-center justify-between border-b bg-muted/5">
                    <DialogTitle className="text-lg font-normal text-foreground/80 flex items-center gap-2">
                        {editingOccurrence ? 'Edit cover' : 'New cover request'}
                    </DialogTitle>
                    {/* "Save" button was here in some designs, but Footer is standard */}
                </DialogHeader>

                <div className="px-6 py-5 space-y-5">

                    {/* 2. Title / Subject (School & Club) */}
                    <div className="flex gap-4 items-start group">
                        <div className="mt-2 text-muted-foreground/60 w-5 flex justify-center">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div className="flex-1 space-y-1">
                            {/* School Select - looks like a title */}
                            <Select value={schoolId} onValueChange={(v) => { setSchoolId(v); setClubId("") }}>
                                <SelectTrigger className="w-full text-base font-medium border-0 px-0 h-auto shadow-none focus:ring-0 p-0 rounded-none bg-transparent hover:bg-muted/30 transition-colors data-[placeholder]:text-muted-foreground/50">
                                    <SelectValue placeholder="Add School" />
                                </SelectTrigger>
                                <SelectContent>
                                    {schools?.map(s => (
                                        <SelectItem key={s.id} value={s.id}>{s.school_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Club Select - looks like subtitle */}
                            <Select value={clubId} onValueChange={setClubId} disabled={!schoolId || clubsLoading}>
                                <SelectTrigger className={
                                    `w-full text-sm text-foreground/80 border-0 px-0 h-auto shadow-none focus:ring-0 p-0 rounded-none bg-transparent hover:bg-muted/30 transition-colors ${!schoolId ? 'opacity-50' : ''}`
                                }>
                                    <SelectValue placeholder={!schoolId ? "Select School First" : "Add Club or Activity"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {clubs?.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.club_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* 3. Date & Time */}
                    <div className="flex gap-4 items-start">
                        <div className="mt-0.5 text-muted-foreground/60 w-5 flex justify-center">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                                {/* Date Picker - Minimalist */}
                                <div className="relative flex-1">
                                    <Input
                                        type="date"
                                        value={meetingDate}
                                        onChange={(e) => setMeetingDate(e.target.value)}
                                        className="border-0 border-b border-transparent hover:border-border focus:border-primary rounded-sm px-2 py-1 h-8 text-sm shadow-none focus-visible:ring-0 bg-transparent transition-colors w-full"
                                    />
                                </div>
                                {/* Times */}
                                <div className="flex items-center gap-1 w-auto">
                                    <Input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="w-20 border-0 border-b border-transparent hover:border-border focus:border-primary rounded-sm px-1 py-1 h-8 text-sm shadow-none focus-visible:ring-0 bg-transparent text-center"
                                    />
                                    <span className="text-muted-foreground">-</span>
                                    <Input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className="w-20 border-0 border-b border-transparent hover:border-border focus:border-primary rounded-sm px-1 py-1 h-8 text-sm shadow-none focus-visible:ring-0 bg-transparent text-center"
                                    />
                                </div>
                            </div>

                            {/* Pattern / Repeat */}
                            <div className="flex items-center gap-2">
                                <Select value={requestType} onValueChange={(v: any) => setRequestType(v)}>
                                    <SelectTrigger className="w-auto h-7 text-xs border bg-muted/30 px-2 rounded-md shadow-none focus:ring-0 gap-1 border-transparent hover:bg-muted/50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="one-off">Does not repeat</SelectItem>
                                        <SelectItem value="recurring">Repeats custom...</SelectItem>
                                    </SelectContent>
                                </Select>

                                {requestType === 'recurring' && (
                                    <>
                                        <Select value={frequency} onValueChange={(v: any) => setFrequency(v)}>
                                            <SelectTrigger className="w-auto h-7 text-xs border bg-muted/30 px-2 rounded-md shadow-none focus:ring-0 border-transparent hover:bg-muted/50">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="weekly">Weekly</SelectItem>
                                                <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <span className="text-xs text-muted-foreground">for</span>
                                        <Input
                                            type="number"
                                            min={2}
                                            max={12}
                                            value={occurrenceCount}
                                            onChange={(e) => setOccurrenceCount(parseInt(e.target.value))}
                                            className="w-12 h-7 text-xs border-transparent bg-muted/30 hover:bg-muted/50 focus:bg-white text-center rounded-md"
                                        />
                                        <span className="text-xs text-muted-foreground">times</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 4. Details (Teacher replacement) */}
                    <div className="flex gap-4 items-start">
                        <div className="mt-2 text-muted-foreground/60 w-5 flex justify-center">
                            <UserMinus className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <Select value={teacherId} onValueChange={setTeacherId} disabled={teachersLoading}>
                                <SelectTrigger className="w-full text-sm border-0 border-b border-transparent hover:border-border px-0 h-9 shadow-none focus:ring-0 rounded-none bg-transparent">
                                    <SelectValue placeholder="Add Teacher (Optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unassigned">Unassigned (Pool)</SelectItem>
                                    {teachers?.map((t: any) => (
                                        <SelectItem key={t.id} value={t.id}>
                                            {t.person_details.first_name} {t.person_details.last_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t bg-muted/5 flex items-center justify-between sm:justify-between">
                    {/* Bottom Left Actions? Maybe just delete or status if editing. */}
                    <div className="flex items-center gap-2">
                        {/* Toggle for Cover Type as a pill switch */}
                        <div className="flex bg-muted/50 rounded-md p-0.5">
                            <button
                                type="button"
                                onClick={() => setScheduleType('regular')}
                                className={`px-3 py-1 text-xs font-medium rounded-sm transition-all ${scheduleType === 'regular' ? 'bg-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Regular
                            </button>
                            <button
                                type="button"
                                onClick={() => setScheduleType('covers')}
                                className={`px-3 py-1 text-xs font-medium rounded-sm transition-all ${scheduleType === 'covers' ? 'bg-white shadow-sm text-blue-600' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Cover
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="text-muted-foreground hover:text-foreground">
                            Cancel
                        </Button>
                        <Button size="sm" onClick={handleSubmit} disabled={createRequest.isPending || updateRequest.isPending} className="px-6 font-medium">
                            {createRequest.isPending || updateRequest.isPending ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
