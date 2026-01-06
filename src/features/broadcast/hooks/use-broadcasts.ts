import { Broadcast } from '../types/broadcast.types'
import { useQuery, useMutation } from '@tanstack/react-query'

export const useBroadcasts = () => {
    return useQuery({
        queryKey: ['broadcasts'],
        queryFn: async (): Promise<Broadcast[]> => {
            // Return empty array as requested
            return []
        },
    })
}

export const useSendBroadcast = () => {
    return useMutation({
        mutationFn: async (data: {
            subject: string
            message: string
            recipients: string[]
        }) => {
            // Dynamic import to avoid SSR issues if any, though createServerFn handles this.
            // But actually we can import directly.
            const { sendBroadcast } = await import('../actions/send-broadcast')
            return await sendBroadcast({ data })
        }
    })
}
