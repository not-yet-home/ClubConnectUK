import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'
import type { Club, CoverRule } from '@/types/club.types'

// --- Club Mutations ---

interface CreateClubParams {
    club_name: string
    club_code: string
    school_id: string
    description?: string
    status?: Club['status']
}

export function useCreateClub() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (newClub: CreateClubParams) => {
            const { data, error } = await supabase
                .from('clubs')
                .insert(newClub)
                .select()
                .single()

            if (error) throw error
            return data as Club
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clubs'] })
        },
    })
}

interface UpdateClubParams {
    id: string
    club_name?: string
    club_code?: string
    school_id?: string
    description?: string
    status?: Club['status']
}

export function useUpdateClub() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, ...updates }: UpdateClubParams) => {
            const { data, error } = await supabase
                .from('clubs')
                .update(updates)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return data as Club
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['clubs'] })
            queryClient.invalidateQueries({ queryKey: ['clubs', data.id] })
        },
    })
}

export function useDeleteClub() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (clubId: string) => {
            const { error } = await supabase
                .from('clubs')
                .delete()
                .eq('id', clubId)

            if (error) throw error
            return clubId
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clubs'] })
        },
    })
}

// --- Cover Rule Mutations ---

interface UpsertCoverRuleParams {
    id?: string
    club_id: string
    school_id: string
    frequency: CoverRule['frequency']
    day_of_week: CoverRule['day_of_week']
    start_time: string
    end_time: string
    status?: CoverRule['status']
}

export function useUpsertCoverRule() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (rule: UpsertCoverRuleParams) => {
            const { data, error } = await supabase
                .from('cover_rules')
                .upsert(rule) // Supabase upsert will handle insert or update based on ID
                .select()
                .single()

            if (error) throw error
            return data as CoverRule
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['cover_rules', 'club', data.club_id] })
            // Also invalidate upcoming meetings as they depend on rules
            queryClient.invalidateQueries({ queryKey: ['cover_occurrences', 'club', data.club_id] })
        },
    })
}

export function useDeleteCoverRule() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ ruleId, clubId }: { ruleId: string; clubId: string }) => {
            const { error } = await supabase
                .from('cover_rules')
                .delete()
                .eq('id', ruleId)

            if (error) throw error
            return { ruleId, clubId }
        },
        onSuccess: ({ clubId }) => {
            queryClient.invalidateQueries({ queryKey: ['cover_rules', 'club', clubId] })
            queryClient.invalidateQueries({ queryKey: ['cover_occurrences', 'club', clubId] })
        },
    })
}
