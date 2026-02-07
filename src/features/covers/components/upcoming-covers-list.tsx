import { format, isAfter, startOfDay } from 'date-fns';
import { HugeiconsIcon } from '@hugeicons/react';
import { Calendar02Icon, Clock01Icon, UserGroupIcon } from '@hugeicons/core-free-icons';
import { formatEventTime, getClubColors, parseLocalDate } from '../utils/formatters';
import type { CoverOccurrence } from '@/types/club.types';
import { ICON_SIZES } from '@/constants/sizes';
import { cn } from '@/lib/utils';

interface UpcomingCoversListProps {
    occurrences: Array<CoverOccurrence>;
    onSelectOccurrence: (occurrence: CoverOccurrence) => void;
}

export function UpcomingCoversList({ occurrences, onSelectOccurrence }: UpcomingCoversListProps) {
    const today = startOfDay(new Date());

    // Sort and filter upcoming occurrences
    const upcoming = occurrences
        .filter(occ => {
            const occDate = parseLocalDate(occ.meeting_date);
            return isAfter(startOfDay(occDate), today) ||
                format(occDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
        })
        .sort((a, b) => {
            const dateA = parseLocalDate(a.meeting_date).getTime();
            const dateB = parseLocalDate(b.meeting_date).getTime();
            return dateA - dateB;
        })
        .slice(0, 10);

    return (
        <div className="flex flex-col h-full">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 px-1 flex items-center gap-2">
                <HugeiconsIcon icon={Calendar02Icon} className={ICON_SIZES.sm + " text-primary"} />
                <span>Upcoming Covers</span>
            </h3>
            <div className="flex-1 -mx-4 px-4 overflow-y-auto">
                <div className="space-y-3 pb-4">
                    {upcoming.map((occ) => {
                        const clubName = occ.cover_rule?.club?.club_name || 'Cover';
                        const teacher = occ.assignments?.[0]?.teacher;
                        const teacherName = teacher
                            ? `${teacher.person_details.first_name} ${teacher.person_details.last_name}`
                            : 'Unassigned';

                        const colors = getClubColors(occ.cover_rule?.club?.club_name);
                        const displayDate = parseLocalDate(occ.meeting_date);

                        return (
                            <div
                                key={occ.id}
                                onClick={() => onSelectOccurrence(occ)}
                                className={cn(
                                    "p-3 rounded-lg border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-all group",
                                    colors.border,
                                    colors.bg
                                )}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className={cn("font-bold text-sm truncate group-hover:underline transition-colors", colors.text)}>
                                        {clubName}
                                    </h4>
                                    <div className={cn("h-2 w-2 rounded-full mt-1.5 shadow-sm", getStatusDotColor(occ))} />
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-700">
                                        <HugeiconsIcon icon={Calendar02Icon} className={ICON_SIZES.xs + " opacity-70"} />
                                        {format(displayDate, 'EEEE, MMM d, yyyy')}
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-700">
                                        <HugeiconsIcon icon={Clock01Icon} className={ICON_SIZES.xs + " opacity-70"} />
                                        {formatEventTime(occ.cover_rule?.start_time)} - {formatEventTime(occ.cover_rule?.end_time)}
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-gray-800 font-bold mt-1">
                                        <HugeiconsIcon icon={UserGroupIcon} className={ICON_SIZES.xs + " opacity-70"} />
                                        <span className={!teacher ? 'text-orange-700 italic' : ''}>
                                            {teacherName}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {upcoming.length === 0 && (
                        <div className="text-center py-10">
                            <p className="text-xs text-gray-400">No upcoming covers</p>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}


function getStatusDotColor(occ: CoverOccurrence): string {
    const status = occ.assignments?.[0]?.status;
    if (status === 'confirmed') return 'bg-green-500';
    if (status === 'pending') return 'bg-yellow-500';
    return 'bg-gray-300';
}
