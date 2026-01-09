
import { CoverOccurrence } from '@/types/club.types';
import { format } from 'date-fns';
import { X, Calendar as CalendarIcon, Clock, User, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface EventDetailsPanelProps {
    occurrence: CoverOccurrence | null;
    onClose: () => void;
}

export function EventDetailsPanel({ occurrence, onClose }: EventDetailsPanelProps) {
    if (!occurrence) {
        return (
            <div className="h-full flex items-center justify-center text-gray-400 p-8 border-l bg-gray-50/50">
                <div className="text-center">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>Select a session to view details</p>
                </div>
            </div>
        );
    }

    const { cover_rule } = occurrence;
    const clubName = cover_rule?.club?.club_name || 'Unknown Club';
    const schoolName = cover_rule?.school?.school_name || 'Unknown School';

    // Get assigned teacher from the assignments array
    const assignedTeacher = occurrence.assignments?.[0]?.teacher;
    const teacherName = assignedTeacher
        ? `${assignedTeacher.person_details.first_name} ${assignedTeacher.person_details.last_name}`
        : 'Unassigned';

    return (
        <div className="h-full bg-white border-l border-gray-100 flex flex-col shadow-xl shadow-gray-100/50 z-10 w-[400px]">
            {/* Header */}
            <div className="p-6 pb-2">
                <div className="flex justify-between items-start mb-1">
                    <h2 className="text-2xl font-bold text-gray-900">{clubName}</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 -mt-1 -mr-2">
                        <X className="w-4 h-4" />
                    </Button>
                </div>
                <p className="text-gray-500">{schoolName}</p>
            </div>

            <div className="px-6 py-4 space-y-4">
                {/* Date / Time */}
                <div className="space-y-3">
                    <div className="flex items-center gap-3 text-gray-700">
                        <CalendarIcon className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">{format(new Date(occurrence.meeting_date), 'EEEE, d MMM yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">
                            {cover_rule?.start_time.slice(0, 5)} - {cover_rule?.end_time.slice(0, 5)}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                        <User className="w-5 h-5 text-gray-400" />
                        <span className={cn("font-medium", !assignedTeacher && "text-orange-500 italic")}>
                            {teacherName}
                        </span>
                    </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2 pt-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200">Confirmed</Badge>
                </div>
            </div>

            <Separator />

            {/* Teacher Availability Section */}
            <div className="p-6 flex-1 overflow-y-auto">
                <h3 className="font-bold text-lg mb-4 text-gray-900">Teacher Availability (8)</h3>

                <div className="space-y-4">
                    {/* Mock Rows */}
                    <TeacherRow name="Mr. Smith" status="Accepted" statusColor="text-green-600" />
                    <TeacherRow name="Mrs. Jones" status="Declined" statusColor="text-orange-600" />
                    <TeacherRow name="Ms. Davis" status="No Response" statusColor="text-gray-400" />
                    <TeacherRow name="Mr. Wilson" status="No Response" statusColor="text-gray-400" />
                </div>
            </div>

            <Separator />

            {/* Notes */}
            <div className="p-6 bg-gray-50">
                <h3 className="font-bold text-lg mb-2 text-gray-900">Notes</h3>
                <div className="bg-white p-3 rounded border border-gray-200 text-sm text-gray-600 min-h-[80px]">
                    {occurrence.notes || "No notes for this session."}
                </div>
            </div>
        </div>
    );
}

function TeacherRow({ name, status, statusColor }: { name: string, status: string, statusColor: string }) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Avatar>
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} />
                    <AvatarFallback>{name[0]}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-gray-700">{name}</span>
            </div>
            <span className={`text-sm font-medium ${statusColor}`}>{status}</span>
        </div>
    )
}
