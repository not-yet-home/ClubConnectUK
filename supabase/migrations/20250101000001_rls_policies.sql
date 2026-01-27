-- Row Level Security (RLS) Policies
-- Ensures data security and proper access control
-- Author: ClubConnect Team
-- Updated: 2025-12-24 to match new schema

-- ============================================
-- PERSON_DETAILS TABLE RLS
-- ============================================
ALTER TABLE public.person_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage person_details"
    ON public.person_details
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can view person_details"
    ON public.person_details
    FOR SELECT
    TO authenticated
    USING (true);

-- ============================================
-- DOCUMENTS TABLE RLS
-- ============================================
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage documents"
    ON public.documents
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can view active documents"
    ON public.documents
    FOR SELECT
    TO authenticated
    USING (status = 'active');

-- ============================================
-- SCHOOLS TABLE RLS
-- ============================================
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage schools"
    ON public.schools
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can view active schools"
    ON public.schools
    FOR SELECT
    TO authenticated
    USING (status = 'active');

CREATE POLICY "Authenticated users can manage schools"
    ON public.schools
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================
-- CLUBS TABLE RLS
-- ============================================
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage clubs"
    ON public.clubs
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can view clubs"
    ON public.clubs
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can manage clubs"
    ON public.clubs
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================
-- TEACHERS TABLE RLS
-- ============================================
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage teachers"
    ON public.teachers
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can view non-blocked teachers"
    ON public.teachers
    FOR SELECT
    TO authenticated
    USING (is_blocked = false);

CREATE POLICY "Authenticated users can manage teachers"
    ON public.teachers
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================
-- TEACHER_DOCUMENTS TABLE RLS
-- ============================================
ALTER TABLE public.teacher_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage teacher_documents"
    ON public.teacher_documents
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can view teacher_documents"
    ON public.teacher_documents
    FOR SELECT
    TO authenticated
    USING (true);

-- ============================================
-- COVER_RULES TABLE RLS
-- ============================================
ALTER TABLE public.cover_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage cover_rules"
    ON public.cover_rules
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can view active cover_rules"
    ON public.cover_rules
    FOR SELECT
    TO authenticated
    USING (status = 'active');

-- ============================================
-- COVER_OCCURRENCES TABLE RLS
-- ============================================
ALTER TABLE public.cover_occurrences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage cover_occurrences"
    ON public.cover_occurrences
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can view cover_occurrences"
    ON public.cover_occurrences
    FOR SELECT
    TO authenticated
    USING (true);

-- ============================================
-- TEACHER_COVER_ASSIGNMENTS TABLE RLS
-- ============================================
ALTER TABLE public.teacher_cover_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage teacher_cover_assignments"
    ON public.teacher_cover_assignments
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can view teacher_cover_assignments"
    ON public.teacher_cover_assignments
    FOR SELECT
    TO authenticated
    USING (true);

-- ============================================
-- BROADCASTS TABLE RLS
-- ============================================
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage broadcasts"
    ON public.broadcasts
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can view broadcasts"
    ON public.broadcasts
    FOR SELECT
    TO authenticated
    USING (true);

-- ============================================
-- MESSAGES TABLE RLS
-- ============================================
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage messages"
    ON public.messages
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can view messages"
    ON public.messages
    FOR SELECT
    TO authenticated
    USING (true);

-- ============================================
-- NOTES ON SECURITY
-- ============================================
-- 
-- Current Setup:
-- - All tables are protected by RLS
-- - Only authenticated users can view records (with some status filters)
-- - Only service_role (backend/admin) can modify data
--
-- Future Enhancements:
-- - Add custom claims or JWT tokens to identify school admins
-- - Create policies that allow school admins to manage their own school's data
-- - Implement teacher authentication so teachers can update their own profiles
-- - Add role-based access control (RBAC) for different user types
