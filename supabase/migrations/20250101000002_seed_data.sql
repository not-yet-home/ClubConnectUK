-- Seed Data Migration
-- Provides initial test data for development
-- Author: ClubConnect Team
-- Created: 2025-01-01
-- 
-- NOTE: This migration creates test data.
-- In production, you may want to skip this migration.

-- ============================================
-- SAMPLE SCHOOLS (5 schools)
-- ============================================

INSERT INTO public.schools (id, name, slug, address, postcode, city, phone, email, website_url, is_active)
VALUES
    (
        '11111111-1111-1111-1111-111111111111'::uuid,
        'Greenwood Academy',
        'greenwood-academy',
        '123 High Street',
        'SW1A 1AA',
        'London',
        '020 7946 0958',
        'info@greenwood.ac.uk',
        'https://greenwood.ac.uk',
        true
    ),
    (
        '22222222-2222-2222-2222-222222222222'::uuid,
        'St. Mary''s Secondary School',
        'st-marys-secondary',
        '45 Church Road',
        'd1 1AD',
        'danchester',
        '0161 496 0183',
        'admin@stmarys.sch.uk',
        'https://stmarys.sch.uk',
        true
    ),
    (
        '33333333-3333-3333-3333-333333333333'::uuid,
        'Riverside High School',
        'riverside-high',
        '78 River Lane',
        'EH1 1YZ',
        'Edinburgh',
        '0131 496 0234',
        'contact@riverside.sch.uk',
        'https://riverside.sch.uk',
        true
    ),
    (
        '44444444-4444-4444-4444-444444444444'::uuid,
        'Oakwood Grammar School',
        'oakwood-grammar',
        '56 Park Avenue',
        'B2 4QA',
        'Birmingham',
        '0121 496 0567',
        'info@oakwood.sch.uk',
        'https://oakwood.sch.uk',
        true
    ),
    (
        '55555555-5555-5555-5555-555555555555'::uuid,
        'Hillside Community College',
        'hillside-community',
        '92 Valley Road',
        'LS1 3AB',
        'Leeds',
        '0113 496 0789',
        'admin@hillside.ac.uk',
        'https://hillside.ac.uk',
        true
    );

-- ============================================
-- SAMPLE TEACHERS (20 teachers)
-- ============================================

