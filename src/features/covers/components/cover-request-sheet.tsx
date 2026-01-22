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
import { useCreateFullCoverRequest } from "@/features/covers/api/mutations"

interface CoverRequestSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

type RequestType = 'one-off' | 'recurring'

export function CoverRequestSheet({
    open,
    onOpenChange,
}: CoverRequestSheetProps) {
    const [requestType, setRequestType] = React.useState<RequestType>("recurring")
    const [schoolId, setSchoolId] = React.useState<string>("")
    const [clubId, setClubId] = React.useState<string>("")
    const [teacherId, setTeacherId] = React.useState<string>("unassigned")
    const [frequency, setFrequency] = React.useState<CoverFrequency>("weekly")
    const [dayOfWeek, setDayOfWeek] = React.useState<DayOfWeek>("monday")
    const [meetingDate, setMeetingDate] = React.useState<string>(format(new Date(), 'yyyy-MM-dd'))
    const [startTime, setStartTime] = React.useState<string>("15:00")
    const [endTime, setEndTime] = React.useState<string>("16:00")

    const { data: schools, isLoading: schoolsLoading } = useSchools()
    const { data: clubs, isLoading: clubsLoading } = useClubsBySchool(schoolId)
    const { data: teachers, isLoading: teachersLoading } = useTeachers()

    const createRequest = useCreateFullCoverRequest()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!schoolId || !clubId) {
            toast.error("Please select a school and a club.")
            return
        }

        try {
            await createRequest.mutateAsync({
                school_id: schoolId,
                club_id: clubId,
                frequency: requestType === 'one-off' ? 'weekly' : frequency, // Placeholder for one-off
                day_of_week: requestType === 'one-off' ? format(new Date(meetingDate), 'eeee').toLowerCase() as DayOfWeek : dayOfWeek,
                start_time: `${startTime}:00`,
                end_time: `${endTime}:00`,
                meeting_date: meetingDate,
                teacher_id: teacherId === 'unassigned' ? undefined : teacherId
            })

            toast.success("Cover request created successfully.")
            onOpenChange(false)
            resetForm()
        } catch (error) {
            console.error("Error creating cover request:", error)
            toast.error("Failed to create cover request.")
        }
    }

    const resetForm = () => {
        setSchoolId("")
        setClubId("")
        setTeacherId("unassigned")
        setRequestType("recurring")
        setFrequency("weekly")
        setDayOfWeek("monday")
        setMeetingDate(format(new Date(), 'yyyy-MM-dd'))
        setStartTime("15:00")
        setEndTime("16:00")
    }

    // Clear club selection if school changes
    React.useEffect(() => {
        setClubId("")
    }, [schoolId])

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-0">
                <SheetHeader className="p-6 pb-4">
                    <SheetTitle>New Cover Request</SheetTitle>
                    <SheetDescription>
                        Create a new cover requirement and optionally assign a teacher.
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
                            <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
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

                                <div className="space-y-2">
                                    <Label htmlFor="day_of_week">Day of Week</Label>
                                    <Select value={dayOfWeek} onValueChange={(v) => setDayOfWeek(v as DayOfWeek)}>
                                        <SelectTrigger id="day_of_week">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="monday">Monday</SelectItem>
                                            <SelectItem value="tuesday">Tuesday</SelectItem>
                                            <SelectItem value="wednesday">Wednesday</SelectItem>
                                            <SelectItem value="thursday">Thursday</SelectItem>
                                            <SelectItem value="friday">Friday</SelectItem>
                                            <SelectItem value="saturday">Saturday</SelectItem>
                                            <SelectItem value="sunday">Sunday</SelectItem>
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
                            <Button type="submit" className="flex-1" disabled={createRequest.isPending}>
                                {createRequest.isPending ? "Creating..." : "Create Request"}
                            </Button>
                        </div>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    )
}
