-- Migration: Add description, members_count, and status to clubs table
-- Date: 2025-12-24

-- Add new columns to clubs table
ALTER TABLE public.clubs
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS members_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS status public.cover_status DEFAULT 'active';

-- Add index for status
CREATE INDEX IF NOT EXISTS idx_clubs_status ON public.clubs(status);

COMMENT ON COLUMN public.clubs.description IS 'Purpose or description of the club';
COMMENT ON COLUMN public.clubs.members_count IS 'Manually tracked member count for the club';
COMMENT ON COLUMN public.clubs.status IS 'Active status of the club: active, inactive, cancelled';