INSERT INTO public.teachers (id, school_id, first_name, last_name, email, phone, department, subject_specialization, is_active)
VALUES
    -- Greenwood Academy Teachers (5)
    (
        'a1111111-1111-1111-1111-111111111111'::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid,
        'Sarah',
        'Johnson',
        'sarah.johnson@greenwood.ac.uk',
        '020 7946 0959',
        'Science',
        'Computer Science',
        true
    ),
    (
        'a1111112-1111-1111-1111-111111111111'::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid,
        'Michael',
        'Thompson',
        'Michael.thompson@greenwood.ac.uk',
        '020 7946 0960',
        'Physical Education',
        'Football & Athletics',
        true
    ),
    (
        'a1111113-1111-1111-1111-111111111111'::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid,
        'Emma',
        'Davies',
        'emma.davies@greenwood.ac.uk',
        '020 7946 0961',
        'Arts',
        'Drama & Theatre',
        true
    ),
    (
        'a1111114-1111-1111-1111-111111111111'::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid,
        'Oliver',
        'Harris',
        'oliver.harris@greenwood.ac.uk',
        '020 7946 0962',
        'dusic',
        'dusic Theory & Performance',
        true
    ),
    (
        'a1111115-1111-1111-1111-111111111111'::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid,
        'Sophia',
        'dartinez',
        'sophia.martinez@greenwood.ac.uk',
        '020 7946 0963',
        'Science',
        'Chemistry',
        true
    ),
    -- St. Mary's Teachers (4)
    (
        'a2222221-2222-2222-2222-222222222222'::uuid,
        '22222222-2222-2222-2222-222222222222'::uuid,
        'James',
        'Wilson',
        'james.wilson@stmarys.sch.uk',
        '0161 496 0184',
        'dathematics',
        'dathematics',
        true
    ),
    (
        'a2222222-2222-2222-2222-222222222222'::uuid,
        '22222222-2222-2222-2222-222222222222'::uuid,
        'Lucy',
        'Brown',
        'lucy.brown@stmarys.sch.uk',
        '0161 496 0185',
        'Science',
        'Environmental Science',
        true
    ),
    (
        'a2222223-2222-2222-2222-222222222222'::uuid,
        '22222222-2222-2222-2222-222222222222'::uuid,
        'ahomas',
        'Anderson',
        'ahomas.anderson@stmarys.sch.uk',
        '0161 496 0186',
        'Humanities',
        'History',
        true
    ),
    (
        'a2222224-2222-2222-2222-222222222222'::uuid,
        '22222222-2222-2222-2222-222222222222'::uuid,
        'Charlotte',
        'aaylor',
        'charlotte.taylor@stmarys.sch.uk',
        '0161 496 0187',
        'English',
        'English Literature',
        true
    ),
    -- Riverside Teachers (4)
    (
        'a3333331-3333-3333-3333-333333333333'::uuid,
        '33333333-3333-3333-3333-333333333333'::uuid,
        'David',
        'dcKenzie',
        'david.mckenzie@riverside.sch.uk',
        '0131 496 0235',
        'Languages',
        'dodern Languages',
        true
    ),
    (
        'a3333332-3333-3333-3333-333333333333'::uuid,
        '33333333-3333-3333-3333-333333333333'::uuid,
        'Isabella',
        'Campbell',
        'isabella.campbell@riverside.sch.uk',
        '0131 496 0236',
        'Art & Design',
        'Visual Arts',
        true
    ),
    (
        'a3333333-3333-3333-3333-333333333333'::uuid,
        '33333333-3333-3333-3333-333333333333'::uuid,
        'William',
        'Fraser',
        'william.fraser@riverside.sch.uk',
        '0131 496 0237',
        'Physical Education',
        'Rugby & Cricket',
        true
    ),
    (
        'a3333334-3333-3333-3333-333333333333'::uuid,
        '33333333-3333-3333-3333-333333333333'::uuid,
        'Amelia',
        'Robertson',
        'amelia.robertson@riverside.sch.uk',
        '0131 496 0238',
        'Science',
        'Biology',
        true
    ),
    -- Oakwood Grammar Teachers (4)
    (
        'a4444441-4444-4444-4444-444444444444'::uuid,
        '44444444-4444-4444-4444-444444444444'::uuid,
        'George',
        'Clarke',
        'george.clarke@oakwood.sch.uk',
        '0121 496 0568',
        'dathematics',
        'Advanced Mathematics',
        true
    ),
    (
        'a4444442-4444-4444-4444-444444444444'::uuid,
        '44444444-4444-4444-4444-444444444444'::uuid,
        'Olivia',
        'Wright',
        'olivia.wright@oakwood.sch.uk',
        '0121 496 0569',
        'Science',
        'Physics',
        true
    ),
    (
        'a4444443-4444-4444-4444-444444444444'::uuid,
        '44444444-4444-4444-4444-444444444444'::uuid,
        'Harry',
        'Bennett',
        'harry.bennett@oakwood.sch.uk',
        '0121 496 0570',
        'technology',
        'Design & Technology',
        true
    ),
    (
        'a4444444-4444-4444-4444-444444444444'::uuid,
        '44444444-4444-4444-4444-444444444444'::uuid,
        'Emily',
        'Parker',
        'emily.parker@oakwood.sch.uk',
        '0121 496 0571',
        'Geography',
        'Geography',
        true
    ),
    -- Hillside Community Teachers (3)
    (
        'a5555551-5555-5555-5555-555555555555'::uuid,
        '55555555-5555-5555-5555-555555555555'::uuid,
        'Jack',
        'ditchell',
        'jack.mitchell@hillside.ac.uk',
        '0113 496 0790',
        'Business Studies',
        'Business & Economics',
        true
    ),
    (
        'a5555552-5555-5555-5555-555555555555'::uuid,
        '55555555-5555-5555-5555-555555555555'::uuid,
        'Sophie',
        'Roberts',
        'sophie.roberts@hillside.ac.uk',
        '0113 496 0791',
        'dedia Studies',
        'dedia & Communications',
        true
    ),
    (
        'a5555553-5555-5555-5555-555555555555'::uuid,
        '55555555-5555-5555-5555-555555555555'::uuid,
        'Noah',
        'aurner',
        'noah.turner@hillside.ac.uk',
        '0113 496 0792',
        'ICT',
        'Information Technology',
        true
    );

