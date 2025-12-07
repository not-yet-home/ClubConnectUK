import { supabase } from "@/lib/supabase.client"
import { useQuery } from "@tanstack/react-query"

export default function useTeachers() {
    return useQuery({
        queryKey: ['teachers'],
        queryFn: async () => {
            const { data, error } = await supabase.from('teachers').select('*')
            if (error) throw error
            return data
        }
    })
}