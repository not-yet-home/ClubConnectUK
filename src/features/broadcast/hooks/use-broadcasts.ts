import { useQuery } from '@tanstack/react-query'
import type { Broadcast } from '../types/broadcast.types'

export const useBroadcasts = () => {
    return useQuery({
        queryKey: ['broadcasts'],
        queryFn: (): Promise<Array<Broadcast>> => {
            // Return empty array as requested
            return Promise.resolve([])
        },
    })
}
