import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AppHeader } from '@/components/app-header'
import { useClub, useClubCoverRules, useClubUpcomingMeetings } from '@/hooks/use-clubs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { HugeiconsIcon } from '@hugeicons/react'
import { Edit02Icon, Add01Icon, ArrowLeft02Icon, Calendar03Icon, Clock01Icon, UserMultiple02Icon } from '@hugeicons/core-free-icons'
import { ICON_SIZES } from '@/constants/sizes'
import type { CoverRule, CoverOccurrence } from '@/types/club.types'

export const Route = createFileRoute('/_protected/clubs/$clubId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { clubId } = Route.useParams()
  const navigate = useNavigate()
  const { data: club, isLoading: clubLoading } = useClub(clubId)
  const { data: coverRules, isLoading: rulesLoading } = useClubCoverRules(clubId)
  const { data: upcomingMeetings, isLoading: meetingsLoading } = useClubUpcomingMeetings(clubId)

  const handleBack = () => {
    navigate({ to: '/clubs/club-list' })
  }

  const handleEditClub = () => {
    // TODO: Open edit club modal/sheet
    console.log('Edit club:', club)
  }

  const handleAddCoverRule = () => {
    // TODO: Open add cover rule modal
    console.log('Add cover rule')
  }

  if (clubLoading) {
    return (
      <>
        <AppHeader breadcrumbs={[{ label: 'Clubs', href: '/_protected/clubs/club-list' }, { label: 'Loading...' }]} />
        <main className="flex-1 overflow-auto p-6 bg-background">
          <p>Loading club details...</p>
        </main>
      </>
    )
  }

  if (!club) {
    return (
      <>
        <AppHeader breadcrumbs={[{ label: 'Clubs', href: '/_protected/clubs/club-list' }, { label: 'Not Found' }]} />
        <main className="flex-1 overflow-auto p-6 bg-background">
          <p>Club not found.</p>
          <Button onClick={handleBack} variant="outline" className="mt-4">
            <HugeiconsIcon icon={ArrowLeft02Icon} className={ICON_SIZES.md} />
            Back to Clubs
          </Button>
        </main>
      </>
    )
  }

  const formatDayTime = (rule: CoverRule) => {
    const day = rule.day_of_week.charAt(0).toUpperCase() + rule.day_of_week.slice(1)
    return `${day}s, ${rule.start_time.slice(0, 5)} - ${rule.end_time.slice(0, 5)}`
  }

  const formatMeetingDate = (occurrence: CoverOccurrence) => {
    const date = new Date(occurrence.meeting_date)
    return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <>
      <AppHeader breadcrumbs={[{ label: 'Clubs', href: '/_protected/clubs/club-list' }, { label: club.club_name }]} />
      <main className="flex-1 overflow-auto p-6 bg-background">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Club Header */}
          <Card>
            <CardHeader className="flex flex-row justify-between items-start">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-2xl">{club.club_name}</CardTitle>
                  <Badge variant={club.status === 'active' ? 'default' : 'secondary'}>
                    {club.status}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-4">
                  <span>Code: <strong>{club.club_code}</strong></span>
                  {club.school && <span>School: <strong>{club.school.school_name}</strong></span>}
                </CardDescription>
              </div>
              <Button onClick={handleEditClub} variant="outline">
                <HugeiconsIcon icon={Edit02Icon} className={ICON_SIZES.md} />
                Edit Club
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <HugeiconsIcon icon={UserMultiple02Icon} className={ICON_SIZES.lg} />
                  <span>{club.members_count} Members</span>
                </div>
                {club.description && (
                  <p className="md:col-span-2 text-muted-foreground">{club.description}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cover Rules Section */}
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle>Cover Rules</CardTitle>
                <CardDescription>Recurring meeting schedules for this club</CardDescription>
              </div>
              <Button onClick={handleAddCoverRule} size="sm">
                <HugeiconsIcon icon={Add01Icon} className={ICON_SIZES.md} />
                Add Rule
              </Button>
            </CardHeader>
            <CardContent>
              {rulesLoading ? (
                <p>Loading cover rules...</p>
              ) : coverRules && coverRules.length > 0 ? (
                <div className="space-y-3">
                  {coverRules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <HugeiconsIcon icon={Calendar03Icon} className={ICON_SIZES.lg + " text-muted-foreground"} />
                        <div>
                          <p className="font-medium">{formatDayTime(rule)}</p>
                          <p className="text-sm text-muted-foreground capitalize">{rule.frequency}</p>
                        </div>
                      </div>
                      <Badge variant={rule.status === 'active' ? 'default' : 'secondary'}>
                        {rule.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No cover rules defined yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Meetings Section */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Meetings</CardTitle>
              <CardDescription>Next scheduled occurrences</CardDescription>
            </CardHeader>
            <CardContent>
              {meetingsLoading ? (
                <p>Loading upcoming meetings...</p>
              ) : upcomingMeetings && upcomingMeetings.length > 0 ? (
                <div className="space-y-3">
                  {upcomingMeetings.map((meeting) => (
                    <div key={meeting.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <HugeiconsIcon icon={Clock01Icon} className={ICON_SIZES.lg + " text-muted-foreground"} />
                        <div>
                          <p className="font-medium">{formatMeetingDate(meeting)}</p>
                          {meeting.cover_rule && (
                            <p className="text-sm text-muted-foreground">
                              {meeting.cover_rule.start_time.slice(0, 5)} - {meeting.cover_rule.end_time.slice(0, 5)}
                            </p>
                          )}
                        </div>
                      </div>
                      {meeting.notes && (
                        <p className="text-sm text-muted-foreground max-w-xs truncate">{meeting.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No upcoming meetings scheduled.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
