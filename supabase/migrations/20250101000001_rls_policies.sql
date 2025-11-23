-- Row Level Security (RLS) Policies
-- Ensures data security and proper access control
-- Author: ClubConnect Team
-- Created: 2025-01-01

-- ============================================
-- PROFILES TABLE RLS
-- ============================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view profiles
CREATE POLICY "Profiles are viewable by everyone"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ============================================
-- CLUBS TABLE RLS
-- ============================================

-- Enable RLS
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active clubs
CREATE POLICY "Active clubs are viewable by everyone"
    ON public.clubs
    FOR SELECT
    TO authenticated
    USING (is_active = true);

-- Policy: Authenticated users can create clubs
CREATE POLICY "Authenticated users can create clubs"
    ON public.clubs
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by);

-- Policy: Club admins can update their clubs
CREATE POLICY "Club admins can update their clubs"
    ON public.clubs
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.memberships
            WHERE club_id = clubs.id
            AND user_id = auth.uid()
            AND role IN ('admin', 'owner')
            AND status = 'active'
        )
    );

-- Policy: Club owners can delete their clubs
CREATE POLICY "Club owners can delete their clubs"
    ON public.clubs
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.memberships
            WHERE club_id = clubs.id
            AND user_id = auth.uid()
            AND role = 'owner'
            AND status = 'active'
        )
    );

-- ============================================
-- MEMBERSHIPS TABLE RLS
-- ============================================

-- Enable RLS
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

-- Policy: Members can view memberships of their clubs
CREATE POLICY "Members can view their club memberships"
    ON public.memberships
    FOR SELECT
    TO authenticated
    USING (
        -- User is a member of the club
        user_id = auth.uid()
        OR
        -- User is viewing memberships of a club they belong to
        EXISTS (
            SELECT 1 FROM public.memberships AS m
            WHERE m.club_id = memberships.club_id
            AND m.user_id = auth.uid()
            AND m.status = 'active'
        )
    );

-- Policy: Users can join clubs (create membership)
CREATE POLICY "Users can join clubs"
    ON public.memberships
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id
        AND role = 'member'
        AND status IN ('pending', 'active')
    );

-- Policy: Club admins can update memberships
CREATE POLICY "Club admins can update memberships"
    ON public.memberships
    FOR UPDATE
    TO authenticated
    USING (
        -- User is updating their own membership
        user_id = auth.uid()
        OR
        -- User is an admin/owner of the club
        EXISTS (
            SELECT 1 FROM public.memberships AS m
            WHERE m.club_id = memberships.club_id
            AND m.user_id = auth.uid()
            AND m.role IN ('admin', 'owner')
            AND m.status = 'active'
        )
    );

-- Policy: Users can leave clubs (delete their membership)
CREATE POLICY "Users can leave clubs"
    ON public.memberships
    FOR DELETE
    TO authenticated
    USING (
        user_id = auth.uid()
        OR
        -- Club admins can remove members
        EXISTS (
            SELECT 1 FROM public.memberships AS m
            WHERE m.club_id = memberships.club_id
            AND m.user_id = auth.uid()
            AND m.role IN ('admin', 'owner')
            AND m.status = 'active'
        )
    );

-- ============================================
-- EVENTS TABLE RLS
-- ============================================

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Policy: Public events are viewable by everyone
CREATE POLICY "Public events are viewable by everyone"
    ON public.events
    FOR SELECT
    TO authenticated
    USING (
        is_public = true
        OR
        -- Private events viewable by club members
        EXISTS (
            SELECT 1 FROM public.memberships
            WHERE club_id = events.club_id
            AND user_id = auth.uid()
            AND status = 'active'
        )
    );

-- Policy: Club admins can create events
CREATE POLICY "Club admins can create events"
    ON public.events
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = created_by
        AND
        EXISTS (
            SELECT 1 FROM public.memberships
            WHERE club_id = events.club_id
            AND user_id = auth.uid()
            AND role IN ('admin', 'owner')
            AND status = 'active'
        )
    );

-- Policy: Club admins can update events
CREATE POLICY "Club admins can update events"
    ON public.events
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.memberships
            WHERE club_id = events.club_id
            AND user_id = auth.uid()
            AND role IN ('admin', 'owner')
            AND status = 'active'
        )
    );

-- Policy: Club admins can delete events
CREATE POLICY "Club admins can delete events"
    ON public.events
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.memberships
            WHERE club_id = events.club_id
            AND user_id = auth.uid()
            AND role IN ('admin', 'owner')
            AND status = 'active'
        )
    );

-- ============================================
-- EVENT_ATTENDEES TABLE RLS
-- ============================================

-- Enable RLS
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view attendees of events they can see
CREATE POLICY "Users can view event attendees"
    ON public.event_attendees
    FOR SELECT
    TO authenticated
    USING (
        -- User is the attendee
        user_id = auth.uid()
        OR
        -- User can view the event
        EXISTS (
            SELECT 1 FROM public.events
            WHERE id = event_attendees.event_id
            AND (
                is_public = true
                OR
                EXISTS (
                    SELECT 1 FROM public.memberships
                    WHERE club_id = events.club_id
                    AND user_id = auth.uid()
                    AND status = 'active'
                )
            )
        )
    );

-- Policy: Users can RSVP to events
CREATE POLICY "Users can RSVP to events"
    ON public.event_attendees
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id
        AND
        -- User can view the event
        EXISTS (
            SELECT 1 FROM public.events
            WHERE id = event_attendees.event_id
            AND (
                is_public = true
                OR
                EXISTS (
                    SELECT 1 FROM public.memberships
                    WHERE club_id = events.club_id
                    AND user_id = auth.uid()
                    AND status = 'active'
                )
            )
        )
    );

-- Policy: Users can update their RSVP
CREATE POLICY "Users can update their RSVP"
    ON public.event_attendees
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can remove their RSVP
CREATE POLICY "Users can remove their RSVP"
    ON public.event_attendees
    FOR DELETE
    TO authenticated
    USING (
        auth.uid() = user_id
        OR
        -- Event organizers can remove attendees
        EXISTS (
            SELECT 1 FROM public.events e
            JOIN public.memberships m ON m.club_id = e.club_id
            WHERE e.id = event_attendees.event_id
            AND m.user_id = auth.uid()
            AND m.role IN ('admin', 'owner')
            AND m.status = 'active'
        )
    );

-- ============================================
-- STORAGE POLICIES
-- ============================================
-- Note: These need to be configured in Supabase Dashboard or via separate commands

-- Bucket for club logos, banners, and event images should be configured with:
-- - Public read access for all authenticated users
-- - Write access only for club admins/owners
-- - File size limits (e.g., 5MB for images)
-- - Allowed file types: image/jpeg, image/png, image/webp
