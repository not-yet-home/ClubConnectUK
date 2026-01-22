import { useQuery } from "@tanstack/react-query"
import type { CoverOccurrence } from "@/types/club.types"
import { supabase } from "@/services/supabase"

interface UseCoverOccurrencesParams {
    schoolId?: string;
    startDate?: string;
    endDate?: string;
}

export function useCoverOccurrences({ schoolId, startDate, endDate }: UseCoverOccurrencesParams = {}) {
    return useQuery({
        queryKey: ['cover_occurrences', { schoolId, startDate, endDate }],
        queryFn: async () => {
            let query = supabase
                .from('cover_occurrences')
                .select(`
                    *,
                    cover_rule:cover_rule_id (
                        *,
                        club:club_id (
                            *
                        ),
                        school:school_id (
                            *
                        )
                    ),
                    assignments:teacher_cover_assignments (
                        *,
                        teacher:teacher_id (
                            *,
                            person_details:persons_details_id (*)
                        )
                    )
                `)

            if (schoolId && schoolId !== 'all') {
                // Since school_id is on cover_rule, we need to filter via the join or a subquery
                // In Supabase, we can filter on nested components if they are not many-to-many
                query = query.filter('cover_rule.school_id', 'eq', schoolId)
            }

            if (startDate) {
                query = query.gte('meeting_date', startDate)
            }

            if (endDate) {
                query = query.lte('meeting_date', endDate)
            }

            const { data, error } = await query.order('meeting_date', { ascending: true })

            if (error) throw error

            // Filter out null cover_rules if filtering by schoolId failed to prune them in SQL
            // (Supabase/PostgREST nested filtering behavior can sometimes return rows with null relations)
            const filteredData = data.filter((occ: CoverOccurrence) => !!occ.cover_rule)

            return filteredData as Array<CoverOccurrence>
        }
    })
}
