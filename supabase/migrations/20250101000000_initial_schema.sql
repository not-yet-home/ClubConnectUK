-- Initial Schema Migration
-- Creates the core tables for ClubConnect UK
-- Author: ClubConnect Team
-- Created: 2025-01-01

-- Note: Using gen_random_uuid() which is built-in to PostgreSQL 13+
-- No extensions needed!

-- ============================================
-- HELPER FUNCTIONS
-- ============================================
-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SCHOOLS TABLE
-- ============================================
-- Stores information about schools in the UK

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

-- ============================================
-- TEACHERS TABLE
-- ============================================
-- Stores information about teachers

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

-- ============================================
-- SCHOOL_CLUBS TABLE
-- ============================================
-- Stores information about school clubs and societies

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

-- ============================================
-- BULK_MESSAGES TABLE
-- ============================================
-- Stores bulk messages sent to teachers

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

-- ============================================
-- BULK_MESSAGE_RECIPIENTS TABLE
-- ============================================
-- Tracks individual recipients of bulk messages

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

-- ============================================
-- INDEXES
-- ============================================
-- Performance optimization indexes

-- Schools
CREATE INDEX idx_schools_slug ON public.schools(slug);
CREATE INDEX idx_schools_active ON public.schools(is_active);
CREATE INDEX idx_schools_city ON public.schools(city);

-- Teachers
CREATE INDEX idx_teachers_school_id ON public.teachers(school_id);
CREATE INDEX idx_teachers_email ON public.teachers(email);
CREATE INDEX idx_teachers_department ON public.teachers(department);
CREATE INDEX idx_teachers_active ON public.teachers(is_active);

-- School Clubs
CREATE INDEX idx_school_clubs_school_id ON public.school_clubs(school_id);
CREATE INDEX idx_school_clubs_slug ON public.school_clubs(slug);
CREATE INDEX idx_school_clubs_category ON public.school_clubs(category);
CREATE INDEX idx_school_clubs_active ON public.school_clubs(is_active);
CREATE INDEX idx_school_clubs_teacher_in_charge ON public.school_clubs(teacher_in_charge_id);

-- Bulk Messages
CREATE INDEX idx_bulk_messages_school_id ON public.bulk_messages(school_id);
CREATE INDEX idx_bulk_messages_status ON public.bulk_messages(status);
CREATE INDEX idx_bulk_messages_scheduled_for ON public.bulk_messages(scheduled_for);
CREATE INDEX idx_bulk_messages_sent_at ON public.bulk_messages(sent_at);

-- Bulk Message Recipients
CREATE INDEX idx_bulk_message_recipients_message_id ON public.bulk_message_recipients(bulk_message_id);
CREATE INDEX idx_bulk_message_recipients_teacher_id ON public.bulk_message_recipients(teacher_id);
CREATE INDEX idx_bulk_message_recipients_status ON public.bulk_message_recipients(status);

-- ============================================
-- COMMENTS
-- ============================================
-- Add helpful comments for documentation

COMMENT ON TABLE public.schools IS 'Schools in the UK';
COMMENT ON TABLE public.teachers IS 'Teaching staff at schools';
COMMENT ON TABLE public.school_clubs IS 'School clubs and societies';
COMMENT ON TABLE public.bulk_messages IS 'Bulk messages sent to teachers';
COMMENT ON TABLE public.bulk_message_recipients IS 'Individual recipients of bulk messages';

