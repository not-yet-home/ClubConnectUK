# ClubConnect UK Database Documentation

This document describes the database schema, migrations, and how to work with the Supabase database.

## 📋 Table of Contents

- [Schema Overview](#schema-overview)
- [Tables](#tables)
- [Running Migrations](#running-migrations)
- [Seed Data](#seed-data)
- [Row Level Security](#row-level-security)
- [Common Queries](#common-queries)

## 📊 Schema Overview

The ClubConnect UK database consists of 5 main tables:

```
auth.users (Supabase managed)
    ↓
profiles (extended user info)
    ↓
    ├─→ memberships ←─ clubs
    └─→ event_attendees ←─ events ←─ clubs
```

## 📚 Tables

### `profiles`

Extended user information that links to Supabase Auth users.

| Column            | Type        | Description                             |
| ----------------- | ----------- | --------------------------------------- |
| `id`              | UUID        | Primary key, references `auth.users.id` |
| `email`           | TEXT        | User's email (unique)                   |
| `full_name`       | TEXT        | User's full name                        |
| `avatar_url`      | TEXT        | Profile picture URL                     |
| `bio`             | TEXT        | User biography                          |
| `university`      | TEXT        | University name                         |
| `course`          | TEXT        | Course/major                            |
| `graduation_year` | INTEGER     | Expected graduation year                |
| `created_at`      | TIMESTAMPTZ | Account creation timestamp              |
| `updated_at`      | TIMESTAMPTZ | Last update timestamp                   |

**Auto-created:** A profile is automatically created when a user signs up via a database trigger.

---

### `clubs`

University clubs and societies.

| Column          | Type        | Description                                                               |
| --------------- | ----------- | ------------------------------------------------------------------------- |
| `id`            | UUID        | Primary key                                                               |
| `name`          | TEXT        | Club name                                                                 |
| `slug`          | TEXT        | URL-friendly slug (unique)                                                |
| `description`   | TEXT        | Club description                                                          |
| `category`      | ENUM        | sports, academic, arts, cultural, technology, social, volunteering, other |
| `logo_url`      | TEXT        | Club logo image                                                           |
| `banner_url`    | TEXT        | Club banner image                                                         |
| `contact_email` | TEXT        | Contact email                                                             |
| `website_url`   | TEXT        | Club website                                                              |
| `social_links`  | JSONB       | Social media links                                                        |
| `is_active`     | BOOLEAN     | Whether club is active                                                    |
| `member_count`  | INTEGER     | Number of active members (auto-updated)                                   |
| `created_by`    | UUID        | Creator's profile ID                                                      |
| `created_at`    | TIMESTAMPTZ | Creation timestamp                                                        |
| `updated_at`    | TIMESTAMPTZ | Last update timestamp                                                     |

---

### `memberships`

User membership in clubs.

| Column       | Type        | Description               |
| ------------ | ----------- | ------------------------- |
| `id`         | UUID        | Primary key               |
| `club_id`    | UUID        | References `clubs.id`     |
| `user_id`    | UUID        | References `profiles.id`  |
| `role`       | ENUM        | member, admin, owner      |
| `status`     | ENUM        | pending, active, inactive |
| `joined_at`  | TIMESTAMPTZ | When user joined          |
| `created_at` | TIMESTAMPTZ | Record creation           |
| `updated_at` | TIMESTAMPTZ | Last update               |

**Unique constraint:** (`club_id`, `user_id`) - a user can only have one membership per club.

**Auto-updates:** Changing membership status automatically updates the club's `member_count`.

---

### `events`

Club events and activities.

| Column           | Type        | Description                                               |
| ---------------- | ----------- | --------------------------------------------------------- |
| `id`             | UUID        | Primary key                                               |
| `club_id`        | UUID        | References `clubs.id`                                     |
| `title`          | TEXT        | Event title                                               |
| `description`    | TEXT        | Event description                                         |
| `event_type`     | ENUM        | meeting, social, workshop, competition, fundraiser, other |
| `status`         | ENUM        | draft, published, cancelled, completed                    |
| `location`       | TEXT        | Physical location                                         |
| `is_online`      | BOOLEAN     | Whether event is online                                   |
| `meeting_url`    | TEXT        | Online meeting link                                       |
| `start_time`     | TIMESTAMPTZ | Event start time                                          |
| `end_time`       | TIMESTAMPTZ | Event end time                                            |
| `capacity`       | INTEGER     | Max attendees (NULL = unlimited)                          |
| `is_public`      | BOOLEAN     | Public or members-only                                    |
| `image_url`      | TEXT        | Event image                                               |
| `attendee_count` | INTEGER     | Number attending (auto-updated)                           |
| `created_by`     | UUID        | Creator's profile ID                                      |
| `created_at`     | TIMESTAMPTZ | Creation timestamp                                        |
| `updated_at`     | TIMESTAMPTZ | Last update timestamp                                     |

---

### `event_attendees`

Event attendance tracking and RSVPs.

| Column       | Type        | Description                       |
| ------------ | ----------- | --------------------------------- |
| `id`         | UUID        | Primary key                       |
| `event_id`   | UUID        | References `events.id`            |
| `user_id`    | UUID        | References `profiles.id`          |
| `status`     | ENUM        | going, maybe, not_going, attended |
| `created_at` | TIMESTAMPTZ | RSVP timestamp                    |
| `updated_at` | TIMESTAMPTZ | Last update                       |

**Unique constraint:** (`event_id`, `user_id`) - a user can only RSVP once per event.

## 🚀 Running Migrations

### Prerequisites

1. Install Supabase CLI:

   **Windows (Scoop - Recommended):**

   ```bash
   # Install Scoop if needed:
   iwr -useb get.scoop.sh | iex

   # Install Supabase CLI:
   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
   scoop install supabase
   ```

   **Or use npx (no install):**

   ```bash
   # Just use npx before commands:
   npx supabase link --project-ref your-ref
   ```

2. Find your project reference:
   - Go to your Supabase dashboard
   - URL format: `https://supabase.com/dashboard/project/abcdefghijklmnop`
   - The `abcdefghijklmnop` is your project-ref
   - Or find it in: Settings → General → Project ID

### Link to Your Project

```bash
supabase link --project-ref your-project-ref
```

You'll be prompted for your database password (found in Supabase dashboard).

### Apply Migrations

Push all migrations to your Supabase project:

```bash
supabase db push
```

This will apply all SQL files in `supabase/migrations/` in order.

### Verify Migrations

Check in Supabase Dashboard:

- **Database** → **Tables** - Should see all 5 tables
- **Database** → **Policies** - Should see RLS policies enabled

## 🌱 Seed Data

### Using Migration Seed Data

The migration `20250101000002_seed_data.sql` automatically creates:

- 5 sample clubs
- 6 sample events

This runs automatically when you apply migrations.

### Using seed.sql

For additional test data:

```bash
supabase db reset
```

Or manually run in SQL Editor:

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/seed.sql`
3. Click "Run"

### Creating Test Users

1. Go to **Authentication** → **Users** → **Add User**
2. Create users with these emails:
   - `admin@clubconnect.uk` (for admin testing)
   - `alice@example.com`
   - `bob@example.com`
3. Set passwords (use strong passwords even for testing)
4. Update `seed.sql` with the actual user UUIDs
5. Run the seed file

## 🔒 Row Level Security (RLS)

All tables have RLS enabled. Here's what each policy allows:

### Profiles

- ✅ Everyone can **read** all profiles
- ✅ Users can **update** only their own profile
- ✅ Profiles auto-created on signup

### Clubs

- ✅ Everyone can **read** active clubs
- ✅ Authenticated users can **create** clubs
- ✅ Club admins/owners can **update** their clubs
- ✅ Club owners can **delete** their clubs

### Memberships

- ✅ Users can **view** memberships of clubs they belong to
- ✅ Users can **join** clubs (create membership)
- ✅ Club admins can **update/remove** memberships
- ✅ Users can **leave** clubs (delete their membership)

### Events

- ✅ Everyone can **read** public events
- ✅ Club members can **read** private club events
- ✅ Club admins can **create/update/delete** events

### Event Attendees

- ✅ Users can **view** attendees of events they can see
- ✅ Users can **RSVP** to events they have access to
- ✅ Users can **update/cancel** their own RSVP
- ✅ Event organizers can **remove** attendees

## 📝 Common Queries

### Get all clubs with member counts

```sql
SELECT id, name, category, member_count, is_active
FROM clubs
ORDER BY member_count DESC;
```

### Get upcoming events

```sql
SELECT
    e.title,
    e.start_time,
    e.location,
    e.is_online,
    c.name as club_name,
    e.attendee_count,
    e.capacity
FROM events e
JOIN clubs c ON c.id = e.club_id
WHERE e.start_time > NOW()
AND e.status = 'published'
ORDER BY e.start_time;
```

### Get user's memberships

```sql
SELECT
    c.name as club_name,
    m.role,
    m.joined_at
FROM memberships m
JOIN clubs c ON c.id = m.club_id
WHERE m.user_id = auth.uid()
AND m.status = 'active';
```

### Get club's upcoming events

```sql
SELECT
    title,
    start_time,
    end_time,
    location,
    attendee_count,
    capacity
FROM events
WHERE club_id = 'club-uuid-here'
AND start_time > NOW()
AND status = 'published'
ORDER BY start_time;
```

### Check if user is club admin

```sql
SELECT EXISTS (
    SELECT 1
    FROM memberships
    WHERE club_id = 'club-uuid-here'
    AND user_id = auth.uid()
    AND role IN ('admin', 'owner')
    AND status = 'active'
) as is_admin;
```

## 🔧 Troubleshooting

### Migrations fail to apply

1. Check your internet connection
2. Verify project-ref is correct: `supabase projects list`
3. Check database password
4. Look for SQL errors in the output

### RLS policies blocking access

1. Verify you're authenticated: policies require `auth.uid()`
2. Check if user has correct role/membership
3. Test policies in SQL Editor with `SELECT auth.uid()` to verify user context

### Seed data not showing

1. Verify migrations ran first: check Tables in dashboard
2. Run seed data via SQL Editor and check for errors
3. Create actual users in Auth before seeding memberships

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [RLS Policies Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
