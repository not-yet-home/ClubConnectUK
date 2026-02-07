import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { addWeeks, format, getDay, set } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import {
    Alert01Icon,
    ArrowDown01Icon,
    Calendar02Icon,
    Clock01Icon,
    School01Icon
} from "@hugeicons/core-free-icons"

import type { CoverFrequency, CoverOccurrence, OccurrenceStatus, Priority } from "@/types/club.types"
import type { Teacher } from "@/types/teacher.types"
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ICON_SIZES } from "@/constants/sizes"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"


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
    const [schoolId, setSchoolId] = useState<string>(initialSchoolId === 'all' ? "" : initialSchoolId || "")
    const [clubId, setClubId] = useState<string>("")
    const [startTime, setStartTime] = useState<string>("09:00")
    const [endTime, setEndTime] = useState<string>("10:00")
    const [requestType, setRequestType] = useState<'one-off' | 'recurring'>('one-off')
    const [scheduleType, setScheduleType] = useState<'regular' | 'covers'>('covers')
    const [teacherId, setTeacherId] = useState<string>("unassigned")
    const [frequency, setFrequency] = useState<CoverFrequency>('weekly')
    const [occurrenceCount, setOccurrenceCount] = useState<number>(4)
    const [meetingDate, setMeetingDate] = useState<string>("")
    const [teacherSearch, setTeacherSearch] = useState<string>("")
    const [teacherOpen, setTeacherOpen] = useState(false)
    const [notes, setNotes] = useState<string>("")
    const [status, setStatus] = useState<string>("not_started")
    const [priority, setPriority] = useState<string>("medium")

    // Data Hooks
    const { data: schools } = useSchools()
    const { data: clubs, isLoading: clubsLoading } = useClubsBySchool(schoolId)
    const { data: teachers, isLoading: teachersLoading } = useTeachers()
    const createRequest = useCreateFullCoverRequest()
    const updateRequest = useUpdateCoverRequest()

    // Filter teachers based on search with pattern matching
    const filteredTeachers = useMemo(() => {
        if (!teachers) return []
        if (!teacherSearch.trim()) return teachers

        const search = teacherSearch.toLowerCase().trim()
        return teachers.filter((t: any) => {
            const firstName = t.person_details?.first_name?.toLowerCase() || ""
            const lastName = t.person_details?.last_name?.toLowerCase() || ""
            const fullName = `${firstName} ${lastName} `

            // Match at word boundaries - start of first name, last name, or full name
            const words = fullName.split(' ')
            return words.some(word => word.startsWith(search))
        })
    }, [teachers, teacherSearch])

    const getTeacherName = (id: string) => {
        if (id === "unassigned") return "Unassigned (Pool)"
        const teacher = teachers?.find((t: Teacher) => t.id === id)
        if (teacher) {
            return `${teacher.person_details.first_name} ${teacher.person_details.last_name}`
        }
        return "Select Teacher"
    }

    const occurrenceDates = useMemo(() => {
        if (!meetingDate) return []
        const start = new Date(meetingDate)
        const count = requestType === 'recurring' ? Math.max(1, occurrenceCount) : 1
        const intervalWeeks = frequency === 'bi-weekly' ? 2 : 1
        const dates: Array<Date> = []
        for (let i = 0; i < count; i++) {
            dates.push(addWeeks(start, i * intervalWeeks))
        }
        return dates
    }, [meetingDate, frequency, occurrenceCount, requestType])

    const formatTimeForDate = (dateObj: Date, timeStr: string) => {
        if (!timeStr) return ''
        const [h, m = 0] = timeStr.split(':').map(Number)
        const dt = set(dateObj, { hours: h, minutes: m, seconds: 0, milliseconds: 0 })
        return format(dt, 'h:mm a')
    }

    useEffect(() => {
        if (open) {
            if (editingOccurrence) {
                setSchoolId(editingOccurrence.cover_rule?.school_id || "")
                setClubId(editingOccurrence.cover_rule?.club_id || "")
                // Extract HH:mm from HH:mm:ss format
                const startTimeStr = editingOccurrence.cover_rule?.start_time || "09:00"
                const endTimeStr = editingOccurrence.cover_rule?.end_time || "10:00"
                setStartTime(startTimeStr.substring(0, 5))
                setEndTime(endTimeStr.substring(0, 5))
                setTeacherId(editingOccurrence.assignments?.[0]?.teacher_id || "unassigned")
                setFrequency(editingOccurrence.cover_rule?.frequency || "weekly")
                // Heuristic: If we are editing, default to 'one-off' view unless we explicitly want to support series edit in UI
                // For now, let's just show the current values.
                setRequestType('one-off')
                setMeetingDate(editingOccurrence.meeting_date ? format(new Date(editingOccurrence.meeting_date), 'yyyy-MM-dd') : "")
                setNotes(editingOccurrence.notes || "")
                setStatus(editingOccurrence.status)
                setPriority(editingOccurrence.priority)
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
                setNotes("")
                setStatus("not_started")
                setPriority("medium")
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
                console.log("Updating occurrence:", editingOccurrence.id, "with date:", meetingDate);
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
                    status: status as OccurrenceStatus,
                    priority: priority as Priority,
                    notes,
                })
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
                    status: status,
                    priority: priority,
                    notes: notes,
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
                <DialogHeader className="px-6 py-3 flex flex-row items-center justify-between border-b bg-muted/5">
                    <DialogTitle className="text-lg font-normal text-foreground/80 flex items-center gap-2">
                        {editingOccurrence ? 'Edit Schedule Request' : 'New Schedule Request'}
                    </DialogTitle>
                    {/* "Save" button was here in some designs, but Footer is standard */}
                </DialogHeader>
                <div className="px-6 py-3 border-b bg-muted/5 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <p className="text-[11px] font-semibold text-muted-foreground/70 uppercase letter-spacing-wider">Schedule Type</p>
                            <div className="flex bg-muted/50 rounded-md p-0.5 w-fit">
                                <button
                                    type="button"
                                    onClick={() => setScheduleType('regular')}
                                    className={`px-4 py-1.5 text-xs font-semibold rounded-sm transition-all ${scheduleType === 'regular' ? 'bg-white shadow-sm text-red-600' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    Regular
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setScheduleType('covers')}
                                    className={`px-4 py-1.5 text-xs font-semibold rounded-sm transition-all ${scheduleType === 'covers' ? 'bg-white shadow-sm text-blue-600' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    Cover
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-[11px] font-semibold text-muted-foreground/70 uppercase letter-spacing-wider">Teacher (optional)</p>
                            <Popover open={teacherOpen} onOpenChange={setTeacherOpen}>
                                <PopoverTrigger asChild>
                                    <button
                                        type="button"
                                        disabled={teachersLoading}
                                        className="w-full text-sm border-0 border-b border-muted/50 hover:border-muted px-0 h-9 shadow-none focus:ring-0 rounded-none bg-transparent text-left text-foreground/80 disabled:opacity-50 flex items-center justify-between"
                                    >
                                        <span className="truncate">{getTeacherName(teacherId)}</span>
                                        <HugeiconsIcon icon={ArrowDown01Icon} className={ICON_SIZES.sm + " opacity-50 shrink-0 ml-2"} />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[200px] p-0" align="start">
                                    <Command shouldFilter={false}>
                                        <CommandInput
                                            placeholder="Search teachers..."
                                            value={teacherSearch}
                                            onValueChange={setTeacherSearch}
                                            className="border-0 border-b"
                                        />
                                        {filteredTeachers.length === 0 && teacherSearch ? (
                                            <CommandEmpty>No teachers found.</CommandEmpty>
                                        ) : null}
                                        <CommandList>
                                            <CommandGroup>
                                                <CommandItem
                                                    value="unassigned"
                                                    onSelect={() => {
                                                        setTeacherId("unassigned")
                                                        setTeacherOpen(false)
                                                        setTeacherSearch("")
                                                    }}
                                                    className={`cursor-pointer ${teacherId === "unassigned" ? "bg-primary text-primary-foreground" : ""}`}
                                                >
                                                    Unassigned (Pool)
                                                </CommandItem>
                                                {filteredTeachers.map((t: Teacher) => (
                                                    <CommandItem
                                                        key={t.id}
                                                        value={`${t.person_details.first_name} ${t.person_details.last_name}`}
                                                        onSelect={() => {
                                                            setTeacherId(t.id)
                                                            setTeacherOpen(false)
                                                            setTeacherSearch("")
                                                        }}
                                                        className={`cursor-pointer ${teacherId === t.id ? "bg-primary text-primary-foreground" : ""}`}
                                                    >
                                                        {t.person_details.first_name} {t.person_details.last_name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>
                <div className="px-6 py-4 space-y-4">
                    {/* 2. Title / Subject (School & Club) */}
                    <div className="flex gap-4 items-start">
                        <div className="mt-1 text-muted-foreground/40 w-5 flex justify-center">
                            <HugeiconsIcon icon={School01Icon} className={ICON_SIZES.sm} />
                        </div>
                        <div className="flex-1">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <Label htmlFor="school-select" className="text-[11px] font-semibold text-muted-foreground/70 uppercase letter-spacing-wider">School</Label>
                                    <Select value={schoolId} onValueChange={(v) => { setSchoolId(v); setClubId("") }}>
                                        <SelectTrigger className="w-full text-sm border-0 border-b border-muted/50 hover:border-muted px-0 h-9 shadow-none focus:ring-0 rounded-none bg-transparent" id="school-select">
                                            <SelectValue placeholder="Add School" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {schools?.map(s => (
                                                <SelectItem key={s.id} value={s.id}>{s.school_name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="club-select" className="text-[11px] font-semibold text-muted-foreground/70 uppercase letter-spacing-wider">Club or Activity</Label>
                                    <Select value={clubId} onValueChange={setClubId} disabled={!schoolId || clubsLoading}>
                                        <SelectTrigger className={`w-full text-sm border-0 border-b border-muted/50 hover:border-muted px-0 h-9 shadow-none focus:ring-0 rounded-none bg-transparent ${!schoolId ? 'opacity-50' : ''}`} id="club-select">
                                            <SelectValue placeholder={!schoolId ? "Select School First" : "Add Club"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {clubs?.map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.club_name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Date & Time */}
                    <div className="flex gap-4 items-start">
                        <div className="mt-1 text-muted-foreground/40 w-5 flex justify-center">
                            <HugeiconsIcon icon={Calendar02Icon} className={ICON_SIZES.sm} />
                        </div>
                        <div className="flex-1 space-y-3">
                            <div className="space-y-1">
                                <Label className="text-[11px] font-semibold text-muted-foreground/70 uppercase letter-spacing-wider">Date & Time</Label>
                                <div className="flex items-center gap-6">
                                    {/* Date Picker - Minimalist */}
                                    <div className="relative flex-1">
                                        <Input
                                            id="meeting-date"
                                            type="date"
                                            value={meetingDate}
                                            onChange={(e) => setMeetingDate(e.target.value)}
                                            className="border-0 border-b border-muted/50 hover:border-muted focus:border-primary rounded-none px-0 py-2 h-9 text-sm shadow-none focus-visible:ring-0 bg-transparent transition-colors w-full"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2.5 w-auto">
                                        <HugeiconsIcon icon={Clock01Icon} className={ICON_SIZES.xs + " text-muted-foreground/40 mr-1"} />
                                        <Input
                                            id="start-time"
                                            type="time"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            className="w-[72px] border-0 border-b border-muted/50 hover:border-muted focus:border-primary rounded-none px-0 py-2 h-9 text-sm shadow-none focus-visible:ring-0 bg-transparent text-center"
                                        />
                                        <span className="text-muted-foreground/30 text-[11px] font-medium uppercase px-1">to</span>
                                        <Input
                                            id="end-time"
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            className="w-[72px] border-0 border-b border-muted/50 hover:border-muted focus:border-primary rounded-none px-0 py-2 h-9 text-sm shadow-none focus-visible:ring-0 bg-transparent text-center"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-[11px] font-semibold text-muted-foreground/70 uppercase letter-spacing-wider">Repeat</Label>
                                <div className="flex items-start gap-1.5 mb-1">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button type="button" className="p-0.5 rounded text-muted-foreground/60 hover:text-foreground mt-0.5">
                                                <HugeiconsIcon icon={Alert01Icon} className={ICON_SIZES.xs} />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent sideOffset={6} className="max-w-xs bg-background text-foreground border border-border">
                                            Set a start date, choose frequency and how many times it should recur. The preview shows the exact dates.
                                        </TooltipContent>
                                    </Tooltip>
                                    <div className="text-[11px] text-muted-foreground/60">Choose how multiple sessions should be generated.</div>
                                </div>
                                {/* Pattern / Repeat */}
                                <div className="flex items-center gap-4">
                                    <Select value={requestType} onValueChange={(v: any) => setRequestType(v)}>
                                        <SelectTrigger className="w-auto h-9 text-sm border-0 border-b border-muted/50 hover:border-muted px-0 shadow-none focus:ring-0 rounded-none bg-transparent" id="repeat-select">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="one-off">Does not repeat</SelectItem>
                                            <SelectItem value="recurring">Repeats custom...</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {requestType === 'recurring' && (
                                        <div className="flex items-center gap-2">
                                            <Select value={frequency} onValueChange={(v: any) => setFrequency(v)}>
                                                <SelectTrigger className="w-auto h-9 text-sm border-0 border-b border-muted/50 hover:border-muted px-0 shadow-none focus:ring-0 rounded-none bg-transparent">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="weekly">Weekly</SelectItem>
                                                    <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <span className="text-xs text-muted-foreground/60 font-medium">for</span>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Input
                                                        type="number"
                                                        min={2}
                                                        max={12}
                                                        value={occurrenceCount}
                                                        onChange={(e) => setOccurrenceCount(parseInt(e.target.value))}
                                                        className="w-10 h-9 text-sm border-0 border-b border-muted/50 hover:border-muted px-0 shadow-none focus-visible:ring-0 bg-transparent text-center rounded-none font-semibold"
                                                    />
                                                </TooltipTrigger>
                                                <TooltipContent sideOffset={6} className="max-w-xs bg-background text-foreground border border-border">
                                                    {meetingDate ? (
                                                        <div className="space-y-1">
                                                            {occurrenceDates.slice(0, 6).map((d, idx) => (
                                                                <div key={idx} className="text-[13px]">
                                                                    {format(d, 'eee, MMM d, yyyy')} • {formatTimeForDate(d, startTime)} - {formatTimeForDate(d, endTime)}
                                                                </div>
                                                            ))}
                                                            {occurrenceDates.length > 6 && (
                                                                <div className="text-[13px]">and {occurrenceDates.length-6} more…</div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="text-[13px]">Pick a start date to preview dates.</div>
                                                    )}
                                                </TooltipContent>
                                            </Tooltip>
                                            <span className="text-xs text-muted-foreground/60 font-medium">times</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start pt-1">
                        <div className="mt-1 text-muted-foreground/40 w-5 flex justify-center">
                            <HugeiconsIcon icon={Alert01Icon} className={ICON_SIZES.sm} />
                        </div>
                        <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <Label className="text-[11px] font-semibold text-muted-foreground/70 uppercase letter-spacing-wider">Progress</Label>
                                    <Select value={status} onValueChange={setStatus}>
                                        <SelectTrigger className="w-full text-sm border-0 border-b border-muted/50 hover:border-muted px-0 h-9 shadow-none focus:ring-0 rounded-none bg-transparent capitalize">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="not_started">Not Started</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[11px] font-semibold text-muted-foreground/70 uppercase letter-spacing-wider">Priority</Label>
                                    <Select value={priority} onValueChange={setPriority}>
                                        <SelectTrigger className="w-full text-sm border-0 border-b border-muted/50 hover:border-muted px-0 h-9 shadow-none focus:ring-0 rounded-none bg-transparent capitalize">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[11px] font-semibold text-muted-foreground/70 uppercase letter-spacing-wider">Description</Label>
                                <Textarea
                                    placeholder="Add details about this cover..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="min-h-[60px] text-sm resize-none border-0 border-b border-muted/50 hover:border-muted focus-visible:ring-0 rounded-none bg-transparent px-0 py-1"
                                />
                            </div>
                        </div>
                    </div>

                </div>

                <DialogFooter className="px-6 py-3 border-t bg-muted/5 flex items-center justify-end sm:justify-end">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="text-muted-foreground hover:text-foreground">
                            Cancel
                        </Button>
                        <Button size="sm" onClick={handleSubmit} disabled={createRequest.isPending || updateRequest.isPending} className="px-6 font-medium">
                            {createRequest.isPending || updateRequest.isPending ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent >
        </Dialog >
    )
}
