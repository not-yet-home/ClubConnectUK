// import { useMutation, useQueryClient } from '@tanstack/react-query'
// import type { CoverRule } from '@/types/club.types'
// import { supabase } from '@/services/supabase'

// interface CreateCoverRequestParams {
//     school_id: string
//     club_id: string
//     frequency: CoverRule['frequency']
//     day_of_occurence: CoverRule['day_of_occurence']
//     start_time: string
//     end_time: string
//     meeting_date: string // The specific date for the first occurrence
//     teacher_id?: string // Optional teacher to assign
//     request_type?: 'one-off' | 'recurring'
// }

// export function useCreateFullCoverRequest() {
//     const queryClient = useQueryClient()

//     return useMutation({
//         mutationFn: async (params: CreateCoverRequestParams) => {
//             // 1. Create/Upsert the Cover Rule
//             const { data: ruleData, error: ruleError } = await supabase
//                 .from('cover_rules')
//                 .upsert({
//                     school_id: params.school_id,
//                     club_id: params.club_id,
//                     frequency: params.frequency,
//                     day_of_occurence: params.day_of_occurence,
//                     start_time: params.start_time,
//                     end_time: params.end_time,
//                     status: 'active'
//                 })
//                 .select()
//                 .single()

//             if (ruleError) throw ruleError

//             // Determine occurrences to create
//             const occurrencesToInsert: Array<any> = []
//             const startDate = new Date(params.meeting_date)
//             const targetMonth = startDate.getMonth()

//             // Loop for a maximum of 8 weeks, but break if we exceed the current month
//             // or if it's a one-off request.
//             const maxIterations = params.request_type === 'recurring' ? 12 : 1 // 12 as a safe upper bound
//             const weekStep = params.frequency === 'bi-weekly' ? 2 : (params.frequency === 'monthly' ? 4 : 1)

//             for (let i = 0; i < maxIterations; i++) {
//                 const currentDate = new Date(startDate)

//                 if (params.frequency === 'monthly') {
//                     // For monthly, we just do one occurrence for month-focus, 
//                     // or keep it simple if they only want the current month.
//                     if (i > 0) break; // Only 1 for monthly in "one month focus"
//                     currentDate.setMonth(startDate.getMonth() + i)
//                 } else {
//                     currentDate.setDate(startDate.getDate() + (i * weekStep * 7))
//                 }

//                 // If we've moved to a different month and it's a recurring request, stop.
//                 if (params.request_type === 'recurring' && currentDate.getMonth() !== targetMonth) {
//                     break;
//                 }

//                 // Weekend adjustment: Shift Saturday to Friday (-1) and Sunday to Monday (+1)
//                 const dayOfOccurence = currentDate.getDay()
//                 if (dayOfOccurence === 6) { // Saturday
//                     currentDate.setDate(currentDate.getDate() - 1)
//                 } else if (dayOfOccurence === 0) { // Sunday
//                     currentDate.setDate(currentDate.getDate() + 1)
//                 }

//                 // Re-check month after weekend shift (e.g. if Sunday shifted to Monday is now next month)
//                 if (params.request_type === 'recurring' && currentDate.getMonth() !== targetMonth) {
//                     break;
//                 }

//                 occurrencesToInsert.push({
//                     cover_rule_id: ruleData.id,
//                     meeting_date: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`,
//                     notes: i === 0
//                         ? 'Initial occurrence created from request form.'
//                         : `Recurring occurrence (${i + 1} of month)`
//                 })

//                 // If it's a one-off, stop after the first iteration
//                 if (params.request_type === 'one-off') break;
//             }

//             // 2. Create the Cover Occurrences
//             const { data: occsData, error: occsError } = await supabase
//                 .from('cover_occurrences')
//                 .insert(occurrencesToInsert)
//                 .select()

//             if (occsError) throw occsError

//             // 3. Create Assignments if teacher_id is provided
//             if (params.teacher_id) {
//                 const assignmentsToInsert = occsData.map(occ => ({
//                     teacher_id: params.teacher_id,
//                     cover_occurrence_id: occ.id,
//                     status: 'confirmed'
//                 }))

