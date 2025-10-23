# Punktual Free Tier Launch - Database Setup Guide

## Overview

This guide walks you through setting up your Supabase database for the Punktual free tier launch. All new features (Event quota, Settings page, Output options) depend on having the correct database schema.

## Current Status

✅ **Code**: All TypeScript/React code is complete and builds successfully
⏳ **Database**: Needs migration to add/create tables

## Database Setup Steps

### Option A: Fresh Start (Clean Database) - RECOMMENDED

If you're starting with a fresh Supabase project or want a clean slate:

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project → SQL Editor
3. **Delete existing tables** (if any):
   ```sql
   DROP TABLE IF EXISTS short_links CASCADE;
   DROP TABLE IF EXISTS events CASCADE;
   DROP TABLE IF EXISTS user_profiles CASCADE;
   ```

4. **Run these migrations in order**:

   **Step 1:** Create user_profiles table
   ```bash
   cat supabase/migrations/20251022_create_user_profiles_table.sql
   ```
   Copy the entire content and paste it in Supabase SQL Editor → Execute

   **Step 2:** Create events table
   ```bash
   cat supabase/migrations/20251022_create_events_table.sql
   ```
   Copy and execute in SQL Editor

   **Step 3:** Create short_links table
   ```bash
   cat supabase/migrations/20250830_create_short_links_table.sql
   ```
   Copy and execute in SQL Editor

   **Step 4:** Add RLS policies (if not already in database)
   ```bash
   cat supabase/migrations/20251010_add_rls_policies.sql
   ```
   Copy and execute in SQL Editor

5. **Verify the setup**:
   ```sql
   -- Check user_profiles table
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'user_profiles'
   ORDER BY ordinal_position;

   -- Check events table
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'events'
   ORDER BY ordinal_position;

   -- Check RLS is enabled
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public'
   AND tablename IN ('user_profiles', 'events', 'short_links');
   ```

---

### Option B: Existing Database (Add Missing Columns)

If you already have `user_profiles` and `events` tables and just need to add the new quota columns:

1. Go to Supabase SQL Editor
2. Run this migration:
   ```bash
   cat supabase/migrations/20251022_alter_user_profiles_add_quota.sql
   ```
3. Copy and execute in SQL Editor

**Note:** This only adds the missing columns. If your `events` or `short_links` tables don't exist, you'll need to create them separately using the migration files above.

---

## What Gets Created

### Table: `user_profiles`

```
├── id (UUID, Primary Key)
├── user_id (UUID, FK to auth.users, Unique)
├── email (VARCHAR)
├── full_name (VARCHAR, Optional)
├── avatar_url (TEXT, Optional)
├── plan (VARCHAR: 'free' or 'pro', Default: 'free')
├── events_created (INTEGER, Default: 0) ← NEW
├── quota_reset_date (DATE, Default: CURRENT_DATE) ← NEW
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

Indexes:
- user_id (unique)
- email
- plan
- quota_reset_date (for monthly reset queries)

RLS Enabled: Yes
- Users can only view/create/update their own profile
```

### Table: `events`

```
├── id (UUID, Primary Key)
├── user_id (UUID, FK to auth.users)
├── title (VARCHAR)
├── description (TEXT, Optional)
├── location (VARCHAR, Optional)
├── organizer (VARCHAR, Optional)
├── start_date (DATE)
├── start_time (VARCHAR, Optional)
├── end_date (DATE, Optional)
├── end_time (VARCHAR, Optional)
├── timezone (VARCHAR, Default: 'UTC')
├── is_all_day (BOOLEAN, Default: false)
├── share_id (VARCHAR, Unique, Optional)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── last_used_at (TIMESTAMP, Optional)

Indexes:
- user_id
- created_at DESC
- start_date
- share_id
- user_id + created_at (composite)

RLS Enabled: Yes
- Users can only view/create/update/delete their own events
```

### Table: `short_links`

```
├── id (UUID, Primary Key)
├── short_id (VARCHAR(8), Unique)
├── original_url (TEXT)
├── created_at (TIMESTAMP)
├── click_count (INTEGER, Default: 0)
├── user_id (UUID, FK to auth.users)
├── event_title (VARCHAR, Optional)
└── is_active (BOOLEAN, Default: true)

Indexes:
- short_id
- user_id
- created_at DESC

RLS Enabled: Yes
- Anyone can view active short links (for redirects)
- Users can create/view/update their own short links
```

