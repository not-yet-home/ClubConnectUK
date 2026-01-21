import { Broadcast } from '../types/broadcast.types'
import { useQuery, useMutation } from '@tanstack/react-query'

export const useBroadcasts = () => {
    return useQuery({
        queryKey: ['broadcasts'],
        queryFn: async (): Promise<Array<Broadcast>> => {
            const { supabase } = await import('@/services/supabase')
            const { data, error } = await supabase
                .from('broadcasts')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching broadcasts:', error)
                return []
            }

            return data as Broadcast[]
        },
    })
}

export const useSendBroadcast = () => {
    return useMutation({
        mutationFn: async (data: {
            subject: string
            message: string
            teacherIds: string[]
            coverIds?: string[]
        }) => {
            // Dynamic import to avoid SSR issues if any, though createServerFn handles this.
            // But actually we can import directly.
            const { sendBroadcast } = await import('../actions/send-broadcast')
            return await sendBroadcast({ data })
        }
    })
}