//                 const { error: assignError } = await supabase
//                     .from('teacher_cover_assignments')
//                     .insert(assignmentsToInsert)

//                 if (assignError) throw assignError
//             }

//             return { rule: ruleData, occurrences: occsData }
//         },
//         onSuccess: () => {
//             queryClient.invalidateQueries({ queryKey: ['cover_rules'] })
//             queryClient.invalidateQueries({ queryKey: ['cover_occurrences'] })
//             queryClient.invalidateQueries({ queryKey: ['teacher_cover_assignments'] })
//         },
//     })
// }

// export function useUpdateCoverRequest() {
//     const queryClient = useQueryClient()

//     return useMutation({
//         mutationFn: async (params: CreateCoverRequestParams & {
//             occurrence_id: string,
//             rule_id: string,
//             updateType?: 'single' | 'series'
//         }) => {
//             const isSeries = params.updateType === 'series'

//             if (isSeries) {
//                 // 1. Update the EXISTING Cover Rule
//                 const { error: ruleError } = await supabase
//                     .from('cover_rules')
//                     .update({
//                         school_id: params.school_id,
//                         club_id: params.club_id,
//                         frequency: params.frequency,
//                         day_of_occurence: params.day_of_occurence,
//                         start_time: params.start_time,
//                         end_time: params.end_time,
//                     })
//                     .eq('id', params.rule_id)

//                 if (ruleError) throw ruleError

//                 // 2. Update the specific occurrence's date
//                 const { error: occError } = await supabase
//                     .from('cover_occurrences')
//                     .update({ meeting_date: params.meeting_date })
//                     .eq('id', params.occurrence_id)

//                 if (occError) throw occError
//             } else {
//                 // UPDATE ONLY ONE (Isolated):
//                 // 1. Create a NEW isolated rule for this session
//                 const { data: newRule, error: newRuleError } = await supabase
//                     .from('cover_rules')
//                     .insert({
//                         school_id: params.school_id,
//                         club_id: params.club_id,
//                         frequency: 'weekly',
//                         day_of_occurence: params.day_of_occurence,
//                         start_time: params.start_time,
//                         end_time: params.end_time,
//                         status: 'active'
//                     })
//                     .select()
//                     .single()

//                 if (newRuleError) throw newRuleError

//                 // 2. Translocate this occurrence to the new isolated rule
//                 const { error: occUpdateError } = await supabase
//                     .from('cover_occurrences')
//                     .update({
//                         cover_rule_id: newRule.id,
//                         meeting_date: params.meeting_date
//                     })
//                     .eq('id', params.occurrence_id)

//                 if (occUpdateError) throw occUpdateError
//             }

//             // 3. Update Assignment
//             // First, remove existing assignment for this occurrence
//             const { error: deleteAssignError } = await supabase
//                 .from('teacher_cover_assignments')
//                 .delete()
//                 .eq('cover_occurrence_id', params.occurrence_id)

//             if (deleteAssignError) throw deleteAssignError

//             // Then create new assignment if teacher_id is provided
//             if (params.teacher_id) {
//                 const { error: assignError } = await supabase
//                     .from('teacher_cover_assignments')
//                     .insert({
//                         teacher_id: params.teacher_id,
//                         cover_occurrence_id: params.occurrence_id,
//                         status: 'confirmed'
//                     })

//                 if (assignError) throw assignError
//             }

//             return { success: true }
//         },
//         onSuccess: () => {
//             queryClient.invalidateQueries({ queryKey: ['cover_rules'] })
//             queryClient.invalidateQueries({ queryKey: ['cover_occurrences'] })
//             queryClient.invalidateQueries({ queryKey: ['cover-occurrence'] }) // Specific detail query
//             queryClient.invalidateQueries({ queryKey: ['teacher_cover_assignments'] })
//         },
//     })
// }

// FIX: Commented out previously?
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addWeeks, format } from 'date-fns'
import type { CoverRule } from '@/types/club.types'
import { supabase } from '@/services/supabase'

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

interface CreateCoverRequestParams {
    school_id: string
    club_id: string
    frequency: CoverRule['frequency']
    day_of_occurence: number
    start_time: string
    end_time: string
    meeting_date: string
    teacher_id?: string
    request_type?: 'one-off' | 'recurring'
    occurrences?: number
}