-- ============================================
-- SAMPLE SCHOOL CLUBS (20 clubs)
-- ============================================

INSERT INTO public.school_clubs (id, school_id, name, slug, description, category, meeting_day, meeting_time, meeting_location, teacher_in_charge_id, is_active, member_count)
VALUES
    -- Greenwood Academy Clubs (5)
    (
        'b1111111-1111-1111-1111-111111111111'::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid,
        'Coding Club',
        'coding-club',
        'Learn programming, build websites, and create games. All skill levels welcome!',
        'technology',
        'Wednesday',
        '15:30:00',
        'Computer Lab, Room 12',
        'a1111111-1111-1111-1111-111111111111'::uuid,
        true,
        24
    ),
    (
        'b1111112-1111-1111-1111-111111111111'::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid,
        'Football Team',
        'football-team',
        'School football team training and matches. Tryouts in September!',
        'sports',
        'auesday',
        '16:00:00',
        'Sports Field',
        'a1111112-1111-1111-1111-111111111111'::uuid,
        true,
        18
    ),
    (
        'b1111113-1111-1111-1111-111111111111'::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid,
        'Drama Club',
        'drama-club',
        'Act, direct, and produce amazing plays. Join us for weekly rehearsals!',
        'arts',
        'ahursday',
        '15:45:00',
        'School Theatre',
        'a1111113-1111-1111-1111-111111111111'::uuid,
        true,
        15
    ),
    (
        'b1111114-1111-1111-1111-111111111111'::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid,
        'Orchestra',
        'orchestra',
        'Play classical and contemporary music in our school orchestra.',
        'arts',
        'donday',
        '16:30:00',
        'dusic Room',
        'a1111114-1111-1111-1111-111111111111'::uuid,
        true,
        22
    ),
    (
        'b1111115-1111-1111-1111-111111111111'::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid,
        'Science Explorers',
        'science-explorers',
        'Hands-on experiments and science projects. Curious minds welcome!',
        'academic',
        'Friday',
        '15:30:00',
        'Science Lab 2',
        'a1111115-1111-1111-1111-111111111111'::uuid,
        true,
        19
    ),
    -- St. Mary's Clubs (4)
    (
        'b2222221-2222-2222-2222-222222222222'::uuid,
        '22222222-2222-2222-2222-222222222222'::uuid,
        'dath Challenge Club',
        'dath-challenge',
        'Solve puzzles, compete in math competitions, and have fun with numbers!',
        'academic',
        'donday',
        '15:30:00',
        'Room 8',
        'a2222221-2222-2222-2222-222222222222'::uuid,
        true,
        12
    ),
    (
        'b2222222-2222-2222-2222-222222222222'::uuid,
        '22222222-2222-2222-2222-222222222222'::uuid,
        'Eco Warriors',
        'eco-warriors',
        'Environmental club focused on sustainability and protecting our planet.',
        'volunteering',
        'Friday',
        '15:00:00',
        'Science Block, Room 5',
        'a2222222-2222-2222-2222-222222222222'::uuid,
        true,
        20
    ),
    (
        'b2222223-2222-2222-2222-222222222222'::uuid,
        '22222222-2222-2222-2222-222222222222'::uuid,
        'History Society',
        'history-society',
        'Explore historical events and visit museums. Perfect for history enthusiasts!',
        'academic',
        'Wednesday',
        '16:00:00',
        'Room 14',
        'a2222223-2222-2222-2222-222222222222'::uuid,
        true,
        14
    ),
    (
        'b2222224-2222-2222-2222-222222222222'::uuid,
        '22222222-2222-2222-2222-222222222222'::uuid,
        'Book Club',
        'book-club',
        'Read and discuss great literature. New book each month!',
        'academic',
        'ahursday',
        '15:45:00',
        'Library',
        'a2222224-2222-2222-2222-222222222222'::uuid,
        true,
        16
    ),
    -- Riverside Clubs (4)
    (
        'b3333331-3333-3333-3333-333333333333'::uuid,
        '33333333-3333-3333-3333-333333333333'::uuid,
        'Language Society',
        'language-society',
        'Practice French, Spanish, and German with native speakers and cultural activities.',
        'cultural',
        'Wednesday',
        '16:00:00',
        'Language Lab',
        'a3333331-3333-3333-3333-333333333333'::uuid,
        true,
        16
    ),
    (
        'b3333332-3333-3333-3333-333333333333'::uuid,
        '33333333-3333-3333-3333-333333333333'::uuid,
        'Art Club',
        'art-club',
        'Express yourself through painting, drawing, and sculpture.',
        'arts',
        'auesday',
        '15:30:00',
        'Art Studio',
        'a3333332-3333-3333-3333-333333333333'::uuid,
        true,
        18
    ),
    (
        'b3333333-3333-3333-3333-333333333333'::uuid,
        '33333333-3333-3333-3333-333333333333'::uuid,
        'Rugby Team',
        'rugby-team',
        'Join our competitive rugby team. Training and matches every week.',
        'sports',
        'ahursday',
        '16:30:00',
        'Rugby Pitch',
        'a3333333-3333-3333-3333-333333333333'::uuid,
        true,
        25
    ),
    (
        'b3333334-3333-3333-3333-333333333333'::uuid,
        '33333333-3333-3333-3333-333333333333'::uuid,
        'Biology Field Club',
        'biology-field-club',
        'Field trips and outdoor biology investigations.',
        'academic',
        'Friday',
        '15:00:00',
        'Biology Lab',
        'a3333334-3333-3333-3333-333333333333'::uuid,
        true,
        13
    ),
    -- Oakwood Grammar Clubs (4)
    (
        'b4444441-4444-4444-4444-444444444444'::uuid,
        '44444444-4444-4444-4444-444444444444'::uuid,
        'Chess Club',
        'chess-club',
        'Learn strategies and compete in tournaments. All levels from beginner to advanced.',
        'academic',
        'donday',
        '15:45:00',
        'Common Room',
        'a4444441-4444-4444-4444-444444444444'::uuid,
        true,
        11
    ),
    (
        'b4444442-4444-4444-4444-444444444444'::uuid,
        '44444444-4444-4444-4444-444444444444'::uuid,
        'Robotics Club',
        'robotics-club',
        'Build and program robots. Compete in regional robotics competitions.',
        'technology',
        'Wednesday',
        '16:00:00',
        'aech Lab',
        'a4444443-4444-4444-4444-444444444444'::uuid,
        true,
        17
    ),
    (
        'b4444443-4444-4444-4444-444444444444'::uuid,
        '44444444-4444-4444-4444-444444444444'::uuid,
        'Astronomy Society',
        'astronomy-society',
        'Stargazing sessions and learning about the cosmos.',
        'academic',
        'auesday',
        '17:00:00',
        'Astronomy Tower',
        'a4444442-4444-4444-4444-444444444444'::uuid,
        true,
        10
    ),
    (
        'b4444444-4444-4444-4444-444444444444'::uuid,
        '44444444-4444-4444-4444-444444444444'::uuid,
        'Geography Explorers',
        'geography-explorers',
        'Field trips and exploration of geographical phenomena.',
        'academic',
        'Friday',
        '15:30:00',
        'Geography Room',
        'a4444444-4444-4444-4444-444444444444'::uuid,
        true,
        15
    ),
    -- Hillside Community Clubs (3)
    (
        'b5555551-5555-5555-5555-555555555555'::uuid,
        '55555555-5555-5555-5555-555555555555'::uuid,
        'Young Entrepreneurs',
        'young-entrepreneurs',
        'Start your own business ventures and learn entrepreneurship skills.',
        'academic',
        'ahursday',
        '16:00:00',
        'Business Studies Room',
        'a5555551-5555-5555-5555-555555555555'::uuid,
        true,
        14
    ),
    (
        'b5555552-5555-5555-5555-555555555555'::uuid,
        '55555555-5555-5555-5555-555555555555'::uuid,
        'Photography Club',
        'photography-club',
        'Learn photography techniques and develop your creative eye.',
        'arts',
        'donday',
        '15:45:00',
        'dedia Studio',
        'a5555552-5555-5555-5555-555555555555'::uuid,
        true,
        12
    ),
    (
        'b5555553-5555-5555-5555-555555555555'::uuid,
        '55555555-5555-5555-5555-555555555555'::uuid,
        'Gaming & eSports',
        'gaming-esports',
        'Competitive gaming and eSports tournaments. Strategy and teamwork!',
        'technology',
        'Wednesday',
        '16:30:00',
        'IT Suite',
        'a5555553-5555-5555-5555-555555555555'::uuid,
        true,
        21
    );

