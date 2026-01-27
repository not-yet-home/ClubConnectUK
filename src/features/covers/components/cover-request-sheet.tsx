"use client"

import * as React from "react"
import { toast } from "sonner"
import { format } from "date-fns"
import type { CoverFrequency, DayOfWeek } from "@/types/club.types"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useSchools } from "@/hooks/use-schools"
import { useClubsBySchool } from "@/hooks/use-clubs"
import useTeachers from "@/hooks/use-teachers"
import { useCreateFullCoverRequest, useUpdateCoverRequest } from "@/features/covers/api/mutations"
import { useCoverOccurrences } from "@/hooks/use-covers"
import type { CoverOccurrence } from "@/types/club.types"

interface CoverRequestSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    existingData?: CoverOccurrence | null
}

type RequestType = 'one-off' | 'recurring'

export function CoverRequestSheet({
    open,
    onOpenChange,
    existingData
}: CoverRequestSheetProps) {
    const isEditing = !!existingData

    // Initial state derived from existingData if available, otherwise defaults
    const [requestType, setRequestType] = React.useState<RequestType>("recurring")
    const [schoolId, setSchoolId] = React.useState<string>("")
    const [clubId, setClubId] = React.useState<string>("")
    const [teacherId, setTeacherId] = React.useState<string>("unassigned")
    const [frequency, setFrequency] = React.useState<CoverFrequency>("weekly")
    const [meetingDate, setMeetingDate] = React.useState<string>(format(new Date(), 'yyyy-MM-dd'))
    const [startTime, setStartTime] = React.useState<string>("15:00")
    const [endTime, setEndTime] = React.useState<string>("16:00")

    // Effect to populate form when existingData changes or modal opens
    React.useEffect(() => {
        if (open && existingData) {
            const rule = existingData.cover_rule
            if (rule) {
                setSchoolId(rule.school?.id || "")
                setClubId(rule.club?.id || "")
                setFrequency(rule.frequency || "weekly")
                setStartTime(rule.start_time || "15:00")
                setEndTime(rule.end_time || "16:00")

                // If frequency is null or something implying one-off, handle that logic if your schema supports it
                // For now assuming existing logic where one-off is just a UI concept mapping to frequency
                setRequestType("recurring")
            }

            // Occurrence overrides
            if (existingData.meeting_date) {
                setMeetingDate(format(new Date(existingData.meeting_date), 'yyyy-MM-dd'))
            }

            // Teacher assignment
            const assignedTeacher = existingData.assignments?.[0]?.teacher
            if (assignedTeacher) {
                setTeacherId(assignedTeacher.id)
            } else {
                setTeacherId("unassigned")
            }
        } else if (open && !existingData) {
            // Reset if opening in create mode
            resetForm()
        }
    }, [open, existingData])

    // ... inside component ...

    const { data: schools, isLoading: schoolsLoading } = useSchools()
    const { data: clubs, isLoading: clubsLoading } = useClubsBySchool(schoolId)
    const { data: teachers, isLoading: teachersLoading } = useTeachers()

    // Fetch existing occurrences for conflict checking
    const { data: existingOccurrences } = useCoverOccurrences({
        startDate: meetingDate,
        endDate: meetingDate
    })

    const createRequest = useCreateFullCoverRequest()
    const updateRequest = useUpdateCoverRequest()

    const isPending = createRequest.isPending || updateRequest.isPending

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!schoolId || !clubId) {
            toast.error("Please select a school and a club.")
            return
        }

        // Check for teacher conflicts
        if (teacherId && teacherId !== 'unassigned' && existingOccurrences) {
            const newStart = parseInt(startTime.replace(':', ''));
            const newEnd = parseInt(endTime.replace(':', ''));

            const conflict = existingOccurrences.find(occ => {
                // Skip if it's the same occurrence we are editing
                if (isEditing && existingData && occ.id === existingData.id) return false;

                // Check if this teacher is assigned to this occurrence
                const hasTeacher = occ.assignments?.some(a => a.teacher_id === teacherId);
                if (!hasTeacher) return false;

                // Check for time overlap
                if (occ.cover_rule) {
                    const existingStartStr = occ.cover_rule.start_time.slice(0, 5).replace(':', '');
                    const existingEndStr = occ.cover_rule.end_time.slice(0, 5).replace(':', '');

                    const existingStart = parseInt(existingStartStr);
                    const existingEnd = parseInt(existingEndStr);

                    // Overlap logic: (StartA < EndB) && (EndA > StartB)
                    return (newStart < existingEnd) && (newEnd > existingStart);
                }
                return false;
            });

            if (conflict) {
                const conflictClub = conflict.cover_rule?.club?.club_name || "another class";
                const conflictStart = conflict.cover_rule?.start_time.slice(0, 5);
                const conflictEnd = conflict.cover_rule?.end_time.slice(0, 5);

                toast.error(`Teacher is already working for ${conflictClub} (${conflictStart} - ${conflictEnd})`);
                return;
            }
        }

        try {
            const calculatedDayOfWeek = format(new Date(meetingDate), 'eeee').toLowerCase() as DayOfWeek

            if (isEditing && existingData && existingData.cover_rule) {
                await updateRequest.mutateAsync({
                    occurrence_id: existingData.id,
                    rule_id: existingData.cover_rule.id,
                    school_id: schoolId,
                    club_id: clubId,
                    frequency: requestType === 'one-off' ? 'weekly' : frequency,
                    day_of_week: calculatedDayOfWeek,
                    start_time: startTime.length === 5 ? `${startTime}:00` : startTime,
                    end_time: endTime.length === 5 ? `${endTime}:00` : endTime,
                    meeting_date: meetingDate,
                    teacher_id: teacherId === 'unassigned' ? undefined : teacherId
                })
                toast.success("Cover request updated successfully.")
            } else {
                await createRequest.mutateAsync({
                    school_id: schoolId,
                    club_id: clubId,
                    frequency: requestType === 'one-off' ? 'weekly' : frequency,
                    day_of_week: calculatedDayOfWeek,
                    start_time: `${startTime}:00`,
                    end_time: `${endTime}:00`,
                    meeting_date: meetingDate,
                    teacher_id: teacherId === 'unassigned' ? undefined : teacherId
                })
                toast.success("Cover request created successfully.")
            }

            onOpenChange(false)
            if (!isEditing) resetForm()
        } catch (error) {
            console.error("Error saving cover request:", error)
            toast.error(isEditing ? "Failed to update cover request." : "Failed to create cover request.")
        }
    }

    const resetForm = () => {
        setSchoolId("")
        setClubId("")
        setTeacherId("unassigned")
        setRequestType("recurring")
        setFrequency("weekly")
        setMeetingDate(format(new Date(), 'yyyy-MM-dd'))
        setStartTime("15:00")
        setEndTime("16:00")
    }

    // Clear club selection if school changes (only in create mode or key change)
    // We need to be careful not to clear it immediately when populating from existingData
    // Simple check: if schoolId matches existingData's school, don't clear club
    React.useEffect(() => {
        if (!isEditing) {
            setClubId("")
        } else if (existingData?.cover_rule?.school?.id !== schoolId) {
            // If school changed away from original, clear club
            setClubId("")
        }
    }, [schoolId, isEditing, existingData])

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-0">
                <SheetHeader className="p-6 pb-4">
                    <SheetTitle>{isEditing ? "Edit Cover Request" : "New Cover Request"}</SheetTitle>
                    <SheetDescription>
                        {isEditing
                            ? "Update the details of this cover requirement."
                            : "Create a new cover requirement and optionally assign a teacher."}
                    </SheetDescription>
                </SheetHeader>

                <Separator />

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="requestType">Request Type</Label>
                            <Select value={requestType} onValueChange={(v) => setRequestType(v as RequestType)}>
                                <SelectTrigger id="requestType">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="one-off">One-off (Single Date)</SelectItem>
                                    <SelectItem value="recurring">Recurring Schedule</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <Label htmlFor="school">School</Label>
                            <Select value={schoolId} onValueChange={setSchoolId} disabled={schoolsLoading}>
                                <SelectTrigger id="school">
                                    <SelectValue placeholder="Select a school" />
                                </SelectTrigger>
                                <SelectContent>
                                    {schools?.map((school) => (
                                        <SelectItem key={school.id} value={school.id}>
                                            {school.school_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="club">Club</Label>
                            <Select
                                value={clubId}
                                onValueChange={setClubId}
                                disabled={!schoolId || clubsLoading}
                            >
                                <SelectTrigger id="club">
                                    <SelectValue placeholder={schoolId ? "Select a club" : "Select a school first"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {clubs?.map((club) => (
                                        <SelectItem key={club.id} value={club.id}>
                                            {club.club_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="teacher">Assigned Teacher (Optional)</Label>
                            <Select value={teacherId} onValueChange={setTeacherId} disabled={teachersLoading}>
                                <SelectTrigger id="teacher">
                                    <SelectValue placeholder="Select a teacher" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                    {teachers?.map((teacher: any) => (
                                        <SelectItem key={teacher.id} value={teacher.id}>
                                            {teacher.person_details.first_name} {teacher.person_details.last_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date">{requestType === 'one-off' ? 'Meeting Date' : 'Start Date'}</Label>
                            <Input
                                id="date"
                                type="date"
                                value={meetingDate}
                                onChange={(e) => setMeetingDate(e.target.value)}
                                required
                            />
                        </div>

                        {requestType === 'recurring' && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                <div className="space-y-2">
                                    <Label htmlFor="frequency">Frequency</Label>
                                    <Select value={frequency} onValueChange={(v) => setFrequency(v as CoverFrequency)}>
                                        <SelectTrigger id="frequency">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                            <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="start_time">Start Time</Label>
                                <Input
                                    id="start_time"
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end_time">End Time</Label>
                                <Input
                                    id="end_time"
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <SheetFooter className="pt-4">
                        <div className="flex gap-3 w-full">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1" disabled={isPending}>
                                {isPending ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Request" : "Create Request")}
                            </Button>
                        </div>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    )
}
