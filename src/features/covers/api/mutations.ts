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
    request_type?: 'one-off' | 'recurring'
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

            // Determine occurrences to create
            const occurrencesToInsert: Array<any> = []
            const startDate = new Date(params.meeting_date)
            const targetMonth = startDate.getMonth()

            // Loop for a maximum of 8 weeks, but break if we exceed the current month
            // or if it's a one-off request.
            const maxIterations = params.request_type === 'recurring' ? 12 : 1 // 12 as a safe upper bound
            const weekStep = params.frequency === 'bi-weekly' ? 2 : (params.frequency === 'monthly' ? 4 : 1)

            for (let i = 0; i < maxIterations; i++) {
                const currentDate = new Date(startDate)

                if (params.frequency === 'monthly') {
                    // For monthly, we just do one occurrence for month-focus, 
                    // or keep it simple if they only want the current month.
                    if (i > 0) break; // Only 1 for monthly in "one month focus"
                    currentDate.setMonth(startDate.getMonth() + i)
                } else {
                    currentDate.setDate(startDate.getDate() + (i * weekStep * 7))
                }

                // If we've moved to a different month and it's a recurring request, stop.
                if (params.request_type === 'recurring' && currentDate.getMonth() !== targetMonth) {
                    break;
                }

                // Weekend adjustment: Shift Saturday to Friday (-1) and Sunday to Monday (+1)
                const dayOfWeek = currentDate.getDay()
                if (dayOfWeek === 6) { // Saturday
                    currentDate.setDate(currentDate.getDate() - 1)
                } else if (dayOfWeek === 0) { // Sunday
                    currentDate.setDate(currentDate.getDate() + 1)
                }

                // Re-check month after weekend shift (e.g. if Sunday shifted to Monday is now next month)
                if (params.request_type === 'recurring' && currentDate.getMonth() !== targetMonth) {
                    break;
                }

                occurrencesToInsert.push({
                    cover_rule_id: ruleData.id,
                    meeting_date: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`,
                    notes: i === 0
                        ? 'Initial occurrence created from request form.'
                        : `Recurring occurrence (${i + 1} of month)`
                })

                // If it's a one-off, stop after the first iteration
                if (params.request_type === 'one-off') break;
            }

            // 2. Create the Cover Occurrences
            const { data: occsData, error: occsError } = await supabase
                .from('cover_occurrences')
                .insert(occurrencesToInsert)
                .select()

            if (occsError) throw occsError

            // 3. Create Assignments if teacher_id is provided
            if (params.teacher_id) {
                const assignmentsToInsert = occsData.map(occ => ({
                    teacher_id: params.teacher_id,
                    cover_occurrence_id: occ.id,
                    status: 'confirmed'
                }))

                const { error: assignError } = await supabase
                    .from('teacher_cover_assignments')
                    .insert(assignmentsToInsert)

                if (assignError) throw assignError
            }

            return { rule: ruleData, occurrences: occsData }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cover_rules'] })
            queryClient.invalidateQueries({ queryKey: ['cover_occurrences'] })
            queryClient.invalidateQueries({ queryKey: ['teacher_cover_assignments'] })
        },
    })
}

export function useUpdateCoverRequest() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (params: CreateCoverRequestParams & { occurrence_id: string, rule_id: string }) => {
            // 1. Update the Cover Rule
            const { error: ruleError } = await supabase
                .from('cover_rules')
                .update({
                    school_id: params.school_id,
                    club_id: params.club_id,
                    frequency: params.frequency,
                    day_of_week: params.day_of_week,
                    start_time: params.start_time,
                    end_time: params.end_time,
                })
                .eq('id', params.rule_id)

            if (ruleError) throw ruleError

            // 2. Update the Cover Occurrence
            const { error: occError } = await supabase
                .from('cover_occurrences')
                .update({
                    meeting_date: params.meeting_date,
                    // notes: params.notes // Assuming we might want to update notes too, adding if available
                })
                .eq('id', params.occurrence_id)

            if (occError) throw occError

            // 3. Update Assignment
            // First, remove existing assignment for this occurrence
            const { error: deleteAssignError } = await supabase
                .from('teacher_cover_assignments')
                .delete()
                .eq('cover_occurrence_id', params.occurrence_id)

            if (deleteAssignError) throw deleteAssignError

            // Then create new assignment if teacher_id is provided
            if (params.teacher_id) {
                const { error: assignError } = await supabase
                    .from('teacher_cover_assignments')
                    .insert({
                        teacher_id: params.teacher_id,
                        cover_occurrence_id: params.occurrence_id,
                        status: 'confirmed'
                    })

                if (assignError) throw assignError
            }

            return { success: true }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cover_rules'] })
            queryClient.invalidateQueries({ queryKey: ['cover_occurrences'] })
            queryClient.invalidateQueries({ queryKey: ['cover-occurrence'] }) // Specific detail query
            queryClient.invalidateQueries({ queryKey: ['teacher_cover_assignments'] })
        },
    })
}

export function useDeleteCoverOccurrence() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (occurrenceId: string) => {
            const { error } = await supabase
                .from('cover_occurrences')
                .delete()
                .eq('id', occurrenceId)

            if (error) throw error
            return { success: true }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cover_occurrences'] })
        },
    })
}

export function useMoveCoverOccurrence() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, newDate }: { id: string, newDate: string }) => {
            const { error } = await supabase
                .from('cover_occurrences')
                .update({ meeting_date: newDate })
                .eq('id', id)

            if (error) throw error
            return { success: true }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cover_occurrences'] })
            queryClient.invalidateQueries({ queryKey: ['cover-occurrence'] })
        },
    })
}