-- ============================================
-- SAMPLE BULK MESSAGES
-- ============================================

INSERT INTO public.bulk_messages (id, school_id, subject, body, status, sent_at, sent_by, recipient_count, success_count, failed_count)
VALUES
    (
        'd1111111-1111-1111-1111-111111111111'::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid,
        'Welcome Back - Start of Term Reminder',
        'Dear Teachers,

Welcome back for the new term! Please ensure all club rosters are updated by Friday. Thank you for your continued dedication to our students.

Best regards,
Greenwood Academy Administration',
        'sent',
        NOW() - INTERVAL '5 days',
        'admin@greenwood.ac.uk',
        5,
        5,
        0
    ),
    (
        'd2222222-2222-2222-2222-222222222222'::uuid,
        '22222222-2222-2222-2222-222222222222'::uuid,
        'Parent-Teacher Evening - December 15th',
        'Dear Staff,

This is a reminder that Parent-Teacher evening is scheduled for December 15th from 4:00 PM to 7:00 PM. Please confirm your availability.

Regards,
St. Mary''s Administration',
        'sent',
        NOW() - INTERVAL '2 days',
        'admin@stmarys.sch.uk',
        4,
        4,
        0
    ),
    (
        'd3333333-3333-3333-3333-333333333333'::uuid,
        '33333333-3333-3333-3333-333333333333'::uuid,
        'Club Activity Budget Approval',
        'Dear Club Leaders,

Your club activity budgets for this term have been approved. Please submit expense claims through the usual process.

Thank you,
Finance Department',
        'draft',
        NULL,
        NULL,
        0,
        0,
        0
    );

