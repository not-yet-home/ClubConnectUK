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
    mutationFn: async ({ id, newDate }: { id: string; newDate: string }) => {
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
  status?: string
  priority?: string
  notes?: string
}

export function useCreateFullCoverRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: CreateCoverRequestParams) => {
      const days = [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
      ]
      const dayOfWeek = days[params.day_of_occurence]

      const { data: ruleData, error: ruleError } = await supabase
        .from('cover_rules')
        .upsert({
          school_id: params.school_id,
          club_id: params.club_id,
          frequency: params.frequency,
          day_of_week: dayOfWeek,
          start_time: params.start_time,
          end_time: params.end_time,
          status: 'active',
        })
        .select()
        .single()

      if (ruleError) throw ruleError

      const totalToCreate =
        params.request_type === 'recurring' ? params.occurrences || 1 : 1
      const weekStep = params.frequency === 'bi-weekly' ? 2 : 1
      const startDate = new Date(params.meeting_date)

      const occurrencesToInsert = Array.from({ length: totalToCreate }).map(
        (_, i) => ({
          cover_rule_id: ruleData.id,
          meeting_date: format(addWeeks(startDate, i * weekStep), 'yyyy-MM-dd'),
          notes:
            params.notes ||
            (i === 0 ? 'Initial session' : `Recurring session ${i + 1}`),
          status: params.status || 'not_started',
          priority: params.priority || 'medium',
        }),
      )

      const { data: occsData, error: occsError } = await supabase
        .from('cover_occurrences')
        .insert(occurrencesToInsert)
        .select()

      if (occsError) throw occsError

      if (params.teacher_id) {
        const assignments = occsData.map((occ) => ({
          teacher_id: params.teacher_id,
          cover_occurrence_id: occ.id,
          status: 'confirmed',
        }))
        await supabase.from('teacher_cover_assignments').insert(assignments)
      }
      return { rule: ruleData, occurrences: occsData }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cover_rules'] })
      queryClient.invalidateQueries({ queryKey: ['cover_occurrences'] })
    },
  })
}

export function useUpdateCoverRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      params: CreateCoverRequestParams & {
        occurrence_id: string
        rule_id?: string
        updateType?: 'single' | 'series'
      },
    ) => {
      const isSeries = params.updateType === 'series' && params.rule_id

      if (isSeries) {
        // 1. Update the EXISTING Cover Rule
        const { error: ruleError } = await supabase
          .from('cover_rules')
          .update({
            school_id: params.school_id,
            club_id: params.club_id,
            frequency: params.frequency,
            day_of_week: [
              'sunday',
              'monday',
              'tuesday',
              'wednesday',
              'thursday',
              'friday',
              'saturday',
            ][params.day_of_occurence],
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

        // 1. Update Occurrence Details
        const { error: occError } = await supabase
          .from('cover_occurrences')
          .update({
            meeting_date: params.meeting_date,
            notes: params.notes,
            status: params.status,
            priority: params.priority,
          })
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
              status: 'confirmed',
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
