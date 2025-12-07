-- Row Level Security (RLS) Policies
-- Ensures data security and proper access control
-- Author: ClubConnect Team
-- Created: 2025-01-01

-- ============================================
-- SCHOOLS TABLE RLS
-- ============================================

-- Enable RLS
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- Policy: Active schools are viewable by everyone
CREATE POLICY "Active schools are viewable by everyone"
    ON public.schools
    FOR SELECT
    TO authenticated
    USING (is_active = true);

-- Policy: Only service role can insert schools
-- Note: In production, you may want to create an admin role
CREATE POLICY "Service role can insert schools"
    ON public.schools
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Policy: Only service role can update schools
CREATE POLICY "Service role can update schools"
    ON public.schools
    FOR UPDATE
    TO service_role
    USING (true);

-- Policy: Only service role can delete schools
CREATE POLICY "Service role can delete schools"
    ON public.schools
    FOR DELETE
    TO service_role
    USING (true);

-- ============================================
-- TEACHERS TABLE RLS
-- ============================================

-- Enable RLS
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- Policy: Active teachers are viewable by everyone
CREATE POLICY "Active teachers are viewable by everyone"
    ON public.teachers
    FOR SELECT
    TO authenticated
    USING (is_active = true);

-- Policy: Only service role can insert teachers
CREATE POLICY "Service role can insert teachers"
    ON public.teachers
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Policy: Only service role can update teachers
CREATE POLICY "Service role can update teachers"
    ON public.teachers
    FOR UPDATE
    TO service_role
    USING (true);

-- Policy: Only service role can delete teachers
CREATE POLICY "Service role can delete teachers"
    ON public.teachers
    FOR DELETE
    TO service_role
    USING (true);

-- ============================================
-- SCHOOL_CLUBS TABLE RLS
-- ============================================

-- Enable RLS
ALTER TABLE public.school_clubs ENABLE ROW LEVEL SECURITY;

-- Policy: Active school clubs are viewable by everyone
CREATE POLICY "Active school clubs are viewable by everyone"
    ON public.school_clubs
    FOR SELECT
    TO authenticated
    USING (is_active = true);

-- Policy: Only service role can insert school clubs
CREATE POLICY "Service role can insert school clubs"
    ON public.school_clubs
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Policy: Only service role can update school clubs
CREATE POLICY "Service role can update school clubs"
    ON public.school_clubs
    FOR UPDATE
    TO service_role
    USING (true);

-- Policy: Only service role can delete school clubs
CREATE POLICY "Service role can delete school clubs"
    ON public.school_clubs
    FOR DELETE
    TO service_role
    USING (true);

-- ============================================
-- BULK_MESSAGES TABLE RLS
-- ============================================

-- Enable RLS
ALTER TABLE public.bulk_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can view bulk messages
-- Note: In production, you may want school admins to view their own messages
CREATE POLICY "Service role can view bulk messages"
    ON public.bulk_messages
    FOR SELECT
    TO service_role
    USING (true);

-- Policy: Only service role can insert bulk messages
CREATE POLICY "Service role can insert bulk messages"
    ON public.bulk_messages
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Policy: Only service role can update bulk messages
CREATE POLICY "Service role can update bulk messages"
    ON public.bulk_messages
    FOR UPDATE
    TO service_role
    USING (true);

-- Policy: Only service role can delete bulk messages
CREATE POLICY "Service role can delete bulk messages"
    ON public.bulk_messages
    FOR DELETE
    TO service_role
    USING (true);

-- ============================================
-- BULK_MESSAGE_RECIPIENTS TABLE RLS
-- ============================================

-- Enable RLS
ALTER TABLE public.bulk_message_recipients ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can view message recipients
CREATE POLICY "Service role can view message recipients"
    ON public.bulk_message_recipients
    FOR SELECT
    TO service_role
    USING (true);

-- Policy: Only service role can insert message recipients
CREATE POLICY "Service role can insert message recipients"
    ON public.bulk_message_recipients
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Policy: Only service role can update message recipients
CREATE POLICY "Service role can update message recipients"
    ON public.bulk_message_recipients
    FOR UPDATE
    TO service_role
    USING (true);

-- Policy: Only service role can delete message recipients
CREATE POLICY "Service role can delete message recipients"
    ON public.bulk_message_recipients
    FOR DELETE
    TO service_role
    USING (true);

-- ============================================
-- STORAGE POLICIES
-- ============================================
-- Note: These need to be configured in Supabase Dashboard or via separate commands

-- Bucket for school logos and club images should be configured with:
-- - Public read access for all authenticated users
-- - Write access only for service role or school admins
-- - File size limits (e.g., 5MB for images)
-- - Allowed file types: image/jpeg, image/png, image/webp

-- ============================================
-- NOTES ON SECURITY
-- ============================================
-- 
-- Current Setup:
-- - All tables are protected by RLS
-- - Only authenticated users can view active records
-- - Only service_role (backend/admin) can modify data
--
-- Future Enhancements:
-- - Add custom claims or JWT tokens to identify school admins
-- - Create policies that allow school admins to manage their own school's data
-- - Implement teacher authentication so teachers can update their own profiles
-- - Add role-based access control (RBAC) for different user types
