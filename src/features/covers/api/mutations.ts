import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CoverRule } from '@/types/club.types'
import { supabase } from '@/services/supabase'

interface CreateCoverRequestParams {
    school_id: string
    club_id: string
    frequency: CoverRule['frequency']
    day_of_week: CoverRule['day_of_week']
    start_time: string
    end_time: string
    meeting_date: string // The specific date for the first occurrence
    teacher_id?: string // Optional teacher to assign
}

export function useCreateFullCoverRequest() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (params: CreateCoverRequestParams) => {
            // 1. Create/Upsert the Cover Rule
            const { data: ruleData, error: ruleError } = await supabase
                .from('cover_rules')
                .upsert({
                    school_id: params.school_id,
                    club_id: params.club_id,
                    frequency: params.frequency,
                    day_of_week: params.day_of_week,
                    start_time: params.start_time,
                    end_time: params.end_time,
                    status: 'active'
                })
                .select()
                .single()

            if (ruleError) throw ruleError

            // Determine if an occurrence already exists for this rule and date
            // (Simplified: just insert a new one for now)

            // 2. Create the Cover Occurrence
            const { data: occData, error: occError } = await supabase
                .from('cover_occurrences')
                .insert({
                    cover_rule_id: ruleData.id,
                    meeting_date: params.meeting_date,
                    notes: 'Initial occurrence created from request form.'
                })
                .select()
                .single()

            if (occError) throw occError

            // 3. Create Assignment if teacher_id is provided
            if (params.teacher_id) {
                const { error: assignError } = await supabase
                    .from('teacher_cover_assignments')
                    .insert({
                        teacher_id: params.teacher_id,
                        cover_occurrence_id: occData.id,
                        status: 'confirmed' // Or 'pending' depending on preferred flow
                    })

                if (assignError) throw assignError
            }

            return { rule: ruleData, occurrence: occData }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cover_rules'] })
            queryClient.invalidateQueries({ queryKey: ['cover_occurrences'] })
            queryClient.invalidateQueries({ queryKey: ['teacher_cover_assignments'] })
        },
    })
}
