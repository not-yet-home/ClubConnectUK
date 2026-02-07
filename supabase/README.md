# Supabase Migrations

This directory contains database migrations for the ClubConnect UK project.

## 📁 Structure

```
supabase/
├── config.toml                          # Supabase CLI configuration
├── migrations/                          # Migration files (run in order)
│   ├── 20250101000000_initial_schema.sql
│   ├── 20250101000001_rls_policies.sql
│   └── 20250101000002_seed_data.sql
└── seed.sql                             # Additional seed data (optional)
```

## 🚀 Quick Start

### 1. Install Supabase CLI

**Option A: Using Scoop (Recommended for Windows)**

```bash
# Install Scoop if you don't have it:
iwr -useb get.scoop.sh | iex

# Install Supabase CLI:
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Option B: Use npx (No installation needed)**

Run commands directly with `npx` - just replace `supabase` with `npx supabase` in all commands:

```bash
npx supabase link --project-ref your-ref
npx supabase db push
```

### 2. Link to Your Supabase Project

```bash
supabase link --project-ref your-project-ref
```

**Finding your project-ref:**

- Go to: https://supabase.com/dashboard/project/**your-project-ref**
- Or: Settings → General → Project ID

### 3. Apply Migrations

```bash
supabase db push
```

This will run all migrations in order.

## 📋 Migrations

### `20250101000000_initial_schema.sql`

Creates the core database schema:

- **profiles** - Extended user information
- **clubs** - University clubs and societies
- **memberships** - User membership in clubs
- **events** - Club events and activities
- **event_attendees** - Event RSVPs and attendance

Includes triggers for:

- Auto-creating profiles on user signup
- Auto-updating timestamps
- Auto-counting members and attendees

### `20250101000001_rls_policies.sql`

Enables Row Level Security with policies for:

- Public read access to profiles and active clubs
- Member-only access to private events
- Admin-only club management
- User-controlled memberships and RSVPs

### `20250101000002_seed_data.sql`

Creates sample data:

- 5 test clubs (CS, Football, Drama, ISA, Environmental)
- 6 upcoming events

Perfect for testing the application!

## 🌱 Seed Data

For additional test data beyond the migration seeds:

```bash
# Option 1: Reset database with seed data (local development)
supabase db reset

# Option 2: Run seed.sql manually
# Copy contents of seed.sql and run in Supabase Dashboard → SQL Editor
```

**Note:** Create test users in Supabase Dashboard → Authentication → Users before seeding memberships.

## ✅ Verify Setup

After applying migrations:

1. **Check Tables**
   - Go to: Dashboard → Database → Tables
   - Should see: profiles, clubs, memberships, events, event_attendees

2. **Check RLS Policies**
   - Go to: Dashboard → Database → Policies
   - Each table should have multiple policies

3. **Check Sample Data**
   ```sql
   SELECT name, category FROM clubs;
   SELECT title, start_time FROM events WHERE start_time > NOW();
   ```

## 📚 Documentation

See [../docs/DATABASE.md](../docs/DATABASE.md) for:

- Detailed schema documentation
- Table relationships
- Common queries
- RLS policy explanations
- Troubleshooting tips

## 🔄 Making Changes

To create a new migration:

```bash
supabase migration new your_migration_name
```

This creates a new timestamped SQL file in `migrations/`.

## 🛠 Troubleshooting

**Migrations fail?**

- Check your internet connection
- Verify project-ref: `supabase projects list`
- Check database password in Supabase dashboard

**Tables not showing?**

- Wait a few seconds and refresh
- Check for SQL errors in terminal output
- Verify in SQL Editor: `\dt public.*`

**RLS blocking access?**

- Ensure you're logged in (RLS uses `auth.uid()`)
- Check user has correct role/membership
- Review policies in DATABASE.md

## 📞 Need Help?

- [Supabase Docs](https://supabase.com/docs)
- [Migrations Guide](https://supabase.com/docs/guides/cli/managing-environments)
- [RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
