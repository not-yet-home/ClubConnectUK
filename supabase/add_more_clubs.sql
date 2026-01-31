-- Add sample clubs for St. Mary's Secondary and Riverside High
-- Run this after the initial seed.sql

-- ============================================
-- CLUBS FOR ST. MARY'S SECONDARY
-- ============================================
INSERT INTO public.clubs (id, school_id, club_name, club_code, description, members_count, status)
VALUES
    (
        'c0000004-0004-0004-0004-000000000004'::uuid,
        'b0000002-0002-0002-0002-000000000002'::uuid,  -- St. Mary's Secondary
        'Chess Club',
        'CHESS',
        'Strategic thinking and competitive chess tournaments.',
        15,
        'active'
    ),
    (
        'c0000005-0005-0005-0005-000000000005'::uuid,
        'b0000002-0002-0002-0002-000000000002'::uuid,  -- St. Mary's Secondary
        'Music Ensemble',
        'MUSIC',
        'Orchestra, band practice, and musical performances.',
        28,
        'active'
    ),
    (
        'c0000006-0006-0006-0006-000000000006'::uuid,
        'b0000002-0002-0002-0002-000000000002'::uuid,  -- St. Mary's Secondary
        'Science Club',
        'SCI',
        'Experiments, science fair projects, and STEM activities.',
        22,
        'active'
    );

-- ============================================
-- CLUBS FOR RIVERSIDE HIGH
-- ============================================
INSERT INTO public.clubs (id, school_id, club_name, club_code, description, members_count, status)
VALUES
    (
        'c0000007-0007-0007-0007-000000000007'::uuid,
        'b0000003-0003-0003-0003-000000000003'::uuid,  -- Riverside High
        'Art Workshop',
        'ART',
        'Painting, sculpture, and creative arts classes.',
        20,
        'active'
    ),
    (
        'c0000008-0008-0008-0008-000000000008'::uuid,
        'b0000003-0003-0003-0003-000000000003'::uuid,  -- Riverside High
        'Basketball Team',
        'BBALL',
        'School basketball team practice and competitions.',
        16,
        'active'
    ),
    (
        'c0000009-0009-0009-0009-000000000009'::uuid,
        'b0000003-0003-0003-0003-000000000003'::uuid,  -- Riverside High
        'Debate Society',
        'DEBATE',
        'Debate competitions and public speaking skills.',
        12,
        'active'
    ),
    (
        'c0000010-0010-0010-0010-000000000010'::uuid,
        'b0000003-0003-0003-0003-000000000003'::uuid,  -- Riverside High
        'Environmental Club',
        'ECO',
        'Sustainability projects and environmental awareness.',
        18,
        'active'
    );
