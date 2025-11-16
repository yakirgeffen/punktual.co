# Local Testing Guide - Analytics Implementation

## ✅ Prerequisites Completed
- [x] Database migrations applied to Supabase
- [x] Environment variables configured

## 🚀 Start Development Server

```bash
npm run dev
```

Visit: `http://localhost:3000`

## 🧪 Testing Checklist

### 1. Test Event Creation Flow

**Login & Create Event:**
```
1. Navigate to http://localhost:3000
2. Click "Sign In" or "Get Started"
3. Login with your test account
4. Click "Create Event" or navigate to /create
5. Fill in event details:
   - Title: "Team Meeting"
   - Date: Tomorrow
   - Time: 2:00 PM
   - Description: "Quarterly review"
6. In Button Customization section:
   - Select "Individual Buttons" layout
   - Choose platforms: Google, Apple, Outlook
7. Click "Save Event"
```

**Verify:**
- ✅ Event saves successfully
- ✅ Toast notification shows "saved with calendar links"
- ✅ Redirects to dashboard
- ✅ Event appears in dashboard list

### 2. Test Landing Page & Click Tracking

**Get Landing Page URL:**
```
1. In dashboard, find your saved event
2. Click the "..." menu → "View Outputs"
3. Click "Analytics" tab
4. Copy the event landing page URL (should be /e/{shareId})
```

**Test Landing Page:**
```
1. Open landing page URL in new incognito window
2. Verify event details display correctly
3. Click "Google Calendar" button
4. Should redirect to /e/{shareId}?cal=google
5. Should then redirect to actual Google Calendar
```

**Verify Click Tracking:**
```
1. Go back to dashboard (authenticated user)
2. Open event → "View Outputs" → "Analytics"
3. Should see: 1 click on Google Calendar
4. Try clicking another platform (Apple)
5. Analytics should show: 1 Google, 1 Apple
```

### 3. Test Rate Limiting

**Test IP-Based Rate Limiting:**
```
1. Click same calendar button immediately (within 60 seconds)
2. Second click should NOT increment counter
3. Wait 60 seconds
4. Click again - should increment
```

**Verify in Database:**
```sql
-- Check event_clicks table
SELECT * FROM event_clicks
WHERE event_id = 'YOUR_EVENT_ID'
ORDER BY clicked_at DESC;

-- Should see clicks but duplicates within 60s filtered
```

### 4. Test Analytics Display (Pro User)

**If you have Pro plan:**
```
1. Dashboard → Event card shows click badge (green pill with number)
2. Click "View Outputs"
3. "Analytics" tab shows:
   - Total clicks count
   - Last clicked timestamp
   - Platform breakdown with bars
   - Percentages calculated correctly
4. Landing page URL with copy button
```

**Test No Clicks State:**
```
1. Create new event (don't click landing page)
2. Open analytics tab
3. Should see: "No clicks yet" message
```

### 5. Test Analytics Display (Free User)

**Test with free account:**
```
1. Login with free tier account
2. Dashboard → No click badges visible
3. Open event → "View Outputs" → "Analytics"
4. Should see upgrade prompt:
   - "Unlock Analytics" heading
   - Feature list (real-time tracking, platform breakdown, etc.)
   - "Upgrade to Pro" button
5. Click button → redirects to /pricing
```

### 6. Test Code Generation

**Test Individual Buttons HTML:**
```
1. Event → "View Outputs" → "HTML/CSS" tab
2. Copy generated code
3. Create test.html file
4. Paste code and open in browser
5. Verify:
   - Buttons display in email-safe layout
   - Each platform shows as separate button
   - Click button → goes to /e/{shareId}?cal=platform
```

**Test Embed Code:**
```
1. "View Outputs" → "Embed Code" tab
2. Copy inline script
3. Paste into test HTML
4. Verify buttons render and track correctly
```

### 7. Test Preview Mode (No Tracking)

**Before Saving Event:**
```
1. Create new event (don't save)
2. In preview section, click calendar buttons
3. Should go DIRECTLY to calendar platforms
4. Should NOT go through /e/{shareId}
5. This is preview mode - no tracking
```

### 8. Test Multi-Platform Analytics

