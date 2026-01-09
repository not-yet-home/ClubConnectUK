import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'
import type { Teacher, PersonDetails } from '@/types/teacher.types'

// --- Teacher Mutations ---

interface CreateTeacherParams {
    // Person details
    first_name: string
    last_name: string
    middle_name?: string
    email?: string
    contact?: string
    address?: string
    image?: string
    // Teacher specific
    primary_styles?: string
    secondary_styles?: string
    general_notes?: string
}

export function useCreateTeacher() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (params: CreateTeacherParams) => {
            // First, create the person details record
            const { data: personData, error: personError } = await supabase
                .from('person_details')
                .insert({
                    first_name: params.first_name,
                    last_name: params.last_name,
                    middle_name: params.middle_name,
                    email: params.email,
                    contact: params.contact,
                    address: params.address,
                    image: params.image,
                })
                .select()
                .single()

            if (personError) throw personError

            // Then create the teacher record with the persons_details_id
            const { data: teacherData, error: teacherError } = await supabase
                .from('teachers')
                .insert({
                    persons_details_id: personData.id,
                    primary_styles: params.primary_styles,
                    secondary_styles: params.secondary_styles,
                    general_notes: params.general_notes,
                    is_blocked: false,
                })
                .select(`
                    *,
                    person_details:persons_details_id (
                        id,
                        first_name,
                        middle_name,
                        last_name,
                        email,
                        address,
                        contact,
                        image,
                        created_at,
                        updated_at
                    )
                `)
                .single()

            if (teacherError) {
                // Rollback: delete the person details if teacher creation fails
                await supabase.from('person_details').delete().eq('id', personData.id)
                throw teacherError
            }

            return teacherData as Teacher
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teachers'] })
        },
    })
}

interface UpdateTeacherParams {
    id: string
    persons_details_id: string
    // Person details updates
    first_name?: string
    last_name?: string
    middle_name?: string
    email?: string
    contact?: string
    address?: string
    image?: string
    // Teacher specific updates
    primary_styles?: string
    secondary_styles?: string
    general_notes?: string
    is_blocked?: boolean
}

export function useUpdateTeacher() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, persons_details_id, first_name, last_name, middle_name, email, contact, address, image, ...teacherUpdates }: UpdateTeacherParams) => {
            // Update person details if any person fields are provided
            const personUpdates: Partial<PersonDetails> = {}
            if (first_name !== undefined) personUpdates.first_name = first_name
            if (last_name !== undefined) personUpdates.last_name = last_name
            if (middle_name !== undefined) personUpdates.middle_name = middle_name
            if (email !== undefined) personUpdates.email = email
            if (contact !== undefined) personUpdates.contact = contact
            if (address !== undefined) personUpdates.address = address
            if (image !== undefined) personUpdates.image = image

            if (Object.keys(personUpdates).length > 0) {
                const { error: personError } = await supabase
                    .from('person_details')
                    .update(personUpdates)
                    .eq('id', persons_details_id)

                if (personError) throw personError
            }

            // Update teacher record if any teacher fields are provided
            if (Object.keys(teacherUpdates).length > 0) {
                const { error: teacherError } = await supabase
                    .from('teachers')
                    .update(teacherUpdates)
                    .eq('id', id)

                if (teacherError) throw teacherError
            }

            // Fetch the updated teacher with person details
            const { data, error } = await supabase
                .from('teachers')
                .select(`
                    *,
                    person_details:persons_details_id (
                        id,
                        first_name,
                        middle_name,
                        last_name,
                        email,
                        address,
                        contact,
                        image,
                        created_at,
                        updated_at
                    )
                `)
                .eq('id', id)
                .single()

            if (error) throw error
            return data as Teacher
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['teachers'] })
            queryClient.invalidateQueries({ queryKey: ['teachers', data.id] })
        },
    })
}

export function useDeleteTeacher() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ teacherId, personsDetailsId }: { teacherId: string; personsDetailsId: string }) => {
            // First delete the teacher record
            const { error: teacherError } = await supabase
                .from('teachers')
                .delete()
                .eq('id', teacherId)

            if (teacherError) throw teacherError

            // Then delete the person details record
            const { error: personError } = await supabase
                .from('person_details')
                .delete()
                .eq('id', personsDetailsId)

            if (personError) throw personError

            return teacherId
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teachers'] })
        },
    })
}

export function useToggleTeacherBlock() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ teacherId, isBlocked }: { teacherId: string; isBlocked: boolean }) => {
            const { data, error } = await supabase
                .from('teachers')
                .update({ is_blocked: isBlocked })
                .eq('id', teacherId)
                .select()
                .single()

            if (error) throw error
            return data as Teacher
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['teachers'] })
            queryClient.invalidateQueries({ queryKey: ['teachers', data.id] })
        },
    })
}
