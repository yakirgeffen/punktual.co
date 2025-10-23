# 🧪 Testing Guide - Event Creation & Redirect Fix

**Status**: ✅ All changes verified and ready for testing  
**Dev Server**: http://localhost:3003  
**Last Updated**: Oct 22, 2025

---

## What Was Fixed

The event creation flow had a bug where:
- ❌ Button got stuck on "Creating Event..." indefinitely
- ❌ Events WERE saved but no redirect happened
- ❌ Short link API calls failed with 401 Unauthorized errors

### Root Cause
Short link API calls didn't include authentication headers, so they failed. The code was AWAITING these failed calls, which blocked the entire flow.

### Solution
Added authentication token to short link API requests. Event creation now returns immediately with calendar links and redirects while short links complete in the background.

---

## How to Test

### Prerequisites
- Dev server running: `npm run dev` (already running on port 3003)
- Logged in to Punktual or ready to sign up
- Browser DevTools open (F12) for console logs

### Test Flow

#### 1. **Basic Event Creation Test** (2 minutes)
```
1. Go to http://localhost:3003/create
2. If not logged in:
   - Click "Sign up"
   - Enter email and password
   - Confirm email (or skip if in test mode)
3. Fill event details:
   - Title: "Test Event Meeting"
   - Date: Today
   - Time: 3:00 PM - 4:00 PM
   - Location: "Conference Room A" (optional)
   - Description: "Test event creation flow" (optional)
4. Select platforms: ✓ All (Google, Apple, Outlook, etc.)
5. Choose button style: Any style you prefer
6. Click "Create Event & Generate Links"

Expected Results:
✓ Button shows "Creating Event..."
✓ After 1-2 seconds, button shows "✅ Event Created with Short Links!"
✓ After ~1.5 seconds total, redirects to /dashboard
✓ Event appears in dashboard list
✓ Event shows creation timestamp
```

#### 2. **Quota System Test** (3 minutes)
```
1. After first event, go back to /create
2. Create 2 more events (total 3)
3. For 4th event:
   - Try to create → Should show error toast:
   "Monthly event limit reached. You've used 3 of 3 events this month."

Expected Results:
✓ First 3 events succeed
✓ 4th event blocked with clear error message
✓ Settings page shows "3 of 3 events used"
```

#### 3. **Settings Page Verification** (2 minutes)
```
1. Click user profile icon (top right)
2. Click "Settings"
3. Review displayed information:
   - Profile section: Name, email, avatar
   - Account section: Quota progress bar (shows 3/3 used)
   - Danger zone: Sign out, delete account buttons

Expected Results:
✓ Settings page loads without errors
✓ Quota progress bar shows correct usage
✓ Profile information is accurate
✓ All buttons are clickable
```

#### 4. **Dashboard Output Test** (2 minutes)
```
1. In dashboard, find the first event you created
2. Click the menu button (three dots ⋮) on the event card
3. Click "View Outputs"
4. A modal opens with three tabs:
   - HTML/CSS: Button and HTML code
   - Embed Code: <script> embed code
   - Event Page (Coming Soon): Placeholder
5. Click "Copy to Clipboard" button on each tab
6. Paste (Ctrl+V) to verify code was copied

Expected Results:
✓ Modal opens cleanly
✓ All three tabs are visible
✓ Copy to clipboard works
✓ Code is properly formatted
✓ "Event Page" shows coming soon message
```

#### 5. **Console Verification** (1 minute)
```
1. Open DevTools (F12)
2. Go to Console tab
3. Create another event
4. Look for these logs during creation:

Expected Logs:
✓ [EVENT_SAVE] Saving event { userId: '...', title: '...' }
✓ [EVENT_SAVE] Event saved successfully
✓ [EVENT_SAVE] Short links generated successfully (background)
✓ "Event saved with ID: ..."
✓ "Short links set: { google: '...', apple: '...', ... }"
✓ No 401 or authentication errors
```

#### 6. **Network Tab Verification** (2 minutes - Advanced)
```
1. Open DevTools → Network tab
2. Filter by: Fetch/XHR
3. Create a new event
4. Look for POST requests to /api/create-short-link:

Expected Results:
✓ 6 requests to /api/create-short-link (one per platform)
✓ Each request includes Authorization header:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
✓ All requests return 200 OK or 201 Created
✓ Response includes: { success: true, shortUrl: "..." }
```

---

## Troubleshooting

### Issue: Button still stuck on "Creating Event..."
**Diagnosis**:
1. Open DevTools Console
2. Look for error messages
3. Check Network tab for failed requests

**Solutions**:
- If 401 errors still appear → Auth token not being passed (rebuild: `npm run build`)
- If timeout → Check Supabase connection in .env.local
- If database error → Check quota table structure in Supabase dashboard

### Issue: Redirect doesn't happen but event is saved
**Solution**: Check console for any JavaScript errors. The redirect should happen 1.5 seconds after save.

### Issue: Short links showing original URLs instead of shortened
**This is expected** in fallback mode. Check console logs:
- If it says "Short links generated successfully" → They're in database
- If it says "Failed to generate" → Using fallback (still works, just longer URLs)

### Issue: "Monthly event limit reached" too early
**Solutions**:
1. Go to Settings to see actual quota usage
2. Check Supabase Dashboard → user_profiles table
3. Verify `events_created` field and `quota_reset_date`

---

## Success Criteria

✅ All tests pass if:
1. Events create successfully with redirect
2. Quota system limits to 3 events/month
3. Settings page displays quota correctly
4. Output modal shows 3 options with copyable code
5. Console shows no 401 authentication errors
6. Short link API calls include Authorization header

---

## Key Files to Know

- **Event Creation Logic**: `src/hooks/useSaveEvent.ts`
- **Short Link API**: `src/app/api/create-short-link/route.ts`
- **Short Link Utils**: `src/utils/shortLinks.ts`
- **Button & Redirect**: `src/components/EventCreator/FormTabWrapper.tsx`
- **Settings Page**: `src/components/Settings/SettingsPage.tsx`
- **Dashboard**: `src/app/dashboard/page.tsx`

---

## Documentation References

- [AUTH_FIX_SUMMARY.md](AUTH_FIX_SUMMARY.md) - Technical details of the fix
- [BUGFIX_SUMMARY.md](BUGFIX_SUMMARY.md) - Previous fixes (quota, profiles)
- [QUICK_TEST.md](QUICK_TEST.md) - Quick 5-minute test
- [CLAUDE.md](CLAUDE.md) - Project architecture and overview

---

## Test Environment

- **Node Version**: Check with `node --version`
- **Next.js**: 15.5.4 with Turbopack
- **TypeScript**: Strict mode disabled (safe)
- **Dev Server**: Port 3003 (auto-selected if 3000 in use)
- **Database**: Supabase PostgreSQL

---

## When Done

Once all tests pass:
1. ✅ Event creation works with redirect
2. ✅ Quota system enforces 3-event limit
3. ✅ Short links created successfully
4. ✅ Settings page displays correctly
5. ✅ Dashboard shows output options

You're ready for production deployment! 🚀

---

**Questions?** Check the troubleshooting section or review AUTH_FIX_SUMMARY.md for technical details.
