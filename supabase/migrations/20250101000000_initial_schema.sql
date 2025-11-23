-- Initial Schema Migration
-- Creates the core tables for ClubConnect UK
-- Author: ClubConnect Team
-- Created: 2025-01-01

-- Note: Using gen_random_uuid() which is built-in to PostgreSQL 13+
-- No extensions needed!

-- ============================================
-- PROFILES TABLE
-- ============================================
-- Extends auth.users with additional profile information

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    university TEXT,
    course TEXT,
    graduation_year INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profiles_updated
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- CLUBS TABLE
-- ============================================
-- Stores information about university clubs and societies

CREATE TABLE IF NOT EXISTS public.clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('sports', 'academic', 'arts', 'cultural', 'technology', 'social', 'volunteering', 'other')),
    logo_url TEXT,
    banner_url TEXT,
    contact_email TEXT,
    website_url TEXT,
    social_links JSONB DEFAULT '{}'::JSONB,
    is_active BOOLEAN DEFAULT true NOT NULL,
    member_count INTEGER DEFAULT 0 NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER on_clubs_updated
    BEFORE UPDATE ON public.clubs
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- MEMBERSHIPS TABLE
-- ============================================
-- Tracks user membership in clubs

CREATE TYPE membership_role AS ENUM ('member', 'admin', 'owner');
CREATE TYPE membership_status AS ENUM ('pending', 'active', 'inactive');

CREATE TABLE IF NOT EXISTS public.memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role membership_role DEFAULT 'member' NOT NULL,
    status membership_status DEFAULT 'active' NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(club_id, user_id)
);

CREATE TRIGGER on_memberships_updated
    BEFORE UPDATE ON public.memberships
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to update club member count
CREATE OR REPLACE FUNCTION public.update_club_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
        UPDATE public.clubs 
        SET member_count = member_count + 1 
        WHERE id = NEW.club_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status != 'active' AND NEW.status = 'active' THEN
            UPDATE public.clubs 
            SET member_count = member_count + 1 
            WHERE id = NEW.club_id;
        ELSIF OLD.status = 'active' AND NEW.status != 'active' THEN
            UPDATE public.clubs 
            SET member_count = member_count - 1 
            WHERE id = NEW.club_id;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'active' THEN
        UPDATE public.clubs 
        SET member_count = member_count - 1 
        WHERE id = OLD.club_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_membership_change
    AFTER INSERT OR UPDATE OR DELETE ON public.memberships
    FOR EACH ROW
    EXECUTE FUNCTION public.update_club_member_count();

-- ============================================
-- EVENTS TABLE
-- ============================================
-- Stores club events and activities

CREATE TYPE event_type AS ENUM ('meeting', 'social', 'workshop', 'competition', 'fundraiser', 'other');
CREATE TYPE event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');

CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    event_type event_type DEFAULT 'other' NOT NULL,
    status event_status DEFAULT 'draft' NOT NULL,
    location TEXT,
    is_online BOOLEAN DEFAULT false NOT NULL,
    meeting_url TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    capacity INTEGER,
    is_public BOOLEAN DEFAULT true NOT NULL,
    image_url TEXT,
    attendee_count INTEGER DEFAULT 0 NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CHECK (end_time > start_time),
    CHECK (capacity IS NULL OR capacity > 0)
);

CREATE TRIGGER on_events_updated
    BEFORE UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- EVENT_ATTENDEES TABLE
-- ============================================
-- Tracks event attendance and RSVPs

CREATE TYPE attendance_status AS ENUM ('going', 'maybe', 'not_going', 'attended');

CREATE TABLE IF NOT EXISTS public.event_attendees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status attendance_status DEFAULT 'going' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(event_id, user_id)
);

CREATE TRIGGER on_event_attendees_updated
    BEFORE UPDATE ON public.event_attendees
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to update event attendee count
CREATE OR REPLACE FUNCTION public.update_event_attendee_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'going' THEN
        UPDATE public.events 
        SET attendee_count = attendee_count + 1 
        WHERE id = NEW.event_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status != 'going' AND NEW.status = 'going' THEN
            UPDATE public.events 
            SET attendee_count = attendee_count + 1 
            WHERE id = NEW.event_id;
        ELSIF OLD.status = 'going' AND NEW.status != 'going' THEN
            UPDATE public.events 
            SET attendee_count = attendee_count - 1 
            WHERE id = NEW.event_id;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'going' THEN
        UPDATE public.events 
        SET attendee_count = attendee_count - 1 
        WHERE id = OLD.event_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_event_attendance_change
    AFTER INSERT OR UPDATE OR DELETE ON public.event_attendees
    FOR EACH ROW
    EXECUTE FUNCTION public.update_event_attendee_count();

-- ============================================
-- INDEXES
-- ============================================
-- Performance optimization indexes

-- Profiles
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_university ON public.profiles(university);

-- Clubs
CREATE INDEX idx_clubs_slug ON public.clubs(slug);
CREATE INDEX idx_clubs_category ON public.clubs(category);
CREATE INDEX idx_clubs_active ON public.clubs(is_active);
CREATE INDEX idx_clubs_created_by ON public.clubs(created_by);

-- Memberships
CREATE INDEX idx_memberships_club_id ON public.memberships(club_id);
CREATE INDEX idx_memberships_user_id ON public.memberships(user_id);
CREATE INDEX idx_memberships_status ON public.memberships(status);
CREATE INDEX idx_memberships_role ON public.memberships(role);

-- Events
CREATE INDEX idx_events_club_id ON public.events(club_id);
CREATE INDEX idx_events_start_time ON public.events(start_time);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_is_public ON public.events(is_public);
CREATE INDEX idx_events_created_by ON public.events(created_by);

-- Event Attendees
CREATE INDEX idx_event_attendees_event_id ON public.event_attendees(event_id);
CREATE INDEX idx_event_attendees_user_id ON public.event_attendees(user_id);
CREATE INDEX idx_event_attendees_status ON public.event_attendees(status);

-- ============================================
-- COMMENTS
-- ============================================
-- Add helpful comments for documentation

COMMENT ON TABLE public.profiles IS 'Extended user profile information';
COMMENT ON TABLE public.clubs IS 'University clubs and societies';
COMMENT ON TABLE public.memberships IS 'User memberships in clubs';
COMMENT ON TABLE public.events IS 'Club events and activities';
COMMENT ON TABLE public.event_attendees IS 'Event attendance tracking';