**Create Complete Flow:**
```
1. Create event, get landing page URL
2. Share with 5 different people (or use 5 browsers/devices)
3. Have each click different platforms:
   - Person 1: Google
   - Person 2: Apple
   - Person 3: Google
   - Person 4: Outlook
   - Person 5: Google
4. Check analytics:
   - Total: 5 clicks
   - Google: 3 (60%)
   - Apple: 1 (20%)
   - Outlook: 1 (20%)
   - Platform bars sized correctly
```

## 🔍 Database Verification Queries

### Check Analytics Functions Work

```sql
-- Test get_event_analytics function
SELECT * FROM get_event_analytics('YOUR_EVENT_ID');

-- Expected output:
-- total_clicks | platform_breakdown (JSONB) | last_clicked_at
-- 5           | {"google": 3, "apple": 1, "outlook": 1} | 2025-11-16T...

-- Test rate limit function
SELECT check_recent_click(
  'YOUR_EVENT_ID',
  '192.168.1.1'::inet,
  60
);

-- Returns: true if recently clicked, false otherwise
```

### Verify Data Integrity

```sql
-- Check denormalized counters match
SELECT
  e.id,
  e.title,
  e.total_clicks as denormalized_count,
  COUNT(ec.id) as actual_count
FROM events e
LEFT JOIN event_clicks ec ON e.id = ec.event_id
WHERE e.id = 'YOUR_EVENT_ID'
GROUP BY e.id, e.title, e.total_clicks;

-- Both counts should match!
```

## 🐛 Troubleshooting

### Issue: Analytics Not Showing

**Check:**
```sql
-- Verify user is pro
SELECT plan FROM user_profiles WHERE user_id = 'YOUR_USER_ID';

-- Check RPC function exists
SELECT * FROM pg_proc WHERE proname = 'get_event_analytics';
```

**Browser Console:**
- Open DevTools → Console
- Look for React Query errors
- Check Network tab for failed API calls

### Issue: Clicks Not Tracking

**Check:**
```sql
-- Verify RLS allows inserts
SELECT * FROM pg_policies WHERE tablename = 'event_clicks';

-- Check if clicks are being inserted
SELECT COUNT(*) FROM event_clicks WHERE event_id = 'YOUR_EVENT_ID';
```

**Server Logs:**
- Check browser Network tab
- Look for 500 errors on /e/{shareId}
- Check Supabase logs for insert errors

### Issue: Rate Limiting Too Aggressive

**Adjust Window:**
```sql
-- The window is 60 seconds
-- To test, you can temporarily change the check_recent_click call
-- in src/app/e/[shareId]/page.tsx from 60 to 5 (5 seconds for testing)
```

### Issue: Landing Page 404

**Verify:**
```sql
-- Check event has share_id
SELECT id, title, share_id FROM events WHERE id = 'YOUR_EVENT_ID';

-- If share_id is null, event wasn't saved correctly
```

## 📊 Expected Performance

- **Landing Page Load**: < 500ms
- **Click Tracking**: < 100ms
- **Analytics Fetch**: < 200ms
- **Code Generation**: Instant (client-side)

## ✅ Success Criteria

All tests pass when:
- ✅ Events create and save with share_id
- ✅ Landing pages load and display event details
- ✅ Clicks track correctly (visible in analytics)
- ✅ Rate limiting prevents duplicates
- ✅ Pro users see analytics
- ✅ Free users see upgrade prompt
- ✅ Platform breakdown is accurate
- ✅ Generated code uses tracking URLs
- ✅ Preview mode uses direct URLs
- ✅ Performance is acceptable

## 🎯 Quick Smoke Test (5 minutes)

```bash
# 1. Start server
npm run dev

# 2. Test auth flow
# → Login at localhost:3000

# 3. Create test event
# → Fill form, save

# 4. Open landing page
# → /e/{shareId} should load

# 5. Click calendar button
# → Redirects correctly

# 6. Check analytics
# → Dashboard shows clicks (if pro)
# → Shows upgrade (if free)

# All working? Ready for production! 🚀
```

## 📝 Notes

- **Branch Name**: Will be renamed when merging to main
- **Migrations**: Already applied to your Supabase instance
- **Environment**: Using your existing .env.local variables
- **Testing**: Use real Supabase instance (local or dev)

---

**Happy Testing!** If you find any issues, check the troubleshooting section or database queries above.
