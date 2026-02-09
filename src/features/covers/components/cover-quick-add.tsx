import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { addWeeks, format, getDay, set } from 'date-fns'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowDown01Icon,
  Calendar02Icon,
  CalendarSetting01Icon,
  Clock01Icon,
  Tick02Icon,
  UserEdit01Icon,
} from '@hugeicons/core-free-icons'

import type {
  CoverFrequency,
  CoverOccurrence,
  OccurrenceStatus,
  Priority,
} from '@/types/club.types'
import type { Teacher } from '@/types/teacher.types'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ICON_SIZES } from '@/constants/sizes'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { isDirty as checkIsDirty, cn } from '@/lib/utils'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

import { useSchools } from '@/hooks/use-schools'
import { DiscardChangesDialog } from '@/components/common/discard-changes-dialog'
import { useClubsBySchool } from '@/hooks/use-clubs'
import useTeachers from '@/hooks/use-teachers'
import {
  useCreateFullCoverRequest,
  useUpdateCoverRequest,
} from '@/features/covers/api/mutations'

interface CoverQuickAddProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  date: Date | null
  initialSchoolId?: string
  editingOccurrence?: CoverOccurrence | null
}

function StepperNav({ currentStep }: { currentStep: number }) {
  const steps = [
    { id: 1, label: 'Details', icon: UserEdit01Icon },
    { id: 2, label: 'Schedule', icon: CalendarSetting01Icon },
  ]

  return (
    <div className="w-full bg-muted/5 border-b p-4">
      <div className="relative flex items-start justify-between w-full max-w-md mx-auto px-8">
        {steps.map((step, index) => {
          const status =
            currentStep === step.id
              ? 'active'
              : currentStep > step.id
                ? 'completed'
                : 'pending'
          const StepIcon = step.icon
          const isLast = index === steps.length - 1

          return (
            <div key={step.id} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center relative z-10">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300',
                    status === 'completed' && 'bg-emerald-500 text-white',
                    status === 'active' && 'bg-primary text-primary-foreground shadow-lg',
                    status === 'pending' && 'bg-muted border-2 border-border text-muted-foreground',
                  )}
                >
                  {status === 'completed' ? (
                    <HugeiconsIcon icon={Tick02Icon} className={ICON_SIZES.sm} />
                  ) : (
                    <HugeiconsIcon icon={StepIcon} className={ICON_SIZES.sm} />
                  )}
                </div>
                <span
                  className={cn(
                    'text-[10px] font-bold mt-1 uppercase tracking-wider transition-colors duration-300',
                    status === 'pending' ? 'text-muted-foreground' : 'text-foreground',
                  )}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div className="flex-1 flex items-center px-2 pb-5">
                  <div
                    className={cn(
                      'h-0.5 w-full transition-colors duration-300',
                      currentStep > step.id ? 'bg-emerald-500' : 'bg-border',
                    )}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function CoverQuickAdd({
  open,
  onOpenChange,
  date,
  initialSchoolId,
  editingOccurrence,
}: CoverQuickAddProps) {
  // Navigation State
  const [step, setStep] = useState<number>(1)

  // Context State
  const [schoolId, setSchoolId] = useState<string>(
    initialSchoolId === 'all' ? '' : initialSchoolId || '',
  )
  const [clubId, setClubId] = useState<string>('')
  const [startTime, setStartTime] = useState<string>('09:00')
  const [endTime, setEndTime] = useState<string>('10:00')
  const [requestType, setRequestType] = useState<'one-off' | 'recurring'>(
    'one-off',
  )
  const [scheduleType, setScheduleType] = useState<'regular' | 'covers'>(
    'covers',
  )
  const [teacherId, setTeacherId] = useState<string>('unassigned')
  const [frequency, setFrequency] = useState<CoverFrequency>('weekly')
  const [occurrenceCount, setOccurrenceCount] = useState<number>(4)
  const [meetingDate, setMeetingDate] = useState<string>('')
  const [teacherSearch, setTeacherSearch] = useState<string>('')
  const [teacherOpen, setTeacherOpen] = useState(false)
  const [notes, setNotes] = useState<string>('')
  const [status, setStatus] = useState<string>('not_started')
  const [priority, setPriority] = useState<string>('medium')
  const [showExitWarning, setShowExitWarning] = useState(false)

  // Initial State Tracking (to detect "dirty" state)
  const [initialState, setInitialState] = useState<any>(null)

  const isDirty = useMemo(() => {
    if (!initialState) return false
    const current = {
      schoolId,
      clubId,
      startTime,
      endTime,
      requestType,
      scheduleType,
      teacherId,
      frequency,
      occurrenceCount,
      meetingDate,
      notes,
      status,
      priority,
    }
    return checkIsDirty(current, initialState)
  }, [
    initialState,
    schoolId,
    clubId,
    startTime,
    endTime,
    requestType,
    scheduleType,
    teacherId,
    frequency,
    occurrenceCount,
    meetingDate,
    notes,
    status,
    priority,
  ])

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
    return teachers.filter((t: Teacher) => {
      const firstName = t.person_details.first_name.toLowerCase()
      const lastName = t.person_details.last_name.toLowerCase()
      const fullName = `${firstName} ${lastName} `

      // Match at word boundaries - start of first name, last name, or full name
      const words = fullName.split(' ')
      return words.some((word) => word.startsWith(search))
    })
  }, [teachers, teacherSearch])

  const getTeacherName = (id: string) => {
    if (id === 'unassigned') return 'Unassigned (Pool)'
    const teacher = teachers?.find((t: Teacher) => t.id === id)
    if (teacher) {
      return `${teacher.person_details.first_name} ${teacher.person_details.last_name}`
    }
    return 'Select Teacher'
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
    const dt = set(dateObj, {
      hours: h,
      minutes: m,
      seconds: 0,
      milliseconds: 0,
    })
    return format(dt, 'h:mm a')
  }

  useEffect(() => {
    if (open) {
      setStep(1)
      if (editingOccurrence) {
        setSchoolId(editingOccurrence.cover_rule?.school_id || '')
        setClubId(editingOccurrence.cover_rule?.club_id || '')
        // Extract HH:mm from HH:mm:ss format
        const startTimeStr = editingOccurrence.cover_rule?.start_time || '09:00'
        const endTimeStr = editingOccurrence.cover_rule?.end_time || '10:00'
        setStartTime(startTimeStr.substring(0, 5))
        setEndTime(endTimeStr.substring(0, 5))
        setTeacherId(
          editingOccurrence.assignments?.[0]?.teacher_id || 'unassigned',
        )
        setFrequency(editingOccurrence.cover_rule?.frequency || 'weekly')
        // Heuristic: If we are editing, default to 'one-off' view unless we explicitly want to support series edit in UI
        // For now, let's just show the current values.
        setRequestType('one-off')
        setMeetingDate(
          editingOccurrence.meeting_date
            ? format(new Date(editingOccurrence.meeting_date), 'yyyy-MM-dd')
            : '',
        )
        setNotes(editingOccurrence.notes || '')
        setStatus(editingOccurrence.status)
        setPriority(editingOccurrence.priority)
        setScheduleType('covers') // Default to covers view for editing
      } else {
        setSchoolId(initialSchoolId === 'all' ? '' : initialSchoolId || '')
        setClubId('')
        setStartTime('09:00')
        setEndTime('10:00')
        setRequestType('one-off')
        setTeacherId('unassigned')
        setFrequency('weekly')
        setOccurrenceCount(4)
        setMeetingDate(date ? format(date, 'yyyy-MM-dd') : '')
        setNotes('')
        setStatus('not_started')
        setPriority('medium')
      }

      // Capture initial state for dirty check
      const state = editingOccurrence
        ? {
          schoolId: editingOccurrence.cover_rule?.school_id || '',
          clubId: editingOccurrence.cover_rule?.club_id || '',
          startTime: (editingOccurrence.cover_rule?.start_time || '09:00').substring(0, 5),
          endTime: (editingOccurrence.cover_rule?.end_time || '10:00').substring(0, 5),
          requestType: 'one-off',
          scheduleType: 'covers',
          teacherId: editingOccurrence.assignments?.[0]?.teacher_id || 'unassigned',
          frequency: editingOccurrence.cover_rule?.frequency || 'weekly',
          occurrenceCount: 4,
          meetingDate: editingOccurrence.meeting_date
            ? format(new Date(editingOccurrence.meeting_date), 'yyyy-MM-dd')
            : '',
          notes: editingOccurrence.notes || '',
          status: editingOccurrence.status,
          priority: editingOccurrence.priority,
        }
        : {
          schoolId: initialSchoolId === 'all' ? '' : initialSchoolId || '',
          clubId: '',
          startTime: '09:00',
          endTime: '10:00',
          requestType: 'one-off',
          scheduleType: 'covers',
          teacherId: 'unassigned',
          frequency: 'weekly',
          occurrenceCount: 4,
          meetingDate: date ? format(date, 'yyyy-MM-dd') : '',
          notes: '',
          status: 'not_started',
          priority: 'medium',
        }
      setInitialState(state)
    } else {
      setInitialState(null)
      setShowExitWarning(false)
    }
  }, [open, initialSchoolId, date, editingOccurrence])

  const handleSubmit = async () => {
    if (!meetingDate) return
    if (!schoolId || !clubId) {
      toast.error('Please select a school and club')
      return
    }

    try {
      const dayOfOccurence = getDay(new Date(meetingDate))

      if (editingOccurrence) {
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
        toast.success('Cover request updated')
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

        await createRequest.mutateAsync(payload)
        toast.success('Cover request created')
      }
      onOpenChange(false)
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      toast.error(
        `Failed to ${editingOccurrence ? 'update' : 'create'} request: ${errorMessage}`,
      )
      console.error(error)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && isDirty) {
      setShowExitWarning(true)
      return
    }
    onOpenChange(newOpen)
  }

  if (!date) return null

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="sm:max-w-[520px] w-[35vw] p-0 gap-0 overflow-hidden shadow-2xl"
          aria-describedby={undefined}
        >
          <DialogHeader className="px-6 py-4 flex flex-row items-center justify-between border-b bg-muted/5">
            <DialogTitle className="text-xl font-semibold text-foreground/90 flex items-center gap-2">
              {editingOccurrence
                ? 'Edit Cover Request'
                : 'New Cover Request'}
            </DialogTitle>
          </DialogHeader>

          <StepperNav currentStep={step} />

          <div className="px-8 py-6 max-h-[60vh] overflow-y-auto">
            {step === 1 ? (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    Schedule Type
                  </Label>
                  <div className="flex bg-muted/50 rounded-lg p-1 w-fit border">
                    <button
                      type="button"
                      onClick={() => setScheduleType('regular')}
                      className={`px-6 py-2 text-sm font-semibold rounded-md transition-all ${scheduleType === 'regular' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      Regular
                    </button>
                    <button
                      type="button"
                      onClick={() => setScheduleType('covers')}
                      className={`px-6 py-2 text-sm font-semibold rounded-md transition-all ${scheduleType === 'covers' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      Cover
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="school-select" className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                      School
                    </Label>
                    <Select
                      value={schoolId}
                      onValueChange={(v) => {
                        setSchoolId(v)
                        setClubId('')
                      }}
                    >
                      <SelectTrigger size="full" id="school-select">
                        <SelectValue placeholder="Select School" />
                      </SelectTrigger>
                      <SelectContent>
                        {schools?.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.school_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="club-select" className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                      Club or Activity
                    </Label>
                    <Select
                      value={clubId}
                      onValueChange={setClubId}
                      disabled={!schoolId || clubsLoading}
                    >
                      <SelectTrigger size="full" id="club-select">
                        <SelectValue
                          placeholder={!schoolId ? 'Select School First' : 'Select Club'}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {clubs?.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.club_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    Teacher
                  </Label>
                  <Popover open={teacherOpen} onOpenChange={setTeacherOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        disabled={teachersLoading}
                        className="w-full justify-between font-normal"
                      >
                        <span className="truncate">{getTeacherName(teacherId)}</span>
                        <HugeiconsIcon icon={ArrowDown01Icon} className={cn(ICON_SIZES.sm, "opacity-50 shrink-0 ml-2")} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
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
                                setTeacherId('unassigned')
                                setTeacherOpen(false)
                                setTeacherSearch('')
                              }}
                              className="cursor-pointer"
                            >
                              Unassigned (Pool)
                            </CommandItem>
                            {filteredTeachers.map((t) => (
                              <CommandItem
                                key={t.id}
                                value={`${t.person_details.first_name} ${t.person_details.last_name}`}
                                onSelect={() => {
                                  setTeacherId(t.id)
                                  setTeacherOpen(false)
                                  setTeacherSearch('')
                                }}
                                className="cursor-pointer"
                              >
                                {t.person_details.first_name}{' '}
                                {t.person_details.last_name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    Description
                  </Label>
                  <Textarea
                    placeholder="Add details about this cover..."
                    className="min-h-[100px]"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                      Date
                    </Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="meeting-date"
                        type="date"
                        value={meetingDate}
                        onChange={(e) => setMeetingDate(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                      Time
                    </Label>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-1 items-center gap-3">
                        <Input
                          id="start-time"
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="text-center"
                        />
                        <span className="text-muted-foreground/40 font-bold text-xs uppercase tracking-tighter">to</span>
                        <Input
                          id="end-time"
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="text-center"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                      Repeat Settings
                    </Label>
                  </div>
                  <div className="flex items-center gap-4">
                    <Select
                      value={requestType}
                      onValueChange={(v: 'one-off' | 'recurring') => setRequestType(v)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="one-off">Does not repeat</SelectItem>
                        <SelectItem value="recurring">Repeats custom...</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {requestType === 'recurring' && (
                      <div className="flex items-center gap-3">
                        <Select
                          value={frequency}
                          onValueChange={(v: CoverFrequency) => setFrequency(v)}
                        >
                          <SelectTrigger className="flex">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex items-center gap-1.5 px-3 py-2 rounded-md border h-10">
                          <span className="text-xs text-muted-foreground font-bold">×</span>
                          <Input
                            type="number"
                            min={2}
                            max={12}
                            className="w-8 h-6 p-0 bg-transparent text-center font-bold"
                            value={occurrenceCount}
                            onChange={(e) => setOccurrenceCount(parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                    )}
                  {requestType === 'recurring' && (
                    <div className="bg-muted/30 rounded-lg p-4 border space-y-3">
                      <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
                        Occurrence Preview
                      </p>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                        {meetingDate ? (
                          occurrenceDates.slice(0, 8).map((d, idx) => (
                            <div key={idx} className="text-xs flex items-center justify-between group">
                              <div className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-emerald-500/50 group-hover:bg-emerald-500 transition-colors" />
                                <span className="font-medium text-foreground/70 uppercase text-[10px] tracking-tight whitespace-nowrap">
                                  {format(d, 'eee, MMM d')}
                                </span>
                              </div>
                              <span className="text-[9px] font-bold text-muted-foreground/60 tabular-nums">
                                {formatTimeForDate(d, startTime)}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs italic text-muted-foreground col-span-2">Pick a start date to see preview</p>
                        )}
                      </div>
                      {occurrenceCount > 8 && (
                        <p className="text-[9px] text-muted-foreground/50 italic pt-1 border-t border-muted-foreground/10">
                          + {occurrenceCount - 8} more occurrences
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-8 pt-4 border-t">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                      Progress
                    </Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className="capitalize">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_started">Not Started</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                      Priority
                    </Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger className="capitalize">
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
              </div>
            )}
          </div>

          <DialogFooter className="px-8 py-5 border-t bg-muted/5 flex items-center justify-between sm:justify-between w-full">
            {step === 2 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(1)}
                className="text-muted-foreground hover:text-foreground font-bold uppercase tracking-wider text-[10px]"
              >
                Back
              </Button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-3">
              {step === 1 ? (
                <Button
                  size="sm"
                  onClick={() => setStep(2)}
                  className="px-8 font-bold uppercase tracking-widest text-[11px]"
                >
                  Next
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={createRequest.isPending || updateRequest.isPending}
                  className="px-8 font-bold uppercase tracking-widest text-[11px]"
                >
                  {createRequest.isPending || updateRequest.isPending ? 'Saving...' : 'Save'}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DiscardChangesDialog
        open={showExitWarning}
        onConfirm={() => {
          setShowExitWarning(false)
          onOpenChange(false)
        }}
        onCancel={() => setShowExitWarning(false)}
      />
    </>
  )
}
