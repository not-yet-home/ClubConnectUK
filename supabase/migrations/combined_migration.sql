-- Combined Migration File
-- Run this entire file in Supabase Dashboard SQL Editor
-- This will: 
-- 1. Clean up old schema (if exists)
-- 2. Create new schema (schools, teachers, clubs, messages)
-- 3. Apply RLS policies
-- 4. Seed with test data

-- ============================================
-- CLEANUP (Optional - removes old tables)
-- ============================================
-- Uncomment these lines if you want to remove the old schema first
-- DROP TABLE IF EXISTS public.event_attendees CASCADE;
-- DROP TABLE IF EXISTS public.events CASCADE;
-- DROP TABLE IF EXISTS public.memberships CASCADE;
-- DROP TABLE IF EXISTS public.clubs CASCADE;
-- DROP TABLE IF EXISTS public.profiles CASCADE;
-- DROP TYPE IF EXISTS attendance_status CASCADE;
-- DROP TYPE IF EXISTS event_status CASCADE;
-- DROP TYPE IF EXISTS event_type CASCADE;
-- DROP TYPE IF EXISTS membership_status CASCADE;
-- DROP TYPE IF EXISTS membership_role CASCADE;

-- ============================================
-- MIGRATION 1: INITIAL SCHEMA
-- ============================================

-- Helper function for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- SCHOOLS TABLE
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    address TEXT,
    postcode TEXT,
    city TEXT,
    phone TEXT,
    email TEXT,
    website_url TEXT,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER on_schools_updated
    BEFORE UPDATE ON public.schools
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- TEACHERS TABLE
CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    department TEXT,
    subject_specialization TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER on_teachers_updated
    BEFORE UPDATE ON public.teachers
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- SCHOOL_CLUBS TABLE
CREATE TABLE IF NOT EXISTS public.school_clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('sports', 'academic', 'arts', 'cultural', 'technology', 'social', 'volunteering', 'other')),
    logo_url TEXT,
    banner_url TEXT,
    meeting_day TEXT,
    meeting_time TIME,
    meeting_location TEXT,
    teacher_in_charge_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    member_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(school_id, slug)
);

CREATE TRIGGER on_school_clubs_updated
    BEFORE UPDATE ON public.school_clubs
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- BULK_MESSAGES TABLE
CREATE TYPE message_status AS ENUM ('draft', 'sent', 'scheduled', 'failed');

CREATE TABLE IF NOT EXISTS public.bulk_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    status message_status DEFAULT 'draft' NOT NULL,
    scheduled_for TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    sent_by TEXT,
    recipient_count INTEGER DEFAULT 0 NOT NULL,
    success_count INTEGER DEFAULT 0 NOT NULL,
    failed_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER on_bulk_messages_updated
    BEFORE UPDATE ON public.bulk_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- BULK_MESSAGE_RECIPIENTS TABLE
CREATE TYPE recipient_status AS ENUM ('pending', 'sent', 'failed', 'bounced');

CREATE TABLE IF NOT EXISTS public.bulk_message_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bulk_message_id UUID NOT NULL REFERENCES public.bulk_messages(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    status recipient_status DEFAULT 'pending' NOT NULL,
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(bulk_message_id, teacher_id)
);

CREATE TRIGGER on_bulk_message_recipients_updated
    BEFORE UPDATE ON public.bulk_message_recipients
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_schools_slug ON public.schools(slug);
CREATE INDEX IF NOT EXISTS idx_schools_active ON public.schools(is_active);
CREATE INDEX IF NOT EXISTS idx_schools_city ON public.schools(city);

CREATE INDEX IF NOT EXISTS idx_teachers_school_id ON public.teachers(school_id);
CREATE INDEX IF NOT EXISTS idx_teachers_email ON public.teachers(email);
CREATE INDEX IF NOT EXISTS idx_teachers_department ON public.teachers(department);
CREATE INDEX IF NOT EXISTS idx_teachers_active ON public.teachers(is_active);