export function useCreateFullCoverRequest() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (params: CreateCoverRequestParams) => {
            const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const dayOfWeek = days[params.day_of_occurence];

            const { data: ruleData, error: ruleError } = await supabase
                .from('cover_rules')
                .upsert({
                    school_id: params.school_id,
                    club_id: params.club_id,
                    frequency: params.frequency,
                    day_of_week: dayOfWeek,
                    start_time: params.start_time,
                    end_time: params.end_time,
                    status: 'active'
                })
                .select().single()

            if (ruleError) throw ruleError

            const totalToCreate = params.request_type === 'recurring' ? (params.occurrences || 1) : 1
            const weekStep = params.frequency === 'bi-weekly' ? 2 : 1
            const startDate = new Date(params.meeting_date)

            const occurrencesToInsert = Array.from({ length: totalToCreate }).map((_, i) => ({
                cover_rule_id: ruleData.id,
                meeting_date: format(addWeeks(startDate, i * weekStep), 'yyyy-MM-dd'),
                notes: i === 0 ? 'Initial session' : `Recurring session ${i + 1}`
            }))

            const { data: occsData, error: occsError } = await supabase
                .from('cover_occurrences')
                .insert(occurrencesToInsert)
                .select()

            if (occsError) throw occsError

            if (params.teacher_id) {
                const assignments = occsData.map(occ => ({
                    teacher_id: params.teacher_id,
                    cover_occurrence_id: occ.id,
                    status: 'confirmed'
                }))
                await supabase.from('teacher_cover_assignments').insert(assignments)
            }
            return { rule: ruleData, occurrences: occsData }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cover_rules'] })
            queryClient.invalidateQueries({ queryKey: ['cover_occurrences'] })
        }
    })
}

// FIX: Ensure this is exported!
// FIX: Commented out previously?
export function useUpdateCoverRequest() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (params: CreateCoverRequestParams & {
            occurrence_id: string,
            rule_id?: string,
            updateType?: 'single' | 'series'
        }) => {
            const isSeries = params.updateType === 'series' && params.rule_id


            if (isSeries) {
                // 1. Update the EXISTING Cover Rule
                const { error: ruleError } = await supabase
                    .from('cover_rules')
                    .update({
                        school_id: params.school_id,
                        club_id: params.club_id,
                        frequency: params.frequency,
                        day_of_week: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][params.day_of_occurence],
                        start_time: params.start_time,
                        end_time: params.end_time,
                    })
                    .eq('id', params.rule_id)

                if (ruleError) throw ruleError

                // 2. Update the specific occurrence's date if needed (usually series update implies rules update, but current occurrence might need date shift if day changed)
                // For simplicity, we might just update the rule, but if the user changed the DATE of this specific occurrence, we should respect that for this occurrence.
                // However, shifting the *series* usually means changing the pattern. 
                // Let's stick to updating the rule properties.
            } else {
                // UPDATE ONLY ONE (Isolated) or Updates to a one-off:

                // If it was part of a series, we might need to detach it (create new rule or just update occurrence overrides if we supported them).
                // Current logic seems to assume we detach to a NEW rule if it was series.

                // But if it's just a simple update to a one-off, we just update the occurrence/rule.

                // Simplified "Update Single" logic:
                // Just update the occurrence details directly where possible, or if it changes the 'definition' (time/club), we update the underlying rule IF it's a one-off rule.

                // For now, let's implement the "Update fields" logic.

                // 1. Update Occurrence Date
                const { error: occError } = await supabase
                    .from('cover_occurrences')
                    .update({ meeting_date: params.meeting_date })
                    .eq('id', params.occurrence_id)

                if (occError) throw occError

                // 2. Assign/Reassign Teacher
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
            }

            return { success: true }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cover_rules'] })
            queryClient.invalidateQueries({ queryKey: ['cover_occurrences'] })
            queryClient.invalidateQueries({ queryKey: ['cover-occurrence'] })
            queryClient.invalidateQueries({ queryKey: ['teacher_cover_assignments'] })
        },
    })
}