import { supabase } from "@/services/supabase"
import { useQuery } from "@tanstack/react-query"
import type { School } from "@/types/club.types"

export function useSchools() {
    return useQuery({
        queryKey: ['schools'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('schools')
                .select('*')
                .eq('status', 'active')
                .order('school_name', { ascending: true })
            if (error) throw error
            return data as School[]
        }
    })
}
