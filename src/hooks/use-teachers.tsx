import { supabase } from "@/services/supabase"
import { useQuery } from "@tanstack/react-query"

export default function useTeachers() {
    return useQuery({
        queryKey: ['teachers'],
        queryFn: async () => {
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
            if (error) throw error
            return data
        }
    })
}