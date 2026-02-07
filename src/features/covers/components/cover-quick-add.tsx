import * as React from "react"
import { toast } from "sonner"
import { addWeeks, format, getDay, set } from "date-fns"
import { Building2, Clock, Info, ChevronDown } from "lucide-react"
import type { CoverOccurrence } from "@/types/club.types"
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'


import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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
    const [schoolId, setSchoolId] = React.useState<string>(initialSchoolId === 'all' ? "" : initialSchoolId || "")
    const [clubId, setClubId] = React.useState<string>("")
    const [startTime, setStartTime] = React.useState<string>("09:00")
    const [endTime, setEndTime] = React.useState<string>("10:00")
    const [requestType, setRequestType] = React.useState<'one-off' | 'recurring'>('one-off')
    const [scheduleType, setScheduleType] = React.useState<'regular' | 'covers'>('covers')
    const [teacherId, setTeacherId] = React.useState<string>("unassigned")
    const [frequency, setFrequency] = React.useState<'weekly' | 'bi-weekly'>('weekly')
    const [occurrenceCount, setOccurrenceCount] = React.useState<number>(4)
    const [meetingDate, setMeetingDate] = React.useState<string>("")
    const [teacherSearch, setTeacherSearch] = React.useState<string>("")
    const [teacherOpen, setTeacherOpen] = React.useState(false)

    // Data Hooks
    const { data: schools } = useSchools()
    const { data: clubs, isLoading: clubsLoading } = useClubsBySchool(schoolId)
    const { data: teachers, isLoading: teachersLoading } = useTeachers()
    const createRequest = useCreateFullCoverRequest()
    const updateRequest = useUpdateCoverRequest()

    // Filter teachers based on search with pattern matching
    const filteredTeachers = React.useMemo(() => {
        if (!teachers) return []
        if (!teacherSearch.trim()) return teachers

        const search = teacherSearch.toLowerCase().trim()
        return teachers.filter((t: any) => {
            const firstName = t.person_details?.first_name?.toLowerCase() || ""
            const lastName = t.person_details?.last_name?.toLowerCase() || ""
            const fullName = `${firstName} ${lastName}`

            // Match at word boundaries - start of first name, last name, or full name
            const words = fullName.split(' ')
            return words.some(word => word.startsWith(search))
        })
    }, [teachers, teacherSearch])

    // Get selected teacher name
    const getTeacherName = (id: string) => {
        if (id === "unassigned") return "Unassigned (Pool)"
        const teacher = teachers?.find((t: any) => t.id === id)
        if (teacher) {
            return `${teacher.person_details.first_name} ${teacher.person_details.last_name}`
        }
        return "Select Teacher"
    }

    // Compute occurrence dates for preview (based on meetingDate, frequency and occurrenceCount)
    const occurrenceDates = React.useMemo(() => {
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

    // Reset when opening
    React.useEffect(() => {
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
                        {editingOccurrence ? 'Edit Schedule Request' : 'New Schedule Request'}
                    </DialogTitle>
                    {/* "Save" button was here in some designs, but Footer is standard */}
                </DialogHeader>
                <div className="px-6 py-4 border-b bg-muted/5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">Choose Type of Schedule</p>
                            <div className="flex bg-muted/50 rounded-md p-0.5 w-fit">
                                <button
                                    type="button"
                                    onClick={() => setScheduleType('regular')}
                                    className={`px-4 py-1.5 text-xs font-medium rounded-sm transition-all ${scheduleType === 'regular' ? 'bg-white shadow-sm text-red-600' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    Regular
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setScheduleType('covers')}
                                    className={`px-4 py-1.5 text-xs font-medium rounded-sm transition-all ${scheduleType === 'covers' ? 'bg-white shadow-sm text-blue-600' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    Cover
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">Teacher (optional)</p>
                            <Popover open={teacherOpen} onOpenChange={setTeacherOpen}>
                                <PopoverTrigger asChild>
                                    <button
                                        type="button"
                                        disabled={teachersLoading}
                                        className="w-full text-sm border-0 border-b border-transparent hover:border-border px-0 h-9 shadow-none focus:ring-0 rounded-none bg-transparent text-left text-foreground/80 disabled:opacity-50 flex items-center justify-between"
                                    >
                                        <span className="truncate">{getTeacherName(teacherId)}</span>
                                        <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
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
                                                {filteredTeachers.map((t: any) => (
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
                <div className="px-6 py-4 space-y-3">
                    {/* 2. Title / Subject (School & Club) */}
                    <div className="flex gap-4 items-start group">
                        <div className="mt-2.5 text-muted-foreground/60 w-5 flex justify-center">
                            <Building2 className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <div className="text-sm font-medium text-muted-foreground">School</div>
                                    <Select value={schoolId} onValueChange={(v) => { setSchoolId(v); setClubId("") }}>
                                        <SelectTrigger className="w-full text-sm border-0 border-b border-transparent hover:border-border px-0 h-9 shadow-none focus:ring-0 rounded-none bg-transparent" id="school-select">
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
                                    <div className="text-sm font-medium text-muted-foreground">Club or Activity</div>
                                    <Select value={clubId} onValueChange={setClubId} disabled={!schoolId || clubsLoading}>
                                        <SelectTrigger className={`w-full text-sm border-0 border-b border-transparent hover:border-border px-0 h-9 shadow-none focus:ring-0 rounded-none bg-transparent ${!schoolId ? 'opacity-50' : ''}`} id="club-select">
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
                        <div className="mt-2.5 text-muted-foreground/60 w-5 flex justify-center">
                            <Clock className="w-4 h-4" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="text-sm font-medium text-muted-foreground mb-1">Date & Time</div>
                            <div className="flex items-center gap-3">
                                {/* Date Picker - Minimalist */}
                                <div className="relative flex-1">
                                    <Input
                                        id="meeting-date"
                                        type="date"
                                        value={meetingDate}
                                        onChange={(e) => setMeetingDate(e.target.value)}
                                        className="border-0 border-b border-transparent hover:border-border focus:border-primary rounded-sm px-2 py-2 h-9 text-sm shadow-none focus-visible:ring-0 bg-transparent transition-colors w-full"
                                    />
                                </div>
                                <div className="flex items-center gap-2 w-auto">
                                    <Input
                                        id="start-time"
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="w-20 border-0 border-b border-transparent hover:border-border focus:border-primary rounded-sm px-2 py-2 h-9 text-sm shadow-none focus-visible:ring-0 bg-transparent text-center"
                                    />
                                    <span className="text-muted-foreground/60 text-sm">—</span>
                                    <Input
                                        id="end-time"
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className="w-20 border-0 border-b border-transparent hover:border-border focus:border-primary rounded-sm px-2 py-2 h-9 text-sm shadow-none focus-visible:ring-0 bg-transparent text-center"
                                    />
                                </div>
                            </div>

                            <div className="text-sm font-medium text-muted-foreground mb-1 mt-2">Repeat</div>
                            <div className="flex items-start gap-1.5 mb-1.5">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button type="button" className="p-0.5 rounded text-muted-foreground/80 hover:text-foreground mt-0.5">
                                            <Info className="w-3.5 h-3.5" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent sideOffset={6} className="max-w-xs bg-background text-foreground border border-border">
                                        Set a start date, choose frequency and how many times it should recur. The preview shows the exact dates.
                                    </TooltipContent>
                                </Tooltip>
                                <div className="text-xs text-muted-foreground">Repeat options — choose how the cover should recur.</div>
                            </div>
                            {/* Pattern / Repeat */}
                            <div className="flex items-center gap-2">
                                <Select value={requestType} onValueChange={(v: any) => setRequestType(v)}>
                                    <SelectTrigger className="w-auto h-9 text-sm border-0 border-b border-transparent hover:border-border px-0 shadow-none focus:ring-0 rounded-none bg-transparent" id="repeat-select">
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
                                            <SelectTrigger className="w-auto h-9 text-sm border-0 border-b border-transparent hover:border-border px-0 shadow-none focus:ring-0 rounded-none bg-transparent">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="weekly">Weekly</SelectItem>
                                                <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <span className="text-sm text-muted-foreground">for</span>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Input
                                                    type="number"
                                                    min={2}
                                                    max={12}
                                                    value={occurrenceCount}
                                                    onChange={(e) => setOccurrenceCount(parseInt(e.target.value))}
                                                    className="w-12 h-9 text-sm border-0 border-b border-transparent hover:border-border px-0 shadow-none focus-visible:ring-0 bg-transparent text-center rounded-none"
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
                                                            <div className="text-[13px]">and {occurrenceDates.length - 6} more…</div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="text-[13px]">Pick a start date to preview dates.</div>
                                                )}
                                            </TooltipContent>
                                        </Tooltip>
                                        <span className="text-sm text-muted-foreground">times</span>
                                    </>
                                )}
                            </div>

                        </div>
                    </div>

                </div>

                <DialogFooter className="px-6 py-4 border-t bg-muted/5 flex items-center justify-between sm:justify-between">
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
