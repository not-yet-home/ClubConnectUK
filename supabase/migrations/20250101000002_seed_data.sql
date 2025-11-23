-- Seed Data Migration
-- Provides initial test data for development
-- Author: ClubConnect Team
-- Created: 2025-01-01
-- 
-- NOTE: This migration creates test data.
-- In production, you may want to skip this migration.

-- ============================================
-- SAMPLE CLUBS
-- ============================================

INSERT INTO public.clubs (id, name, slug, description, category, logo_url, contact_email, is_active, created_by)
VALUES
    (
        '11111111-1111-1111-1111-111111111111'::uuid,
        'Computer Science Society',
        'computer-science-society',
        'Connect with fellow CS students, attend tech talks, and build amazing projects together.',
        'technology',
        NULL,
        'css@university.ac.uk',
        true,
        NULL
    ),
    (
        '22222222-2222-2222-2222-222222222222'::uuid,
        'Football Club',
        'football-club',
        'Weekly training sessions and friendly matches. All skill levels welcome!',
        'sports',
        NULL,
        'football@university.ac.uk',
        true,
        NULL
    ),
    (
        '33333333-3333-3333-3333-333333333333'::uuid,
        'Drama Society',
        'drama-society',
        'Perform in plays, musicals, and comedy shows. Experience the magic of theatre!',
        'arts',
        NULL,
        'drama@university.ac.uk',
        true,
        NULL
    ),
    (
        '44444444-4444-4444-4444-444444444444'::uuid,
        'International Students Association',
        'international-students',
        'Supporting international students and celebrating cultural diversity on campus.',
        'cultural',
        NULL,
        'isa@university.ac.uk',
        true,
        NULL
    ),
    (
        '55555555-5555-5555-5555-555555555555'::uuid,
        'Environmental Action Group',
        'environmental-action',
        'Making our campus greener through sustainability initiatives and awareness campaigns.',
        'volunteering',
        NULL,
        'green@university.ac.uk',
        true,
        NULL
    );

-- ============================================
-- SAMPLE EVENTS
-- ============================================

INSERT INTO public.events (id, club_id, title, description, event_type, status, location, is_online, start_time, end_time, capacity, is_public)
VALUES
    (
        'e1111111-1111-1111-1111-111111111111'::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid,
        'Hackathon 2025',
        'Join us for 24 hours of coding, pizza, and innovation! Build something awesome with your team.',
        'competition',
        'published',
        'Engineering Building, Room 101',
        false,
        NOW() + INTERVAL '7 days',
        NOW() + INTERVAL '8 days',
        100,
        true
    ),
    (
        'e2222222-2222-2222-2222-222222222222'::uuid,
        '22222222-2222-2222-2222-222222222222'::uuid,
        'Weekly Training Session',
        'Regular football training for all members. Bring your boots!',
        'meeting',
        'published',
        'Sports Ground',
        false,
        NOW() + INTERVAL '3 days' + INTERVAL '18 hours',
        NOW() + INTERVAL '3 days' + INTERVAL '20 hours',
        30,
        true
    ),
    (
        'e3333333-3333-3333-3333-333333333333'::uuid,
        '33333333-3333-3333-3333-333333333333'::uuid,
        'Shakespeare Night',
        'A special performance of Romeo and Juliet. Free entry for students!',
        'social',
        'published',
        'University Theatre',
        false,
        NOW() + INTERVAL '14 days' + INTERVAL '19 hours',
        NOW() + INTERVAL '14 days' + INTERVAL '22 hours',
        150,
        true
    ),
    (
        'e4444444-4444-4444-4444-444444444444'::uuid,
        '44444444-4444-4444-4444-444444444444'::uuid,
        'Cultural Food Festival',
        'Taste cuisines from around the world! Bring a dish from your culture to share.',
        'social',
        'published',
        'Student Union Building',
        false,
        NOW() + INTERVAL '10 days' + INTERVAL '12 hours',
        NOW() + INTERVAL '10 days' + INTERVAL '16 hours',
        200,
        true
    ),
    (
        'e5555555-5555-5555-5555-555555555555'::uuid,
        '55555555-5555-5555-5555-555555555555'::uuid,
        'Campus Cleanup Day',
        'Help us keep our campus beautiful. Gloves and bags provided!',
        'fundraiser',
        'published',
        'Student Union Main Entrance',
        false,
        NOW() + INTERVAL '5 days' + INTERVAL '9 hours',
        NOW() + INTERVAL '5 days' + INTERVAL '12 hours',
        50,
        true
    ),
    (
        'e6666666-6666-6666-6666-666666666666'::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid,
        'Introduction to React Workshop',
        'Learn the basics of React in this hands-on workshop. Laptops required.',
        'workshop',
        'published',
        NULL,
        true,
        NOW() + INTERVAL '12 days' + INTERVAL '14 hours',
        NOW() + INTERVAL '12 days' + INTERVAL '17 hours',
        40,
        true
    );

-- ============================================
-- HELPER COMMENTS
-- ============================================

COMMENT ON TABLE public.clubs IS 'Sample clubs created for testing';
COMMENT ON TABLE public.events IS 'Sample events created for testing';

-- Note: User profiles and memberships should be created through the application
-- or Supabase Auth dashboard to ensure proper authentication setup.
