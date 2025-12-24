-- Initial Schema Migration
-- Creates the core tables for ClubConnect UK
-- Author: ClubConnect Team
-- Updated: 2025-12-24 to match ERD

-- Note: Using gen_random_uuid() which is built-in to PostgreSQL 13+

-- ============================================
-- HELPER FUNCTIONS
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE public.school_status AS ENUM ('active', 'inactive', 'pending');
CREATE TYPE public.day_of_week AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
CREATE TYPE public.frequency_type AS ENUM ('weekly', 'bi-weekly', 'monthly');
CREATE TYPE public.cover_status AS ENUM ('active', 'inactive', 'cancelled');
CREATE TYPE public.document_type AS ENUM ('teacher_file', 'system_template', 'sent_attachment');
CREATE TYPE public.document_status AS ENUM ('active', 'archived', 'deleted');
CREATE TYPE public.assignment_status AS ENUM ('invited', 'accepted', 'declined', 'pending', 'confirmed');
CREATE TYPE public.broadcast_channel AS ENUM ('sms', 'email', 'all');
CREATE TYPE public.broadcast_status AS ENUM ('draft', 'sending', 'completed', 'failed');
CREATE TYPE public.message_channel AS ENUM ('sms', 'email');
CREATE TYPE public.message_direction AS ENUM ('outbound', 'inbound');
CREATE TYPE public.message_status AS ENUM ('sent', 'delivered', 'opened', 'replied', 'failed');

-- ============================================
-- PERSON_DETAILS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.person_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(255) NOT NULL,
    middle_name VARCHAR(255),
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    contact VARCHAR(100),
    image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER on_person_details_updated
    BEFORE UPDATE ON public.person_details
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.documents (
    id BIGSERIAL PRIMARY KEY,
    type public.document_type NOT NULL,
    filename VARCHAR(255) NOT NULL,
    storage_path VARCHAR(512) NOT NULL,
    title VARCHAR(255),
    description TEXT,
    status public.document_status DEFAULT 'active' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER on_documents_updated
    BEFORE UPDATE ON public.documents
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- SCHOOLS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_name VARCHAR(255) NOT NULL,
    address TEXT,
    status public.school_status DEFAULT 'active' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER on_schools_updated
    BEFORE UPDATE ON public.schools
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- CLUBS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    club_name VARCHAR(255) NOT NULL,
    club_code VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER on_clubs_updated
    BEFORE UPDATE ON public.clubs
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- TEACHERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persons_details_id UUID NOT NULL REFERENCES public.person_details(id) ON DELETE CASCADE,
    documents_id UUID, -- Optional FK, can be null
    primary_styles VARCHAR(255),
    secondary_styles VARCHAR(255),
    general_notes TEXT,
    is_blocked BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER on_teachers_updated
    BEFORE UPDATE ON public.teachers
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- TEACHER_DOCUMENTS TABLE (Junction Table)
-- ============================================
CREATE TABLE IF NOT EXISTS public.teacher_documents (
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    document_id BIGINT NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    PRIMARY KEY (teacher_id, document_id)
);

-- ============================================
-- COVER_RULES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.cover_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
    frequency public.frequency_type NOT NULL DEFAULT 'weekly',
    day_of_week public.day_of_week NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status public.cover_status DEFAULT 'active' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER on_cover_rules_updated
    BEFORE UPDATE ON public.cover_rules
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- COVER_OCCURRENCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.cover_occurrences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cover_rule_id UUID NOT NULL REFERENCES public.cover_rules(id) ON DELETE CASCADE,
    meeting_date TIMESTAMPTZ NOT NULL,
    actual_start TIME,
    actual_end TIME,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER on_cover_occurrences_updated
    BEFORE UPDATE ON public.cover_occurrences
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- TEACHER_COVER_ASSIGNMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.teacher_cover_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    cover_occurrence_id UUID NOT NULL REFERENCES public.cover_occurrences(id) ON DELETE CASCADE,
    status public.assignment_status DEFAULT 'pending' NOT NULL,
    assigned_by UUID, -- FK to a users table if it exists, otherwise just a reference
    invited_at TIMESTAMPTZ,
    response_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- BROADCASTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.broadcasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id BIGINT REFERENCES public.documents(id) ON DELETE SET NULL,
    assignment_id UUID REFERENCES public.teacher_cover_assignments(id) ON DELETE SET NULL,
    subject VARCHAR(255),
    body TEXT,
    channel_used public.broadcast_channel NOT NULL,
    recipients_count INTEGER DEFAULT 0 NOT NULL,
    status public.broadcast_status DEFAULT 'draft' NOT NULL,
    sent_by_user_id UUID, -- FK to a users table if it exists
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    broadcast_id UUID REFERENCES public.broadcasts(id) ON DELETE SET NULL,
    document_id BIGINT REFERENCES public.documents(id) ON DELETE SET NULL,
    channel public.message_channel NOT NULL,
    direction public.message_direction NOT NULL,
    subject VARCHAR(255),
    body TEXT,
    status public.message_status DEFAULT 'sent' NOT NULL,
    external_id VARCHAR(255), -- Twilio SID / Resend ID
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER on_messages_updated
    BEFORE UPDATE ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_person_details_last_name ON public.person_details(last_name);
CREATE INDEX idx_schools_status ON public.schools(status);
CREATE INDEX idx_clubs_school_id ON public.clubs(school_id);
CREATE INDEX idx_teachers_person_id ON public.teachers(persons_details_id);
CREATE INDEX idx_teacher_documents_teacher ON public.teacher_documents(teacher_id);
CREATE INDEX idx_teacher_documents_document ON public.teacher_documents(document_id);
CREATE INDEX idx_cover_rules_school_id ON public.cover_rules(school_id);
CREATE INDEX idx_cover_rules_club_id ON public.cover_rules(club_id);
CREATE INDEX idx_cover_occurrences_rule_id ON public.cover_occurrences(cover_rule_id);
CREATE INDEX idx_cover_occurrences_date ON public.cover_occurrences(meeting_date);
CREATE INDEX idx_teacher_cover_assignments_teacher ON public.teacher_cover_assignments(teacher_id);
CREATE INDEX idx_teacher_cover_assignments_occurrence ON public.teacher_cover_assignments(cover_occurrence_id);
CREATE INDEX idx_broadcasts_template ON public.broadcasts(template_id);
CREATE INDEX idx_broadcasts_assignment ON public.broadcasts(assignment_id);
CREATE INDEX idx_messages_teacher ON public.messages(teacher_id);
CREATE INDEX idx_messages_broadcast ON public.messages(broadcast_id);
CREATE INDEX idx_messages_status ON public.messages(status);
