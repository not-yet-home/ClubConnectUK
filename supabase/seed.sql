-- Comprehensive Seed Data for Local Development
-- This file provides realistic test data for development
-- Run this with: supabase db reset (for local) or via SQL editor in Supabase dashboard

-- ============================================
-- NOTES
-- ============================================
-- 1. User IDs below are examples - you'll need to create actual users in Supabase Auth
-- 2. After creating users, update the UUIDs in this file to match
-- 3. Run this after the migrations have been applied

-- ============================================
-- HOW TO USE
-- ============================================
-- Option 1: Create users in Supabase Dashboard first, then run this
-- Option 2: Modify the UUIDs below to match your test users
-- Option 3: Comment out the profile/membership sections and just use clubs/events

-- ============================================
-- SAMPLE USER PROFILES
-- ============================================
-- Note: These assume you've created users in Supabase Auth with these IDs
-- Create users in Dashboard → Authentication → Users first!

-- Example user IDs (replace with your actual user IDs):
-- User 1: admin@clubconnect.uk
-- User 2: alice@example.com  
-- User 3: bob@example.com

-- Uncomment and update IDs once you've created users:
/*
UPDATE public.profiles
SET 
    full_name = 'Admin User',
    university = 'University of Example',
    course = 'Computer Science',
    graduation_year = 2026,
    bio = 'Platform administrator and tech enthusiast'
WHERE email = 'admin@clubconnect.uk';

UPDATE public.profiles
SET 
    full_name = 'Alice Johnson',
    university = 'University of Example',
    course = 'Business Management',
    graduation_year = 2025,
    bio = 'Love organizing events and meeting new people!'
WHERE email = 'alice@example.com';

UPDATE public.profiles
SET 
    full_name = 'Bob Smith',
    university = 'University of Example',
    course = 'Theatre Arts',
    graduation_year = 2027,
    bio = 'Actor, director, and drama enthusiast'
WHERE email = 'bob@example.com';
*/

-- ============================================
-- MORE SAMPLE CLUBS
-- ============================================

INSERT INTO public.clubs (name, slug, description, category, contact_email, is_active, social_links)
VALUES
    (
        'Photography Club',
        'photography-club',
        'Capture moments, share techniques, and explore photography together. Weekly photo walks and workshops.',
        'arts',
        'photo@university.ac.uk',
        true,
        '{"instagram": "photo_club_uni", "website": "https://photoclub.example.com"}'::jsonb
    ),
    (
        'Debate Society',
        'debate-society',
        'Sharpen your public speaking and critical thinking skills through weekly debates and competitions.',
        'academic',
        'debate@university.ac.uk',
        true,
        '{"twitter": "uni_debate"}'::jsonb
    ),
    (
        'Yoga & Wellness',
        'yoga-wellness',
        'Free weekly yoga sessions for students. All levels welcome, mats provided!',
        'sports',
        'yoga@university.ac.uk',
        true,
        '{"facebook": "UniYogaWellness"}'::jsonb
    ),
    (
        'Chess Club',
        'chess-club',
        'Play, learn, and compete. From beginners to tournament players, everyone is welcome.',
        'social',
        'chess@university.ac.uk',
        true,
        '{}'::jsonb
    ),
    (
        'Robotics Society',
        'robotics-society',
        'Build robots, participate in competitions, and explore the world of automation and AI.',
        'technology',
        'robotics@university.ac.uk',
        true,
        '{"youtube": "UniRobotics"}'::jsonb
    );

-- ============================================
-- ADDITIONAL EVENTS
-- ============================================

INSERT INTO public.events (club_id, title, description, event_type, status, location, is_online, meeting_url, start_time, end_time, capacity, is_public)
SELECT 
    c.id,
    'Photography Walk: City Streets',
    'Explore the city with your camera. Meet at the main entrance.',
    'social',
    'published',
    'City Centre',
    false,
    NULL,
    NOW() + INTERVAL '6 days' + INTERVAL '10 hours',
    NOW() + INTERVAL '6 days' + INTERVAL '13 hours',
    20,
    true
FROM public.clubs c WHERE c.slug = 'photography-club';

