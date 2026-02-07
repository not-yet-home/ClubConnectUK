-- Seed Data Migration
-- Updated for new schema: 2025-12-24
-- Matches ERD: person_details, teachers, schools, clubs, cover_rules, cover_occurrences, 
--              teacher_cover_assignments, documents, broadcasts, messages

-- NOTE: For Supabase Cloud, create test users via Dashboard → Authentication → Users
-- Test user commented out (only works on local Docker setup)

-- ============================================
-- SAMPLE PERSON DETAILS (for teachers)
-- ============================================
INSERT INTO public.person_details (id, first_name, middle_name, last_name, email, address, contact, image)
VALUES
    (
        'a0000001-0001-0001-0001-000000000001'::UUID,
        'John',
        'Michael',
        'Smith',
        'john.smith@example.com',
        '10 Baker Street, London W1U 3BW',
        '+44 7700 900001',
        NULL
    ),
    (
        'a0000002-0002-0002-0002-000000000002'::UUID,
        'Sarah',
        NULL,
        'Johnson',
        'sarah.johnson@example.com',
        '25 Oxford Road, Manchester M1 5AN',
        '+44 7700 900002',
        NULL
    ),
    (
        'a0000003-0003-0003-0003-000000000003'::UUID,
        'David',
        'James',
        'Williams',
        'david.williams@example.com',
        '42 Royal Mile, Edinburgh EH1 2PB',
        '+44 7700 900003',
        NULL
    );

-- ============================================
-- SAMPLE DOCUMENTS (Templates and Files)
-- ============================================
INSERT INTO public.documents (id, type, filename, storage_path, title, description, status)
VALUES
    (
        1,
        'system_template',
        'cover_invitation.html',
        '/templates/cover_invitation.html',
        'Cover Invitation Template',
        'Standard email template for inviting teachers to cover sessions.',
        'active'
    ),
    (
        2,
        'system_template',
        'cover_confirmation.html',
        '/templates/cover_confirmation.html',
        'Cover Confirmation Template',
        'Email template sent when a teacher confirms a cover assignment.',
        'active'
    ),
    (
        3,
        'teacher_file',
        'john_smith_cv.pdf',
        '/teachers/a0000001-0001-0001-0001-000000000001/cv.pdf',
        'John Smith CV',
        'Teaching CV and qualifications.',
        'active'
    );

-- ============================================
-- SAMPLE SCHOOLS (3 schools)
-- ============================================
INSERT INTO public.schools (id, school_name, address, status)
VALUES
    (
        'b0000001-0001-0001-0001-000000000001'::UUID,
        'Greenwood Academy',
        '123 High Street, London SW1A 1AA',
        'active'
    ),
    (
        'b0000002-0002-0002-0002-000000000002'::UUID,
        'St. Mary''s Secondary',
        '45 Church Road, Manchester M1 1AD',
        'active'
    ),
    (
        'b0000003-0003-0003-0003-000000000003'::UUID,
        'Riverside High',
        '78 River Lane, Edinburgh EH1 1YZ',
        'active'
    );

-- ============================================
-- SAMPLE CLUBS (for Greenwood Academy)
-- ============================================
INSERT INTO public.clubs (id, school_id, club_name, club_code, description, members_count, status)
VALUES
    (
        'c0000001-0001-0001-0001-000000000001'::UUID,
        'b0000001-0001-0001-0001-000000000001'::UUID,
        'Coding Club',
        'CODE',
        'Learn programming fundamentals, build projects, and explore robotics.',
        24,
        'active'
    ),
    (
        'c0000002-0002-0002-0002-000000000002'::UUID,
        'b0000001-0001-0001-0001-000000000001'::UUID,
        'Football Team',
        'FB',
        'School football team training and matches.',
        32,
        'active'
    ),
    (
        'c0000003-0003-0003-0003-000000000003'::UUID,
        'b0000001-0001-0001-0001-000000000001'::UUID,
        'Drama Club',
        'DRAMA',
        'Theatre productions, acting workshops, and public speaking.',
        18,
        'active'
    );


-- ============================================
-- SAMPLE TEACHERS
-- ============================================
INSERT INTO public.teachers (id, persons_details_id, documents_id, primary_styles, secondary_styles, general_notes, is_blocked)
VALUES
    (
        'd0000001-0001-0001-0001-000000000001'::UUID,
        'a0000001-0001-0001-0001-000000000001'::UUID,
        NULL,
        'STEM, Computing',
        'Mathematics',
        'Experienced in coding clubs and robotics.',
        false
    ),
    (
        'd0000002-0002-0002-0002-000000000002'::UUID,
        'a0000002-0002-0002-0002-000000000002'::UUID,
        NULL,
        'Sports, PE',
        'Health Education',
        'Football coach with UEFA B license.',
        false
    ),
    (
        'd0000003-0003-0003-0003-000000000003'::UUID,
        'a0000003-0003-0003-0003-000000000003'::UUID,
        NULL,
        'Drama, Arts',
        'English',
        'Theatre director experience.',
        false
    );

