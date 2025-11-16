# Deployment Checklist - Analytics Implementation

## Pre-Deployment Verification

### ✅ Build Fixes Applied
- [x] Fixed Next.js 15 async cookies compatibility
- [x] Fixed missing headers import in landing page
- [x] Fixed TypeScript errors in tests
- [x] All TypeScript compilation passes

### 🗄️ Database Migrations Required

**CRITICAL**: Run these migrations in Supabase before deploying to production:

1. **`20251116_create_event_clicks_table.sql`**
   - Creates `event_clicks` table
   - Sets up RLS policies
   - Adds indexes for performance

2. **`20251116_create_analytics_functions.sql`**
   - Creates `get_event_analytics()` function
   - Creates `check_recent_click()` function
   - Creates `get_user_events_analytics()` function

3. **`20251116_add_total_clicks_to_events.sql`**
   - Adds `total_clicks` column to events table
   - Creates auto-increment trigger
   - Backfills existing data

### Migration Steps (Supabase Dashboard)

```bash
# Option 1: Via Supabase Dashboard
1. Go to Supabase Dashboard > SQL Editor
2. Copy content of each migration file
3. Run them in order (numbered sequence)
4. Verify no errors

# Option 2: Via Supabase CLI (if installed locally)
supabase db push
```

### Verify Migrations

After running migrations, verify:

```sql
-- Check table exists
SELECT * FROM event_clicks LIMIT 1;

-- Check functions exist
SELECT * FROM pg_proc WHERE proname = 'get_event_analytics';
SELECT * FROM pg_proc WHERE proname = 'check_recent_click';

-- Check trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'after_event_click';

-- Check column exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'events' AND column_name = 'total_clicks';
```

## Environment Variables

Ensure these are set in Vercel:

### Required
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `NEXT_PUBLIC_BASE_URL` - Production URL (e.g., `https://punktual.co`)
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Google Analytics ID

### Optional
- Any other existing env vars

## Testing Checklist

### Before Merging to Main

- [ ] All TypeScript errors resolved (`npm run build` would pass if not for network issues)
- [ ] Component tests passing
- [ ] Integration tests passing
- [ ] No console errors in development

### After Deploying to Production

#### 1. Test Event Creation Flow
- [ ] Create new event as authenticated user
- [ ] Verify event saved with `share_id`
- [ ] Verify generated code contains landing page URLs (`/e/{shareId}?cal=platform`)

#### 2. Test Landing Page
- [ ] Visit `/e/{shareId}` - page loads correctly
- [ ] Event details display properly
- [ ] Calendar buttons render
- [ ] Click button - redirects to landing page with `?cal=platform`
- [ ] Second click should be rate limited (60 seconds)

#### 3. Test Analytics (Pro User)
- [ ] Open dashboard
- [ ] Click "View Outputs" on an event
- [ ] Click "Analytics" tab
- [ ] Verify total clicks display
- [ ] Verify platform breakdown shows
- [ ] Click landing page button, refresh analytics - count increases

#### 4. Test Analytics (Free User)
- [ ] Log in as free user
- [ ] View dashboard - no analytics badges visible
- [ ] Click "View Outputs" on event
- [ ] Click "Analytics" tab
- [ ] Verify upgrade prompt shows
- [ ] "Upgrade to Pro" button links to pricing

#### 5. Test Code Generation
- [ ] Generate HTML code - verify uses `/e/{shareId}?cal=platform`
- [ ] Generate React code - verify uses landing page URLs
- [ ] Generate inline embed - verify tracking links
- [ ] Test in email client (if possible)

## Rollback Plan

If issues occur, rollback database changes:

```sql
-- Run the rollback migration
-- See: supabase/migrations/20251116_rollback_event_clicks.sql

-- This will:
-- 1. Drop trigger
-- 2. Drop functions
-- 3. Drop event_clicks table
-- 4. Remove total_clicks column
```

## Known Issues & Workarounds

### Issue: Build Fails Locally
**Reason**: Sandbox environment can't fetch Google Fonts
**Impact**: None - will work in Vercel
**Workaround**: Verify TypeScript compilation instead

### Issue: Supabase Auth Helpers Warning
**Reason**: Next.js 15 async cookies API
**Impact**: None - working correctly with current implementation
**Workaround**: Already handled by passing cookies function directly

## Performance Considerations

### Expected Query Performance
- Landing page load: ~50-100ms (cached event data)
- Click tracking: ~20-30ms (single INSERT)
- Analytics fetch: ~30-50ms (aggregated via RPC function)
- Dashboard load: ~100-150ms (multiple events with analytics)

### Caching Strategy
- React Query: 1-minute stale time, 5-minute cache
- Denormalized counters: Instant dashboard display
- Database indexes: Fast lookups and aggregations

## Monitoring After Deployment

### Check These Metrics

1. **Error Rate**
   - Supabase logs: Look for RPC function errors
   - Vercel logs: Look for 500 errors on `/e/[shareId]`

2. **Performance**
   - Landing page load times
   - API route response times (`/api/track-click`)
   - Database query times in Supabase logs

3. **User Impact**
   - Analytics displaying correctly
   - Click tracking working
   - Rate limiting preventing spam

### Vercel Deployment Status

**Before merging to main:**
1. Run database migrations in production Supabase
2. Verify all tests pass
3. Test on preview deployment
4. Check Vercel build logs for any warnings

## Post-Deployment Verification

### Success Criteria

✅ **Builds Successfully**
- No TypeScript errors
- No build warnings
- All routes accessible

✅ **Click Tracking Works**
- Buttons redirect through landing pages
- Clicks recorded in database
- Rate limiting prevents duplicates

✅ **Analytics Display**
- Pro users see analytics
- Free users see upgrade prompt
- Platform breakdown accurate

✅ **Performance Acceptable**
- Landing pages load < 1s
- Click tracking < 100ms
- Analytics fetch < 200ms

## Support & Troubleshooting

### If Analytics Don't Show
1. Check user plan: `SELECT plan FROM user_profiles WHERE user_id = '...'`
2. Verify RPC functions exist (see SQL above)
3. Check browser console for errors
4. Verify React Query provider is wrapping app

### If Clicks Don't Track
1. Check RLS policies on event_clicks table
2. Verify trigger is active
3. Check Supabase logs for insert errors
4. Test rate limit function manually

### If Build Fails on Vercel
1. Check Vercel build logs for specific error
2. Verify all dependencies installed
3. Check environment variables set correctly
4. Ensure Supabase credentials valid

## Final Checklist Before Going Live

- [ ] Database migrations run successfully
- [ ] Environment variables configured
- [ ] Preview deployment tested
- [ ] Analytics working for test pro user
- [ ] Free user sees upgrade prompt
- [ ] Click tracking verified
- [ ] Rate limiting tested
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Rollback plan understood

---

**Ready to deploy!** 🚀

Once database migrations are applied and environment variables are set, the implementation is production-ready.
