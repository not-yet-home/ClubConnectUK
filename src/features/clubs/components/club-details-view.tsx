import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { Club, CoverRule, CoverOccurrence } from "@/types/club.types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { HugeiconsIcon } from "@hugeicons/react"
import { Edit02Icon, ArrowLeft02Icon, Clock01Icon, UserMultiple02Icon, Settings01Icon } from "@hugeicons/core-free-icons"
import { ICON_SIZES } from "@/constants/sizes"
import { CoverRulesManager } from "./cover-rules-manager"
import { ClubFormDialog } from "./club-form-dialog"
import { PageLayout } from "@/components/common/page-layout"

interface ClubDetailsViewProps {
    club: Club
    coverRules: CoverRule[]
    upcomingMeetings: CoverOccurrence[]
    isLoadingRules: boolean
    isLoadingMeetings: boolean
}

export function ClubDetailsView({
    club,
    coverRules,
    upcomingMeetings,
    isLoadingRules,
    isLoadingMeetings
}: ClubDetailsViewProps) {
    const navigate = useNavigate()
    const [isEditClubOpen, setIsEditClubOpen] = useState(false)

    const handleBack = () => {
        navigate({ to: '/clubs/club-list' })
    }

    const formatMeetingDate = (occurrence: CoverOccurrence) => {
        const date = new Date(occurrence.meeting_date)
        return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    }

    const formatTime = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':')
        const h = parseInt(hours, 10)
        const ampm = h >= 12 ? 'PM' : 'AM'
        const h12 = h % 12 || 12
        return `${h12}:${minutes} ${ampm}`
    }

    return (
        <>
            <PageLayout
                breadcrumbs={[{ label: 'Clubs', href: '/_protected/clubs/club-list' }, { label: club.club_name }]}
                className="lg:p-10 space-y-8"
            >
                {/* Top Actions */}
                <div className="mx-auto max-w-6xl">
                    <Button onClick={handleBack} variant="ghost" size="sm" className="-ml-3 mb-8 text-muted-foreground">
                        <HugeiconsIcon icon={ArrowLeft02Icon} className={ICON_SIZES.md} />
                        Back to Clubs
                    </Button>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Club Info & Stats */}
                        <div className="space-y-6 lg:col-span-2">
                            <Card className="border-none shadow-md">
                                <CardHeader className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0 p-8">
                                    <div className="space-y-1">
                                        <CardTitle className="text-2xl flex flex-wrap items-center gap-3">
                                            {club.club_name}
                                            <Badge variant={club.status === 'active' ? 'default' : 'secondary'}>
                                                {club.status}
                                            </Badge>
                                        </CardTitle>
                                        <CardDescription>
                                            {club.school?.school_name} • Code: {club.club_code}
                                        </CardDescription>
                                    </div>
                                    <Button onClick={() => setIsEditClubOpen(true)} variant="outline" size="sm" className="w-full sm:w-auto">
                                        <HugeiconsIcon icon={Edit02Icon} className={ICON_SIZES.md} />
                                        Edit
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-8 p-8">
                                    {club.description && (
                                        <div>
                                            <h4 className="text-sm font-medium mb-2 text-muted-foreground">About</h4>
                                            <p className="text-sm leading-relaxed">{club.description}</p>
                                        </div>
                                    )}

                                    <div className="flex gap-6">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <div className="p-2 bg-secondary rounded-full">
                                                <HugeiconsIcon icon={UserMultiple02Icon} className={ICON_SIZES.md} />
                                            </div>
                                            <span>{club.members_count} Members</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Cover Rules Manager */}
                            <Card className="border-none shadow-md">
                                <CardHeader className="p-8">
                                    <CardTitle className="flex items-center gap-2">
                                        <HugeiconsIcon icon={Settings01Icon} className={ICON_SIZES.md} />
                                        Configuration
                                    </CardTitle>
                                    <CardDescription>Manage schedule and settings</CardDescription>
                                </CardHeader>
                                <CardContent className="p-8 pt-0">
                                    <CoverRulesManager
                                        clubId={club.id}
                                        schoolId={club.school_id}
                                        rules={coverRules}
                                        isLoading={isLoadingRules}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column: Upcoming & Activity */}
                        <div className="space-y-6">
                            <Card className="h-full border-none shadow-md">
                                <CardHeader className="p-8">
                                    <CardTitle>Upcoming Sessions</CardTitle>
                                    <CardDescription>Next scheduled meetings</CardDescription>
                                </CardHeader>
                                <CardContent className="p-8 pt-0">
                                    {isLoadingMeetings ? (
                                        <div className="space-y-4">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="flex flex-col gap-2">
                                                    <Skeleton className="h-4 w-3/4" />
                                                    <Skeleton className="h-3 w-1/2" />
                                                </div>
                                            ))}
                                        </div>
                                    ) : upcomingMeetings && upcomingMeetings.length > 0 ? (
                                        <div className="space-y-4">
                                            {upcomingMeetings.map((meeting) => (
                                                <div key={meeting.id} className="relative pl-4 border-l-2 border-muted pb-4 last:pb-0">
                                                    <div className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-sm font-medium">{formatMeetingDate(meeting)}</span>
                                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                            <HugeiconsIcon icon={Clock01Icon} className={ICON_SIZES.xs} />
                                                            {meeting.cover_rule && (
                                                                <span>{formatTime(meeting.cover_rule.start_time.slice(0, 5))} - {formatTime(meeting.cover_rule.end_time.slice(0, 5))}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-16 px-6 rounded-xl bg-secondary/10 border border-dashed border-secondary/30 text-muted-foreground">
                                            <div className="bg-background p-3 rounded-full w-fit mx-auto mb-4 shadow-sm">
                                                <HugeiconsIcon icon={Clock01Icon} className="w-8 h-8 opacity-30" />
                                            </div>
                                            <p className="font-medium">No upcoming sessions</p>
                                            <p className="text-xs text-muted-foreground mt-1">Scheduled meetings will appear here</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </PageLayout>

            <ClubFormDialog
                open={isEditClubOpen}
                onOpenChange={setIsEditClubOpen}
                club={club}
            />
        </>
    )
}