CREATE INDEX IF NOT EXISTS idx_school_clubs_school_id ON public.school_clubs(school_id);
CREATE INDEX IF NOT EXISTS idx_school_clubs_slug ON public.school_clubs(slug);
CREATE INDEX IF NOT EXISTS idx_school_clubs_category ON public.school_clubs(category);
CREATE INDEX IF NOT EXISTS idx_school_clubs_active ON public.school_clubs(is_active);
CREATE INDEX IF NOT EXISTS idx_school_clubs_teacher_in_charge ON public.school_clubs(teacher_in_charge_id);

CREATE INDEX IF NOT EXISTS idx_bulk_messages_school_id ON public.bulk_messages(school_id);
CREATE INDEX IF NOT EXISTS idx_bulk_messages_status ON public.bulk_messages(status);
CREATE INDEX IF NOT EXISTS idx_bulk_messages_scheduled_for ON public.bulk_messages(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_bulk_messages_sent_at ON public.bulk_messages(sent_at);

CREATE INDEX IF NOT EXISTS idx_bulk_message_recipients_message_id ON public.bulk_message_recipients(bulk_message_id);
CREATE INDEX IF NOT EXISTS idx_bulk_message_recipients_teacher_id ON public.bulk_message_recipients(teacher_id);
CREATE INDEX IF NOT EXISTS idx_bulk_message_recipients_status ON public.bulk_message_recipients(status);

-- ============================================
-- MIGRATION 2: RLS POLICIES
-- ============================================

-- SCHOOLS TABLE RLS
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Active schools are viewable by everyone" ON public.schools;
CREATE POLICY "Active schools are viewable by everyone"
    ON public.schools
    FOR SELECT
    TO authenticated
    USING (is_active = true);

DROP POLICY IF EXISTS "Service role can insert schools" ON public.schools;
CREATE POLICY "Service role can insert schools"
    ON public.schools
    FOR INSERT
    TO service_role
    WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can update schools" ON public.schools;
CREATE POLICY "Service role can update schools"
    ON public.schools
    FOR UPDATE
    TO service_role
    USING (true);

DROP POLICY IF EXISTS "Service role can delete schools" ON public.schools;
CREATE POLICY "Service role can delete schools"
    ON public.schools
    FOR DELETE
    TO service_role
    USING (true);

-- TEACHERS TABLE RLS
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Active teachers are viewable by everyone" ON public.teachers;
CREATE POLICY "Active teachers are viewable by everyone"
    ON public.teachers
    FOR SELECT
    TO authenticated
    USING (is_active = true);

DROP POLICY IF EXISTS "Service role can insert teachers" ON public.teachers;
CREATE POLICY "Service role can insert teachers"
    ON public.teachers
    FOR INSERT
    TO service_role
    WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can update teachers" ON public.teachers;
CREATE POLICY "Service role can update teachers"
    ON public.teachers
    FOR UPDATE
    TO service_role
    USING (true);

DROP POLICY IF EXISTS "Service role can delete teachers" ON public.teachers;
CREATE POLICY "Service role can delete teachers"
    ON public.teachers
    FOR DELETE
    TO service_role
    USING (true);

-- SCHOOL_CLUBS TABLE RLS
ALTER TABLE public.school_clubs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Active school clubs are viewable by everyone" ON public.school_clubs;
CREATE POLICY "Active school clubs are viewable by everyone"
    ON public.school_clubs
    FOR SELECT
    TO authenticated
    USING (is_active = true);

DROP POLICY IF EXISTS "Service role can insert school clubs" ON public.school_clubs;
CREATE POLICY "Service role can insert school clubs"
    ON public.school_clubs
    FOR INSERT
    TO service_role
    WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can update school clubs" ON public.school_clubs;
CREATE POLICY "Service role can update school clubs"
    ON public.school_clubs
    FOR UPDATE
    TO service_role
    USING (true);

DROP POLICY IF EXISTS "Service role can delete school clubs" ON public.school_clubs;
CREATE POLICY "Service role can delete school clubs"
    ON public.school_clubs
    FOR DELETE
    TO service_role
    USING (true);

-- BULK_MESSAGES TABLE RLS
ALTER TABLE public.bulk_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can view bulk messages" ON public.bulk_messages;
CREATE POLICY "Service role can view bulk messages"
    ON public.bulk_messages
    FOR SELECT
    TO service_role
    USING (true);

DROP POLICY IF EXISTS "Service role can insert bulk messages" ON public.bulk_messages;
CREATE POLICY "Service role can insert bulk messages"
    ON public.bulk_messages
    FOR INSERT
    TO service_role
    WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can update bulk messages" ON public.bulk_messages;
CREATE POLICY "Service role can update bulk messages"
    ON public.bulk_messages
    FOR UPDATE
    TO service_role
    USING (true);

DROP POLICY IF EXISTS "Service role can delete bulk messages" ON public.bulk_messages;
CREATE POLICY "Service role can delete bulk messages"
    ON public.bulk_messages
    FOR DELETE
    TO service_role
    USING (true);

-- BULK_MESSAGE_RECIPIENTS TABLE RLS
ALTER TABLE public.bulk_message_recipients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can view message recipients" ON public.bulk_message_recipients;
CREATE POLICY "Service role can view message recipients"
    ON public.bulk_message_recipients
    FOR SELECT
    TO service_role
    USING (true);

DROP POLICY IF EXISTS "Service role can insert message recipients" ON public.bulk_message_recipients;
CREATE POLICY "Service role can insert message recipients"
    ON public.bulk_message_recipients
    FOR INSERT
    TO service_role
    WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can update message recipients" ON public.bulk_message_recipients;
CREATE POLICY "Service role can update message recipients"
    ON public.bulk_message_recipients
    FOR UPDATE
    TO service_role
    USING (true);

DROP POLICY IF EXISTS "Service role can delete message recipients" ON public.bulk_message_recipients;
CREATE POLICY "Service role can delete message recipients"
    ON public.bulk_message_recipients
    FOR DELETE
    TO service_role
    USING (true);

-- ============================================
-- MIGRATION 3: SEED DATA
-- ============================================
-- Note: This section is wrapped in DO block to handle potential duplicate key errors gracefully
-- If data already exists, it will skip insertion

DO $$
BEGIN
    -- Insert Schools (if not exist)
    INSERT INTO public.schools (id, name, slug, address, postcode, city, phone, email, website_url, is_active)
    VALUES
        ('11111111-1111-1111-1111-111111111111'::uuid, 'Greenwood Academy', 'greenwood-academy', '123 High Street', 'SW1A 1AA', 'London', '020 7946 0958', 'info@greenwood.ac.uk', 'https://greenwood.ac.uk', true),
        ('22222222-2222-2222-2222-222222222222'::uuid, 'St. Mary''s Secondary School', 'st-marys-secondary', '45 Church Road', 'M1 1AD', 'Manchester', '0161 496 0183', 'admin@stmarys.sch.uk', 'https://stmarys.sch.uk', true),
        ('33333333-3333-3333-3333-333333333333'::uuid, 'Riverside High School', 'riverside-high', '78 River Lane', 'EH1 1YZ', 'Edinburgh', '0131 496 0234', 'contact@riverside.sch.uk', 'https://riverside.sch.uk', true),
        ('44444444-4444-4444-4444-444444444444'::uuid, 'Oakwood Grammar School', 'oakwood-grammar', '56 Park Avenue', 'B2 4QA', 'Birmingham', '0121 496 0567', 'info@oakwood.sch.uk', 'https://oakwood.sch.uk', true),
        ('55555555-5555-5555-5555-555555555555'::uuid, 'Hillside Community College', 'hillside-community', '92 Valley Road', 'LS1 3AB', 'Leeds', '0113 496 0789', 'admin@hillside.ac.uk', 'https://hillside.ac.uk', true)
    ON CONFLICT (id) DO NOTHING;

    RAISE NOTICE 'Schools inserted successfully';
END $$;

-- Continue with rest of seed data...
-- (Due to length, I'll provide the complete file that you can copy)
