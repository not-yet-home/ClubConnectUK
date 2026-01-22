import { useQuery } from "@tanstack/react-query"
import type { Club, CoverOccurrence, CoverRule } from "@/types/club.types"
import { supabase } from "@/services/supabase"

// Fetch all clubs with their associated school
export function useClubs() {
    return useQuery({
        queryKey: ['clubs'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('clubs')
                .select(`
                    *,
                    school:school_id (
                        id,
                        school_name,
                        address,
                        status
                    )
                `)
                .order('club_name', { ascending: true })
            if (error) throw error
            return data as Array<Club>
        }
    })
}

// Fetch clubs by school ID
export function useClubsBySchool(schoolId: string) {
    return useQuery({
        queryKey: ['clubs', 'school', schoolId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('clubs')
                .select('*')
                .eq('school_id', schoolId)
                .order('club_name', { ascending: true })
            if (error) throw error
            return data as Array<Club>
        },
        enabled: !!schoolId
    })
}

// Fetch a single club by ID
export function useClub(clubId: string) {
    return useQuery({
        queryKey: ['clubs', clubId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('clubs')
                .select(`
                    *,
                    school:school_id (
                        id,
                        school_name,
                        address,
                        status
                    )
                `)
                .eq('id', clubId)
                .single()
            if (error) throw error
            return data as Club
        },
        enabled: !!clubId
    })
}

// Fetch cover rules for a specific club
export function useClubCoverRules(clubId: string) {
    return useQuery({
        queryKey: ['cover_rules', 'club', clubId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('cover_rules')
                .select('*')
                .eq('club_id', clubId)
                .order('day_of_week', { ascending: true })
            if (error) throw error
            return data as Array<CoverRule>
        },
        enabled: !!clubId
    })
}

// Fetch upcoming occurrences for a specific club's cover rules
export function useClubUpcomingMeetings(clubId: string) {
    return useQuery({
        queryKey: ['cover_occurrences', 'club', clubId],
        queryFn: async () => {
            // First, get the cover rules for this club
            const { data: rules, error: rulesError } = await supabase
                .from('cover_rules')
                .select('id')
                .eq('club_id', clubId)

            if (rulesError) throw rulesError
            if (!rules || rules.length === 0) return []

            const ruleIds = rules.map((r: { id: string }) => r.id)

            // Then fetch occurrences for these rules
            const { data, error } = await supabase
                .from('cover_occurrences')
                .select(`
                    *,
                    cover_rule:cover_rule_id (
                        id,
                        frequency,
                        day_of_week,
                        start_time,
                        end_time,
                        status
                    )
                `)
                .in('cover_rule_id', ruleIds)
                .gte('meeting_date', new Date().toISOString())
                .order('meeting_date', { ascending: true })
                .limit(10)

            if (error) throw error
            return data as Array<CoverOccurrence>
        },
        enabled: !!clubId
    })
}