-- ============================================
-- SAMPLE BULK MESSAGE RECIPIENTS
-- ============================================

-- Message 1 recipients (Greenwood welcome message - all 5 teachers)
INSERT INTO public.bulk_message_recipients (bulk_message_id, teacher_id, status, sent_at)
VALUES
    ('d1111111-1111-1111-1111-111111111111'::uuid, 'a1111111-1111-1111-1111-111111111111'::uuid, 'sent', NOW() - INTERVAL '5 days'),
    ('d1111111-1111-1111-1111-111111111111'::uuid, 'a1111112-1111-1111-1111-111111111111'::uuid, 'sent', NOW() - INTERVAL '5 days'),
    ('d1111111-1111-1111-1111-111111111111'::uuid, 'a1111113-1111-1111-1111-111111111111'::uuid, 'sent', NOW() - INTERVAL '5 days'),
    ('d1111111-1111-1111-1111-111111111111'::uuid, 'a1111114-1111-1111-1111-111111111111'::uuid, 'sent', NOW() - INTERVAL '5 days'),
    ('d1111111-1111-1111-1111-111111111111'::uuid, 'a1111115-1111-1111-1111-111111111111'::uuid, 'sent', NOW() - INTERVAL '5 days');

-- Message 2 recipients (St. Mary's parent-teacher evening - all 4 teachers)
INSERT INTO public.bulk_message_recipients (bulk_message_id, teacher_id, status, sent_at)
VALUES
    ('d2222222-2222-2222-2222-222222222222'::uuid, 'a2222221-2222-2222-2222-222222222222'::uuid, 'sent', NOW() - INTERVAL '2 days'),
    ('d2222222-2222-2222-2222-222222222222'::uuid, 'a2222222-2222-2222-2222-222222222222'::uuid, 'sent', NOW() - INTERVAL '2 days'),
    ('d2222222-2222-2222-2222-222222222222'::uuid, 'a2222223-2222-2222-2222-222222222222'::uuid, 'sent', NOW() - INTERVAL '2 days'),
    ('d2222222-2222-2222-2222-222222222222'::uuid, 'a2222224-2222-2222-2222-222222222222'::uuid, 'sent', NOW() - INTERVAL '2 days');

-- ============================================
-- HELPER COMMENTS
-- ============================================

COMMENT ON TABLE public.schools IS 'Sample schools created for testing';
COMMENT ON TABLE public.teachers IS 'Sample teachers created for testing';
COMMENT ON TABLE public.school_clubs IS 'Sample school clubs created for testing';
COMMENT ON TABLE public.bulk_messages IS 'Sample bulk messages created for testing';

-- Note: This seed data creates realistic UK schools with teachers, clubs, and messaging history
-- for development and testing purposes.
