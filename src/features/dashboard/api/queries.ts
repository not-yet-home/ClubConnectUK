import { useQuery } from '@tanstack/react-query'
import type { CoverOccurrence } from '@/types/club.types'
import { supabase } from '@/services/supabase'

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    queryFn: async () => {
      const [clubsCount, teachersCount, messagesStats] = await Promise.all([
        supabase.from('clubs').select('*', { count: 'exact', head: true }),
        supabase
          .from('cover_occurrences')
          .select('id', { count: 'exact', head: true }),

        supabase
          .from('teachers')
          .select('*', { count: 'exact', head: true })
          .eq('is_blocked', false),

        supabase
          .from('messages')
          .select('status', { count: 'exact' })
          .gte(
            'created_at',
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          ),
        supabase
          .from('messages')
          .select('status', { count: 'exact' })
          .gte(
            'created_at',
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          ),
      ])

      // For open covers, we need a better check than just count of occurrences
      // Let's get count of assignments with status 'pending' or 'invited'
      const { count: pendingAssignments } = await supabase
        .from('teacher_cover_assignments')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'invited'])

      // Message Success Rate calculation
      const totalMessages = messagesStats.count || 0
      const successMessages =
        messagesStats.data?.filter(
          (m: { status: string }) => m.status === 'delivered',
        ).length || 0
      const successRate =
        totalMessages > 0 ? (successMessages / totalMessages) * 100 : 100

      return {
        totalClubs: clubsCount.count || 0,
        openCovers: pendingAssignments || 0,
        activeTeachers: teachersCount.count || 0,
        messageSuccessRate: successRate.toFixed(1) + '%',
      }
    },
  })
}

export const useUpcomingAgenda = () => {
  return useQuery<Array<CoverOccurrence>>({
    queryKey: ['upcoming-agenda'],
    staleTime: 2 * 60 * 1000, // 2 minutes
    queryFn: async () => {
      const today = new Date().toISOString()
      const sevenDaysFromNow = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      ).toISOString()

      const { data, error } = await supabase
        .from('cover_occurrences')
        .select(
          `
                    id,
                    meeting_date,
                    notes,
                    cover_rule:cover_rule_id (
                        start_time,
                        end_time,
                        club:club_id (club_name, club_code)
                    ),
                    assignments:teacher_cover_assignments (
                        status,
                        teacher:teacher_id (
                            persons_details:persons_details_id (first_name, last_name)
                        )
                    )
                `,
        )
        .gte('meeting_date', today)
        .lte('meeting_date', sevenDaysFromNow)
        .order('meeting_date', { ascending: true })
        .limit(10)

      if (error) throw error
      return data
    },
  })
}
