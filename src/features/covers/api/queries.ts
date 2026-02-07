import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'

export const useAvailableCovers = () => {
  return useQuery({
    queryKey: ['available-covers'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]

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
                        school:school_id (school_name),
                        club:club_id (club_name)
                    )
                `,
        )
        .gte('meeting_date', today)
        .order('meeting_date', { ascending: true })
        .limit(50)

      if (error) throw error
      return data
    },
  })
}
