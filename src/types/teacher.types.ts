export interface PersonDetails {
  id: string
  first_name: string
  middle_name?: string | null
  last_name: string
  email?: string | null
  address?: string | null
  contact?: string | null  
  image?: string | null
  created_at: string
  updated_at: string
}

export interface Teacher {
  id: string
  persons_details_id: string
  documents_id?: string | null
  primary_styles?: string | null
  secondary_styles?: string | null
  general_notes?: string | null
  is_blocked: boolean
  created_at: string
  updated_at: string
  person_details: PersonDetails
}