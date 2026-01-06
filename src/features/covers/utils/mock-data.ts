
import { addDays, subDays, startOfWeek, addMinutes } from 'date-fns';
import { CoverOccurrence, CoverRule, TeacherCoverAssignment } from '@/types/club.types';

const MOCK_TEACHERS = [
    { id: 't1', name: 'Mr. Smith', subject: 'Math' },
    { id: 't2', name: 'Mrs. Jones', subject: 'Science' },
    { id: 't3', name: 'Ms. Davis', subject: 'English' },
    { id: 't4', name: 'Mr. Wilson', subject: 'History' },
];

const MOCK_CLUBS = [
    { id: 'c1', name: 'Art Club', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    { id: 'c2', name: 'Coding Club', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { id: 'c3', name: 'Football', color: 'bg-green-100 text-green-700 border-green-200' },
    { id: 'c4', name: 'Dance Class', color: 'bg-pink-100 text-pink-700 border-pink-200' },
];

export const generateMockCovers = (baseDate: Date = new Date()): CoverOccurrence[] => {
    const start = startOfWeek(baseDate, { weekStartsOn: 1 }); // Monday
    const covers: CoverOccurrence[] = [];

    // Helper to create a cover
    const createCover = (
        dayOffset: number,
        clubIndex: number,
        hour: number,
        durationMinutes: number,
        status: 'assigned' | 'unassigned' | 'confirmed' | 'cancelled' | 'ungenerated' = 'assigned'
    ) => {
        const meetingDate = addDays(start, dayOffset);
        meetingDate.setHours(hour, 0, 0, 0);

        const club = MOCK_CLUBS[clubIndex];
        const ruleId = `rule-${dayOffset}-${clubIndex}`;

        // Mock Rule
        const rule: CoverRule = {
            id: ruleId,
            school_id: 'school-1',
            club_id: club.id,
            frequency: 'weekly',
            day_of_week: 'monday', // Simplified
            start_time: `${hour}:00:00`,
            end_time: `${hour + (durationMinutes / 60)}:00:00`,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            club: {
                id: club.id,
                club_name: club.name,
                club_code: club.name.substring(0, 3).toUpperCase(),
                school_id: 'school-1',
                status: 'active',
                members_count: 10 + Math.floor(Math.random() * 20),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        };

        const occurrence: CoverOccurrence = {
            id: `occ-${dayOffset}-${clubIndex}`,
            cover_rule_id: ruleId,
            meeting_date: meetingDate.toISOString(),
            actual_start: null,
            actual_end: null,
            notes: "Sample note for this cover.",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            cover_rule: rule,
        };

        return occurrence;
    };

    // Populate Calendar with mock data similar to the image
    // Week 1
    covers.push(createCover(1, 0, 15, 60, 'confirmed')); // Tue
    covers.push(createCover(3, 1, 14, 45, 'assigned')); // Thu - Coding

    // Week 2 (Current Week in image?)
    covers.push(createCover(7 + 1, 1, 15, 60)); // Tue - Coding Club
    covers.push(createCover(7 + 3, 2, 16, 90)); // Thu - Football
    covers.push(createCover(7 + 3, 3, 15, 60)); // Thu - Dance Class

    // Week 3
    covers.push(createCover(14 + 1, 0, 16, 60)); // Tue
    covers.push(createCover(14 + 2, 1, 15, 60)); // Wed

    return covers;
};
