import { Broadcast } from '../types/broadcast.types'
import { useQuery } from '@tanstack/react-query'

export const useBroadcasts = () => {
    return useQuery({
        queryKey: ['broadcasts'],
        queryFn: async (): Promise<Broadcast[]> => {
            // Return empty array as requested
            return []
        },
    })
}