-- ============================================
-- SAMPLE TEACHER_DOCUMENTS (link teacher to documents)
-- ============================================
INSERT INTO public.teacher_documents (teacher_id, document_id)
VALUES
    ('d0000001-0001-0001-0001-000000000001'::UUID, 3);

-- ============================================
-- SAMPLE COVER RULES (Schedules)
-- ============================================
INSERT INTO public.cover_rules (id, school_id, club_id, frequency, day_of_week, start_time, end_time, status)
VALUES
    -- Coding Club: Weekly on Wednesdays 15:30-16:30
    (
        'e0000001-0001-0001-0001-000000000001'::UUID,
        'b0000001-0001-0001-0001-000000000001'::UUID,
        'c0000001-0001-0001-0001-000000000001'::UUID,
        'weekly',
        'wednesday',
        '15:30:00',
        '16:30:00',
        'active'
    ),
    -- Football: Bi-weekly on Tuesdays 16:00-17:30
    (
        'e0000002-0002-0002-0002-000000000002'::UUID,
        'b0000001-0001-0001-0001-000000000001'::UUID,
        'c0000002-0002-0002-0002-000000000002'::UUID,
        'bi-weekly',
        'tuesday',
        '16:00:00',
        '17:30:00',
        'active'
    );

-- ============================================
-- SAMPLE COVER OCCURRENCES (Actual Sessions)
-- ============================================
INSERT INTO public.cover_occurrences (id, cover_rule_id, meeting_date, actual_start, actual_end, notes)
VALUES
    -- A session from last week for Coding Club
    (
        'f0000001-0001-0001-0001-000000000001'::UUID,
        'e0000001-0001-0001-0001-000000000001'::UUID,
        NOW() - INTERVAL '7 days',
        '15:35:00',
        '16:30:00',
        'Started 5 mins late due to network issues.'
    ),
    -- Upcoming session for Football
    (
        'f0000002-0002-0002-0002-000000000002'::UUID,
        'e0000002-0002-0002-0002-000000000002'::UUID,
        NOW() + INTERVAL '3 days',
        NULL,
        NULL,
        'Upcoming session, needs cover.'
    );

-- ============================================
-- SAMPLE TEACHER COVER ASSIGNMENTS
-- ============================================
INSERT INTO public.teacher_cover_assignments (id, teacher_id, cover_occurrence_id, status, assigned_by, invited_at, response_at)
VALUES
    -- John Smith confirmed for past Coding Club session
    (
        'aa000001-0001-0001-0001-000000000001'::UUID,
        'd0000001-0001-0001-0001-000000000001'::UUID,
        'f0000001-0001-0001-0001-000000000001'::UUID,
        'confirmed',
        NULL,
        NOW() - INTERVAL '10 days',
        NOW() - INTERVAL '9 days'
    ),
    -- Sarah Johnson invited for upcoming Football session
    (
        'aa000002-0002-0002-0002-000000000002'::UUID,
        'd0000002-0002-0002-0002-000000000002'::UUID,
        'f0000002-0002-0002-0002-000000000002'::UUID,
        'invited',
        NULL,
        NOW(),
        NULL
    );

-- ============================================
-- SAMPLE BROADCASTS
-- ============================================
INSERT INTO public.broadcasts (id, template_id, assignment_id, subject, body, channel_used, recipients_count, status, sent_by_user_id)
VALUES
    (
        'bb000001-0001-0001-0001-000000000001'::UUID,
        1,
        'aa000002-0002-0002-0002-000000000002'::UUID,
        'Cover Request: Football Team - Tuesday',
        'Dear Sarah, we have a cover opportunity for Football Team on Tuesday...',
        'email',
        1,
        'completed',
        NULL
    );

-- ============================================
-- SAMPLE MESSAGES
-- ============================================
INSERT INTO public.messages (id, teacher_id, broadcast_id, document_id, channel, direction, subject, body, status, external_id)
VALUES
    (
        'cc000001-0001-0001-0001-000000000001'::UUID,
        'd0000002-0002-0002-0002-000000000002'::UUID,
        'bb000001-0001-0001-0001-000000000001'::UUID,
        NULL,
        'email',
        'outbound',
        'Cover Request: Football Team - Tuesday',
        'Dear Sarah, we have a cover opportunity for Football Team on Tuesday...',
        'delivered',
        'resend_abc123xyz'
    );