### RPC Functions Created

**`increment_event_count(user_id_param UUID)`**
- Atomically increments the `events_created` counter
- Called after each successful event save
- Security: DEFINER (executes with database role privileges)

---

## How It Works: Event Quota System

### Monthly Reset Logic

1. **First time user creates account**: `events_created = 0`, `quota_reset_date = today`
2. **User creates event**: Quota check happens:
   - If `quota_reset_date < 1st of current month` → Reset to 0
   - If `events_created >= 3` → Block with error message
   - Otherwise → Allow and increment counter
3. **Auto-reset trigger**: Database trigger `reset_monthly_quota()` runs on any `user_profiles` update
   - Automatically resets quota to 0 when month changes
   - Sets `quota_reset_date` to 1st of current month

### Quota Check Flow (in code)

```
User clicks "Generate Event"
    ↓
useSaveEvent.ts calls useCheckEventQuota.checkQuota()
    ↓
Query user_profiles to get current quota status
    ↓
If quota_reset_date < 1st of this month:
    - Update: Reset events_created to 0, set quota_reset_date to today
    ↓
Check if events_created < 3:
    - If YES: Allow, show toast with remaining count
    - If NO: Block, show error toast
```

---

## Testing the Setup

### Test 1: Create Events Up to Quota

1. Sign up with test account
2. Create event #1 → Should succeed (toast: "2 events remaining")
3. Create event #2 → Should succeed (toast: "1 event remaining")
4. Create event #3 → Should succeed (toast: "0 events remaining")
5. Try event #4 → Should be blocked with error message

### Test 2: Monthly Reset

1. Go to Supabase SQL Editor
2. Manually update the reset date to force a reset:
   ```sql
   UPDATE user_profiles
   SET quota_reset_date = DATE_TRUNC('month', CURRENT_DATE)::DATE
   WHERE user_id = 'your-test-user-id';
   ```
3. Refresh app
4. You should be able to create events again

### Test 3: Settings Page

1. Sign in → Click navbar → Settings
2. Check "Account Info" section shows quota progress bar
3. Edit full name → Should update in database
4. Try account deletion with wrong email → Should show error
5. Delete account with correct email → Should remove user

### Test 4: Output Options

1. Create and save an event
2. Go to Dashboard → Click event menu → "View Outputs"
3. See 3 tabs: HTML/CSS, Embed Code, Event Page (Coming Soon)
4. Copy code from each tab → Should work
5. Event Page tab should be disabled with "Coming Soon" badge

---

## Troubleshooting

### Error: "column user_profiles.events_created does not exist"

**Solution**: Run the migration to create the columns
```bash
# Use Option A (fresh start) or Option B (add to existing)
# Then run the migration in Supabase SQL Editor
```

### Error: "insert or update on table 'events' violates foreign key constraint"

**Solution**: The `events` table either:
1. Doesn't exist → Create it with the migration
2. Has wrong foreign key setup → Delete and recreate with migration

### Error: "violates row-level security policy"

**Solution**: RLS policies are preventing the operation. Check:
1. User is authenticated (token is valid)
2. The RLS policies are correctly created
3. Run the RLS migration in SQL Editor

---

## Migration Files

Located in `supabase/migrations/`:

- **20251022_create_user_profiles_table.sql** - Complete user_profiles table with quota columns
- **20251022_create_events_table.sql** - Complete events table with all fields
- **20251022_alter_user_profiles_add_quota.sql** - Only adds quota columns (for existing tables)
- **20250830_create_short_links_table.sql** - Short links table (already exists in most projects)
- **20251010_add_rls_policies.sql** - RLS policies for events and user_profiles

---

## Next Steps

1. ✅ Choose Option A or B above and run migrations
2. ✅ Verify tables were created successfully
3. ✅ Test locally with `npm run dev`
4. ✅ Create test accounts and verify quota system works
5. ✅ Test all new features (Settings, Outputs, Quota)
6. ✅ Deploy to production

---

## Production Deployment

When you're ready to deploy to production:

1. Ensure all migrations have been run in your Supabase project
2. Test thoroughly in staging environment
3. Backup your production database
4. Run migrations in production (they're idempotent and safe)
5. Deploy your code to Vercel

All migrations are designed to be safe and idempotent (can be run multiple times without issues).

---

**Need help?** Check the error logs in browser DevTools Console for specific SQL errors.
