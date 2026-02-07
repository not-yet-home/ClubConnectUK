import { format } from 'date-fns'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Calendar02Icon,
  Cancel01Icon,
  Clock01Icon,
  Tick01Icon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons'
import type { CoverOccurrence } from '@/types/club.types'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatEventTime } from '@/features/covers/utils/formatters'
import { cn } from '@/lib/utils'
import { ICON_SIZES } from '@/constants/sizes'

interface EventDetailsPanelProps {
  occurrence: CoverOccurrence | null
  onClose: () => void
}

export function EventDetailsPanel({
  occurrence,
  onClose,
}: EventDetailsPanelProps) {
  if (!occurrence) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 p-8 border-l bg-gray-50/50">
        <div className="text-center">
          <HugeiconsIcon
            icon={Calendar02Icon}
            className="w-12 h-12 mx-auto mb-3 opacity-20"
          />
          <p>Select a session to view details</p>
        </div>
      </div>
    )
  }

  const { cover_rule } = occurrence
  const clubName = cover_rule?.club?.club_name || 'Unknown Club'
  const schoolName = cover_rule?.school?.school_name || 'Unknown School'

  // Get assigned teacher from the assignments array
  const assignedTeacher = occurrence.assignments?.[0]?.teacher
  const teacherName = assignedTeacher
    ? `${assignedTeacher.person_details.first_name} ${assignedTeacher.person_details.last_name}`
    : 'Unassigned'

  return (
    <div className="h-full bg-white border-l border-gray-100 flex flex-col shadow-xl shadow-gray-100/50 z-10 w-[400px]">
      {/* Header */}
      <div className="p-6 pb-2">
        <div className="flex justify-between items-start mb-1">
          <h2 className="text-2xl font-bold text-gray-900">{clubName}</h2>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="-mt-1 -mr-2"
          >
            <HugeiconsIcon icon={Cancel01Icon} className={ICON_SIZES.xs} />
          </Button>
        </div>
        <p className="text-gray-500">{schoolName}</p>
      </div>

      <div className="px-6 py-4 space-y-4">
        {/* Date / Time */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-gray-700">
            <HugeiconsIcon
              icon={Calendar02Icon}
              className={ICON_SIZES.sm + ' text-gray-400'}
            />
            <span className="font-medium">
              {format(new Date(occurrence.meeting_date), 'EEEE, d MMM yyyy')}
            </span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <HugeiconsIcon
              icon={Clock01Icon}
              className={ICON_SIZES.sm + ' text-gray-400'}
            />
            <span className="font-medium">
              {formatEventTime(cover_rule?.start_time)} -{' '}
              {formatEventTime(cover_rule?.end_time)}
            </span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <HugeiconsIcon
              icon={UserGroupIcon}
              className={ICON_SIZES.sm + ' text-gray-400'}
            />
            <span
              className={cn(
                'font-medium',
                !assignedTeacher && 'text-orange-500 italic',
              )}
            >
              {teacherName}
            </span>
          </div>
        </div>

        {/* Progress & Priority Badges */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <div className="flex items-center gap-2">
            {occurrence.status === 'completed' ? (
              <HugeiconsIcon
                icon={Tick01Icon}
                className={ICON_SIZES.sm + ' text-green-500'}
              />
            ) : (
              <HugeiconsIcon
                icon={Clock01Icon}
                className={cn(
                  ICON_SIZES.sm,
                  occurrence.status === 'in_progress'
                    ? 'text-blue-500'
                    : 'text-gray-400',
                )}
              />
            )}
            <Badge
              variant="secondary"
              className={cn(
                'capitalize',
                occurrence.status === 'completed' &&
                  'bg-green-100 text-green-700 hover:bg-green-200',
                occurrence.status === 'in_progress' &&
                  'bg-blue-100 text-blue-700 hover:bg-blue-200',
                occurrence.status === 'not_started' &&
                  'bg-gray-100 text-gray-700 hover:bg-gray-200',
              )}
            >
              {occurrence.status.replace('_', ' ')}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                'capitalize px-2 py-0.5',
                occurrence.priority === 'high' &&
                  'border-red-200 text-red-700 bg-red-50',
                occurrence.priority === 'medium' &&
                  'border-amber-200 text-amber-700 bg-amber-50',
                occurrence.priority === 'low' &&
                  'border-blue-200 text-blue-700 bg-blue-50',
              )}
            >
              {occurrence.priority} Priority
            </Badge>
          </div>
        </div>
      </div>

      <Separator />

      {/* Teacher Availability Section */}
      <div className="p-6 flex-1 overflow-y-auto">
        <h3 className="font-bold text-lg mb-4 text-gray-900">
          Teacher Availability (8)
        </h3>

        <div className="space-y-4">
          {/* Mock Rows */}
          <TeacherRow
            name="Mr. Smith"
            status="Accepted"
            statusColor="text-green-600"
          />
          <TeacherRow
            name="Mrs. Jones"
            status="Declined"
            statusColor="text-orange-600"
          />
          <TeacherRow
            name="Ms. Davis"
            status="No Response"
            statusColor="text-gray-400"
          />
          <TeacherRow
            name="Mr. Wilson"
            status="No Response"
            statusColor="text-gray-400"
          />
        </div>
      </div>

      <Separator />

      {/* Notes */}
      <div className="p-6 bg-gray-50">
        <h3 className="font-bold text-lg mb-2 text-gray-900">Notes</h3>
        <div className="bg-white p-3 rounded border border-gray-200 text-sm text-gray-600 min-h-[80px]">
          {occurrence.notes || 'No notes for this session.'}
        </div>
      </div>
    </div>
  )
}

function TeacherRow({
  name,
  status,
  statusColor,
}: {
  name: string
  status: string
  statusColor: string
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`}
          />
          <AvatarFallback>{name[0]}</AvatarFallback>
        </Avatar>
        <span className="font-medium text-gray-700">{name}</span>
      </div>
      <span className={`text-sm font-medium ${statusColor}`}>{status}</span>
    </div>
  )
}