-- ============================================
-- BULK SEED: 30 REALISTIC TEACHERS
-- ============================================
DO $$
DECLARE
    teacher_data jsonb := '[
        {"first": "Emma", "last": "Thompson", "styles": "Ballet, Contemporary", "secondary": "Jazz"},
        {"first": "James", "last": "Wilson", "styles": "Hip Hop, Street", "secondary": "Breakdance"},
        {"first": "Olivia", "last": "Davies", "styles": "Piano, Music Theory", "secondary": "Singing"},
        {"first": "Lucas", "last": "Brown", "styles": "Guitar, Bass", "secondary": "Drums"},
        {"first": "Charlotte", "last": "Evans", "styles": "Drama, Acting", "secondary": "Public Speaking"},
        {"first": "Liam", "last": "Thomas", "styles": "Football, Rugby", "secondary": "Athletics"},
        {"first": "Sophia", "last": "Roberts", "styles": "Art, Painting", "secondary": "Sketching"},
        {"first": "Benjamin", "last": "Walker", "styles": "Coding, Python", "secondary": "Web Design"},
        {"first": "Mia", "last": "Wright", "styles": "Yoga, Pilates", "secondary": "Meditation"},
        {"first": "William", "last": "Robinson", "styles": "Chess, Strategy", "secondary": "Maths"},
        {"first": "Amelia", "last": "White", "styles": "Violin, Viola", "secondary": "Orchestra"},
        {"first": "Alexander", "last": "Hall", "styles": "Basketball, Netball", "secondary": "Fitness"},
        {"first": "Isabella", "last": "Green", "styles": "Pottery, Ceramics", "secondary": "Sculpture"},
        {"first": "Henry", "last": "Edwards", "styles": "History, Classics", "secondary": "Debating"},
        {"first": "Ava", "last": "Hughes", "styles": "Choir, Vocal", "secondary": "Musical Theatre"},
        {"first": "Ethan", "last": "Turner", "styles": "Science, Biology", "secondary": "Chemistry"},
        {"first": "Harper", "last": "Martin", "styles": "Dance, Tap", "secondary": "Modern"},
        {"first": "Daniel", "last": "Lewis", "styles": "Cricket, Tennis", "secondary": "Badminton"},
        {"first": "Evelyn", "last": "Wood", "styles": "French, Spanish", "secondary": "German"},
        {"first": "Matthew", "last": "Harris", "styles": "Swimming, Water Polo", "secondary": "Lifeguarding"},
        {"first": "Abigail", "last": "Clark", "styles": "Cooking, Nutrition", "secondary": "Baking"},
        {"first": "Joseph", "last": "Cooper", "styles": "Photography, Media", "secondary": "Film"},
        {"first": "Elizabeth", "last": "King", "styles": "Needlework, Textiles", "secondary": "Fashion"},
        {"first": "David", "last": "Baker", "styles": "Woodwork, DT", "secondary": "Electronics"},
        {"first": "Sofia", "last": "Patel", "styles": "Physics, Astronomy", "secondary": "Robotics"},
        {"first": "Jackson", "last": "Moore", "styles": "Geography, Geology", "secondary": "Environment"},
        {"first": "Grace", "last": "Lee", "styles": "Literature, Creative Writing", "secondary": "Poetry"},
        {"first": "Sebastian", "last": "Scott", "styles": "Graphic Design, Illustrator", "secondary": "Animation"},
        {"first": "Chloe", "last": "Young", "styles": "Gymnastics, Trampolining", "secondary": "Cheerleading"},
        {"first": "Jack", "last": "Allen", "styles": "Martial Arts, Karate", "secondary": "Judo"}
    ]';
    item jsonb;
    new_person_id uuid;
BEGIN
    FOR item IN SELECT * FROM jsonb_array_elements(teacher_data)
    LOOP
        new_person_id := gen_random_uuid();
        
        -- Insert Person
        INSERT INTO public.person_details (id, first_name, last_name, email, address, contact, image)
        VALUES (
            new_person_id,
            item->>'first',
            item->>'last',
            lower(item->>'first') || '.' || lower(item->>'last') || '@example.com',
            '123 Seed Street, UK',
            '+44 7700 900' || floor(random() * 900 + 100)::text,
            NULL
        );

        -- Insert Teacher
        INSERT INTO public.teachers (id, persons_details_id, primary_styles, secondary_styles, general_notes, is_blocked)
        VALUES (
            gen_random_uuid(),
            new_person_id,
            item->>'styles',
            item->>'secondary',
            'Auto-generated realistic seed teacher.',
            false
        );
    END LOOP;
END $$;