INSERT INTO public.events (club_id, title, description, event_type, status, location, is_online, meeting_url, start_time, end_time, capacity, is_public)
SELECT 
    c.id,
    'Inter-University Debate Championship',
    'Our team competes in the regional finals. Come support us!',
    'competition',
    'published',
    'University Hall',
    true,
    'https://meet.example.com/debate-finals',
    NOW() + INTERVAL '20 days' + INTERVAL '14 hours',
    NOW() + INTERVAL '20 days' + INTERVAL '18 hours',
    100,
    true
FROM public.clubs c WHERE c.slug = 'debate-society';

INSERT INTO public.events (club_id, title, description, event_type, status, location, is_online, meeting_url, start_time, end_time, is_public)
SELECT 
    c.id,
    'Sunset Yoga Session',
    'Relax and unwind with an outdoor yoga session at sunset.',
    'meeting',
    'published',
    'University Green',
    false,
    NULL,
    NOW() + INTERVAL '4 days' + INTERVAL '18 hours',
    NOW() + INTERVAL '4 days' + INTERVAL '19 hours' + INTERVAL '30 minutes',
    true
FROM public.clubs c WHERE c.slug = 'yoga-wellness';

INSERT INTO public.events (club_id, title, description, event_type, status, location, is_online, meeting_url, start_time, end_time, capacity, is_public)
SELECT 
    c.id,
    'Chess Tournament Qualifier',
    'Compete for a spot in the national championship. £5 entry fee.',
    'competition',
    'published',
    'Student Union Games Room',
    false,
    NULL,
    NOW() + INTERVAL '15 days' + INTERVAL '13 hours',
    NOW() + INTERVAL '15 days' + INTERVAL '18 hours',
    32,
    true
FROM public.clubs c WHERE c.slug = 'chess-club';

INSERT INTO public.events (club_id, title, description, event_type, status, location, is_online, meeting_url, start_time, end_time, capacity, is_public)
SELECT 
    c.id,
    'Build Your First Robot',
    'Beginner-friendly workshop. No experience required!',
    'workshop',
    'published',
    'Engineering Lab 3',
    false,
    NULL,
    NOW() + INTERVAL '8 days' + INTERVAL '15 hours',
    NOW() + INTERVAL '8 days' + INTERVAL '18 hours',
    25,
    true
FROM public.clubs c WHERE c.slug = 'robotics-society';

-- ============================================
-- SAMPLE MEMBERSHIPS
-- ============================================
-- Uncomment and update user_id values once you have real users

/*
-- Make admin@clubconnect.uk an owner of Computer Science Society
INSERT INTO public.memberships (club_id, user_id, role, status)
SELECT c.id, 'your-user-uuid-here'::uuid, 'owner', 'active'
FROM public.clubs c WHERE c.slug = 'computer-science-society';

-- Add some member memberships
INSERT INTO public.memberships (club_id, user_id, role, status)
SELECT c.id, 'another-user-uuid'::uuid, 'member', 'active'
FROM public.clubs c WHERE c.slug IN ('football-club', 'drama-society', 'photography-club');
*/

-- ============================================
-- SAMPLE EVENT ATTENDEES
-- ============================================
-- Uncomment once you have real users

/*
-- RSVP to some events
INSERT INTO public.event_attendees (event_id, user_id, status)
SELECT e.id, 'your-user-uuid-here'::uuid, 'going'
FROM public.events e 
WHERE e.title IN ('Hackathon 2025', 'Introduction to React Workshop')
LIMIT 2;
*/

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify your seed data

-- Count clubs by category
-- SELECT category, COUNT(*) as club_count FROM public.clubs GROUP BY category ORDER BY club_count DESC;

-- List upcoming events
-- SELECT c.name as club, e.title, e.start_time, e.capacity, e.attendee_count 
-- FROM public.events e 
-- JOIN public.clubs c ON c.id = e.club_id 
-- WHERE e.start_time > NOW() 
-- ORDER BY e.start_time;

-- Show club member counts
-- SELECT name, member_count FROM public.clubs ORDER BY member_count DESC;
