import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { PageLayout } from '@/components/common/page-layout'
import { useClub, useClubCoverRules, useClubUpcomingMeetings } from '@/hooks/use-clubs'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft02Icon } from '@hugeicons/core-free-icons'
import { ICON_SIZES } from '@/constants/sizes'
import { ClubDetailsView } from '@/features/clubs/components/club-details-view'

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

  if (clubLoading) {
    return (
      <PageLayout breadcrumbs={[{ label: 'Clubs', href: '/_protected/clubs/club-list' }, { label: 'Loading...' }]}>
        <p>Loading club details...</p>
      </PageLayout>
    )
  }

  if (!club) {
    return (
      <PageLayout breadcrumbs={[{ label: 'Clubs', href: '/_protected/clubs/club-list' }, { label: 'Not Found' }]}>
        <p>Club not found.</p>
        <Button onClick={handleBack} variant="outline" className="mt-4">
          <HugeiconsIcon icon={ArrowLeft02Icon} className={ICON_SIZES.md} />
          Back to Clubs
        </Button>
      </PageLayout>
    )
  }

  return (
    <ClubDetailsView
      club={club}
      coverRules={coverRules ?? []}
      upcomingMeetings={upcomingMeetings ?? []}
      isLoadingRules={rulesLoading}
      isLoadingMeetings={meetingsLoading}
    />
  )
}
