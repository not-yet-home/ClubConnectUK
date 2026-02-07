import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { format } from 'date-fns';
import {
    AlertCircle,
    Calendar as CalendarIcon,
    CheckCircle2,
    Clock,
    Mail,
    MapPin,
    MoreHorizontal,
    Pencil,
    Trash2,
    User,
} from 'lucide-react';

import { toast } from 'sonner';

import type { CoverOccurrence } from '@/types/club.types';

import { useDeleteCoverOccurrence } from '@/features/covers/api/mutations';
import { formatEventTime } from '@/features/covers/utils/formatters';


import { PageLayout } from '@/components/common/page-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/services/supabase';

export const Route = createFileRoute('/_protected/covers/$occurrenceId')({
    component: CoverDetailsPage,
});

function CoverDetailsPage() {
    const { occurrenceId } = Route.useParams();
    const navigate = useNavigate();


    const { data: occurrence, isLoading, error: queryError } = useQuery({
        queryKey: ['cover-occurrence', occurrenceId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('cover_occurrences')
                .select(`
                    id,
                    meeting_date,
                    notes,
                    cover_rule:cover_rules (
                        id,
                        start_time,
                        end_time,
                        frequency,
                        day_of_week,
                        club:clubs (
                            id,
                            club_name,
                            description
                        ),
                        school:schools (
                            id,
                            school_name
                        )
                    ),
                    assignments:teacher_cover_assignments (
                        id,
                        status,
                        teacher:teachers (
                            id,
                            person_details (
                                first_name,
                                last_name
                            )
                        )
                    )
                `)
                .eq('id', occurrenceId)
                .single();

            if (error) throw error;
            return data as unknown as CoverOccurrence;
        },
    });

    const deleteOccurrence = useDeleteCoverOccurrence();

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this cover session?")) return;

        try {
            await deleteOccurrence.mutateAsync(occurrenceId);
            toast.success("Cover session deleted");
            navigate({ to: '/covers' });
        } catch (err) {
            console.error("Failed to delete", err);
            toast.error("Failed to delete cover session");
        }
    };

    if (isLoading) {
        return (
            <PageLayout breadcrumbs={[{ label: 'Covers Scheduling', href: '/covers' }, { label: 'Loading...' }]}>
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
            </PageLayout>
        );
    }

    if (queryError || !occurrence) {
        return (
            <PageLayout breadcrumbs={[{ label: 'Covers Scheduling', href: '/covers' }, { label: 'Error' }]}>
                <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                    <AlertCircle className="h-12 w-12 text-destructive" />
                    <h2 className="text-xl font-semibold">Cover session not found</h2>
                    <p className="text-gray-500">The requested cover session could not be found or you don't have permission to view it.</p>
                    <Button onClick={() => navigate({ to: '/covers' })}>Back to Calendar</Button>
                </div>
            </PageLayout>
        );
    }

    const { cover_rule } = occurrence;
    const clubName = cover_rule?.club?.club_name || 'Unknown Club';
    const schoolName = cover_rule?.school?.school_name || 'Unknown School';

    // Determine status color
    const assignment = occurrence.assignments?.[0];
    const currentStatus = assignment?.status || 'unassigned';

    const getStatusBadge = (s: string) => {
        switch (s) {
            case 'confirmed':
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Confirmed</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200 gap-1.5"><Clock className="w-3.5 h-3.5" /> Pending Response</Badge>;
            case 'declined':
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200 gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> Declined</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200 gap-1.5"><User className="w-3.5 h-3.5" /> Unassigned</Badge>;
        }
    };

    const teacher = assignment?.teacher;
    const teacherName = teacher
        ? `${teacher.person_details.first_name} ${teacher.person_details.last_name}`
        : 'No teacher assigned';

    return (
        <PageLayout
            breadcrumbs={[
                { label: 'Covers Scheduling', href: '/covers' },
                { label: clubName }
            ]}
        >
            <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header Section */}
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{clubName}</h1>
                            {getStatusBadge(currentStatus)}
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                            <MapPin className="w-4 h-4" />
                            <span>{schoolName}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    <MoreHorizontal className="w-4 h-4 mr-2" />
                                    Actions
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => toast.info("Editing coming soon")}>
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Mail className="w-4 h-4 mr-2" />
                                    Resend Request
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={handleDelete}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Occurrence
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Session Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                            <CalendarIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Date</p>
                                            <p className="font-semibold text-gray-900">
                                                {format(new Date(occurrence.meeting_date), 'EEEE, MMMM d, yyyy')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                            <Clock className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Time</p>
                                            <p className="font-semibold text-gray-900">
                                                {formatEventTime(cover_rule?.start_time)} - {formatEventTime(cover_rule?.end_time)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="font-medium mb-2">Description</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {cover_rule?.club?.description || "No description available for this club."}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-medium mb-2">Notes</h3>
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm text-gray-600">
                                        {occurrence.notes || "No specific notes for this session."}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Teacher Details */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Assigned Teacher</CardTitle>
                                <CardDescription>Current assignment status</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4 mb-6">
                                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                        <AvatarFallback className="bg-blue-100 text-blue-700 text-lg">
                                            {teacherName[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold text-gray-900">{teacherName}</p>
                                        <p className="text-xs text-gray-500">Primary Teacher</p>
                                    </div>
                                </div>

                                {teacher ? (
                                    <div className="space-y-3">
                                        <Button className="w-full" variant="outline">
                                            <Mail className="w-4 h-4 mr-2" />
                                            Message Teacher
                                        </Button>
                                        <Button className="w-full" variant="outline">
                                            Re-assign
                                        </Button>
                                    </div>
                                ) : (
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                        <User className="w-4 h-4 mr-2" />
                                        Assign Teacher
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold">Teacher Availability</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Mock availability data */}
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            <span>Mr. Smith</span>
                                        </div>
                                        <span className="text-green-600 font-medium">Available</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                            <span>Mrs. Jones</span>
                                        </div>
                                        <span className="text-red-600 font-medium">Busy</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                                            <span>Ms. Davis</span>
                                        </div>
                                        <span>Unknown</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>


            </div>
        </PageLayout>
    );
}
