import type { Teacher } from './teacher.types'

export type ClubStatus = 'active' | 'inactive' | 'cancelled'

export interface School {
  id: string
  school_name: string
  address?: string | null
  status: 'active' | 'inactive' | 'pending'
  created_at: string
  updated_at: string
}

export interface Club {
  id: string
  school_id: string
  club_name: string
  category?: string
  club_code: string
  description?: string | null
  members_count: number
  status: ClubStatus
  created_at: string
  updated_at: string
  school?: School
}

export type CoverFrequency = 'weekly' | 'bi-weekly' | 'monthly'
export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'
export type CoverRuleStatus = 'active' | 'inactive' | 'cancelled'

export interface CoverRule {
  id: string
  school_id: string
  club_id: string
  frequency: CoverFrequency
  day_of_week: DayOfWeek
  start_time: string
  end_time: string
  status: CoverRuleStatus
  created_at: string
  updated_at: string
  club?: Club
  school?: School
}

export type AssignmentStatus =
  | 'invited'
  | 'accepted'
  | 'declined'
  | 'pending'
  | 'confirmed'
export type OccurrenceStatus = 'not_started' | 'in_progress' | 'completed'
export type Priority = 'low' | 'medium' | 'high'

export interface CoverOccurrence {
  id: string
  cover_rule_id: string
  meeting_date: string
  actual_start?: string | null
  actual_end?: string | null
  notes?: string | null
  status: OccurrenceStatus
  priority: Priority
  created_at: string
  updated_at: string
  cover_rule?: CoverRule
  assignments?: Array<TeacherCoverAssignment>
}

export interface TeacherCoverAssignment {
  id: string
  teacher_id: string
  cover_occurrence_id: string
  status: AssignmentStatus
  assigned_by?: string | null
  invited_at?: string | null
  response_at?: string | null
  created_at: string
  teacher?: Teacher
}
