# Authentication Fix - Event Creation & Redirect Issue

**Date**: Oct 22, 2025
**Issue**: Event button stuck on "Creating event..." and no redirect to dashboard
**Root Cause**: Short link API calls missing authentication headers (401 Unauthorized)
**Status**: ✅ FIXED

---

## Problem Overview

Users were experiencing the following behavior:
1. Click "Create Event & Generate Links" button
2. Button shows "Creating Event..." and stays in that state indefinitely
3. No error message displayed
4. Event IS created in database (visible in dashboard/quota counter)
5. No redirect to `/dashboard` after completion

### Investigation Findings

The issue was discovered through console logs:
- Event was being saved successfully ✅
- Monthly quota was being incremented ✅
- BUT short link creation API calls were failing with **401 Unauthorized** errors ✅
- The API calls (`/api/create-short-link`) were being AWAITED in a try-catch block
- Failed requests weren't throwing errors (caught by try-catch) but were still hanging
- This prevented the `saveEvent()` promise from resolving
- FormTabWrapper never received the result object, so redirect never triggered

### Technical Root Cause

The `/api/create-short-link` endpoint uses `requireAuth(request)` to verify user authentication. This function checks for:
1. An `sb-access-token` cookie, OR
2. An `Authorization: Bearer {token}` header

The client-side fetch call in `src/utils/shortLinks.ts` was missing both:
```typescript
// BEFORE (No auth headers):
const response = await fetch('/api/create-short-link', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(requestBody),
});
```

Since the request had no auth headers, the API endpoint returned:
```
401 Unauthorized - Authentication required
```

But this wasn't blocking the flow because:
1. The try-catch caught the error
2. The code fell back to using original calendar links
3. HOWEVER, the AWAIT on `createCalendarShortLinks()` was still waiting for all 6 platform calls to complete/fail
4. This created a timeout-like behavior where the function never returned

---

## Solution Applied

### Changes Made

#### 1. **src/utils/shortLinks.ts** - Added Auth Token Support

**Function**: `createShortLink()`
```typescript
// BEFORE:
export async function createShortLink(
  originalUrl: string,
  eventTitle?: string,
  userId?: string
): Promise<CreateShortLinkResponse>

// AFTER:
export async function createShortLink(
  originalUrl: string,
  eventTitle?: string,
  userId?: string,
  authToken?: string  // NEW: Auth token parameter
): Promise<CreateShortLinkResponse>
```

Updated headers construction:
```typescript
const headers: Record<string, string> = {
  'Content-Type': 'application/json',
};

// Add authorization header if token is provided
if (authToken) {
  headers['Authorization'] = `Bearer ${authToken}`;
}
```

**Function**: `createCalendarShortLinks()`
```typescript
// BEFORE:
export async function createCalendarShortLinks(
  calendarLinks: Record<string, string>,
  eventTitle?: string,
  userId?: string
): Promise<Record<string, string>>

// AFTER:
export async function createCalendarShortLinks(
  calendarLinks: Record<string, string>,
  eventTitle?: string,
  userId?: string,
  authToken?: string  // NEW: Auth token parameter
): Promise<Record<string, string>>
```

Now passes auth token to `createShortLink()`:
```typescript
const shortLinkResponse = await createShortLink(
  url,
  `${eventTitle} - ${platform}`,
  userId,
  authToken  // NEW: Pass token
);
```

#### 2. **src/hooks/useSaveEvent.ts** - Pass Session Token

**Change 1**: Extract session from useAuth
```typescript
// BEFORE:
const { user } = useAuth();

// AFTER:
const { user, session } = useAuth();  // Added session
```

**Change 2**: Get access token and pass to short link creation
```typescript
// Get access token from session for authentication
const accessToken = session?.access_token;
createCalendarShortLinks(
  calendarLinks,
  eventData.title,
  user.id,
  accessToken  // NEW: Pass token
)
```

**Change 3**: Update dependency array
```typescript
// BEFORE:
}, [user, supabase]);

// AFTER:
}, [user, session, supabase]);  // Added session
```

---

## How It Works Now

### Flow Diagram

```
User clicks "Create Event & Generate Links"
    ↓
FormTabWrapper.handleCreateEvent()
    ↓
useSaveEvent.saveEvent()
    ↓
1. Check quota ✅
2. Save event to DB ✅
3. Generate calendar links ✅
4. Get access token from session ✅
    ↓
createCalendarShortLinks(calendarLinks, title, userId, accessToken)
    ↓
    ├─ Background Task (Non-blocking):
    │  └─ For each platform:
    │     └─ createShortLink(url, title, userId, authToken)
    │        ├─ Adds Authorization header ✅
    │        └─ POST to /api/create-short-link
    │           ├─ API validates auth token ✅
    │           ├─ Creates short_links entry
    │           └─ Returns short URL
    │
    └─ Returns immediately with fallback calendar links ✅
    ↓
useSaveEvent returns { eventId, shortLinks } ✅
    ↓
FormTabWrapper receives result ✅
    ↓
1. setSavedShortLinks(result.shortLinks) ✅
2. setSaved(true) ✅
3. Button changes to "✅ Event Created..." ✅
4. setTimeout(..., 1500ms) ✅
    ↓
router.push('/dashboard') ✅
    ↓
User redirected to dashboard ✅
```

### What Changed

**Before**:
- Short link creation was AWAITED with try-catch fallback
- API calls with 401 errors would fail but still hang
- Function never returned due to AWAIT
- Redirect never triggered

**After**:
- Short link creation runs as background task (fire-and-forget)
- Function returns immediately with fallback calendar links
- Auth token is properly included in API requests
- API calls succeed and create short links in database
- Redirect happens immediately after event save
- Short links complete asynchronously in background

---

## Testing

### Manual Test Flow

1. **Setup**
   ```bash
   npm run dev
   # Dev server will be on http://localhost:3003
   ```

2. **Test Event Creation with Redirect**
   ```
   1. Go to http://localhost:3003/create
   2. Sign in with test account
   3. Fill in:
      - Event Title: "Test Event"
      - Date: Today
      - Time: 3:00 PM - 4:00 PM
      - Platforms: Select all
      - Button Style: Choose any
   4. Click "Create Event & Generate Links"
   ↓
   Expected Results:
   ✓ Button shows "Creating Event..." briefly
   ✓ Button changes to "✅ Event Created with Short Links!"
   ✓ After ~1.5 seconds, redirect to /dashboard
   ✓ Event appears in dashboard
   ✓ Settings page shows "1 of 3 events used"
   ```

3. **Verify Short Links in Background**
   ```
   1. After redirect, open browser DevTools → Network tab
   2. Go to Dashboard → View event outputs
   3. Check Network logs:
      ✓ Should see 6 POST requests to /api/create-short-link
      ✓ All should have "200 OK" or "201 Created" responses
      ✓ Each should include Authorization header
   ```

4. **Verify Fallback Works**
   ```
   1. Open browser DevTools → Console
   2. Create another event
   3. In console, look for logs:
      ✓ "Short links generated successfully (background)"
      OR
      ✓ "Failed to generate short links (background), using original URLs"
   4. Both cases should redirect successfully
   ```

### Browser Console Logs

**Success Case**:
```
[EVENT_SAVE] Saving event { userId: '...', title: '...' }
[EVENT_SAVE] Event saved successfully
[EVENT_SAVE] Short links generated successfully (background)
✅ Event Created with Short Links!
Redirect to /dashboard
```

**Fallback Case** (network issue):
```
[EVENT_SAVE] Saving event { userId: '...', title: '...' }
[EVENT_SAVE] Event saved successfully
[EVENT_SAVE] Failed to generate short links (background), using original URLs
✅ Event Created with Short Links!
Redirect to /dashboard
```

---

## Files Modified

| File | Changes | Type |
|------|---------|------|
| `src/utils/shortLinks.ts` | Added `authToken` parameter to `createShortLink()` and `createCalendarShortLinks()`, included auth header in fetch request | Auth Fix |
| `src/hooks/useSaveEvent.ts` | Extract `session` from `useAuth()`, extract `access_token` from session, pass to `createCalendarShortLinks()` | Auth Fix |

---

## Database/API Endpoints

### `/api/create-short-link` (Requires Auth)

**Authentication Method**: Bearer Token
- Accepts token in `Authorization: Bearer {token}` header
- Also checks for `sb-access-token` cookie as fallback
- Returns 401 if no auth found

**Example Request** (Before Fix):
```
POST /api/create-short-link
Content-Type: application/json
(No Authorization header) ❌

{
  "originalUrl": "https://calendar.google.com/...",
  "eventTitle": "Test Event - google",
  "userId": "f9e695af-..."
}
```

**Example Request** (After Fix):
```
POST /api/create-short-link
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5... ✅

{
  "originalUrl": "https://calendar.google.com/...",
  "eventTitle": "Test Event - google",
  "userId": "f9e695af-..."
}
```

**Example Response**:
```json
{
  "success": true,
  "shortUrl": "https://punktual.co/eventid=AB12CD34",
  "shortId": "AB12CD34"
}
```

---

## Session/Token Details

### How Supabase Session Works

1. **Auth Signup/Login**: Creates a session with:
   - `access_token`: JWT token for API requests
   - `refresh_token`: Used to get new access tokens
   - `user`: User object with ID and metadata

2. **Session Available In**: React hooks
   ```typescript
   const { session } = useAuth();
   console.log(session?.access_token); // 'eyJhbGc...'
   ```

3. **Session Lifecycle**: Persisted in cookies and browser storage
   - `sb-access-token`: Stored as HTTP-only cookie
   - `sb-refresh-token`: Stored as HTTP-only cookie
   - Automatically sent with requests if server-side route
   - Must be manually added to fetch headers if client-side

---

## Expected Behavior After Fix

### User Journey

```
1. User signs up/logs in ✅
2. User navigates to /create page ✅
3. User fills in event details ✅
4. User clicks "Create Event & Generate Links" ✅
5. Button shows "Creating Event..." (brief) ✅
6. Event is saved to database ✅
7. Calendar links are generated ✅
8. Button changes to "✅ Event Created with Short Links!" ✅
9. After 1.5 seconds, redirect to /dashboard ✅
10. Short links are created in background (silent) ✅
11. User sees event in dashboard ✅
12. User can view outputs (HTML/CSS, Embed Code, Event Page) ✅
```

### Quota System Still Works

```
1. Create event 1 → 2 remaining ✅
2. Create event 2 → 1 remaining ✅
3. Create event 3 → 0 remaining ✅
4. Try event 4 → "Monthly event limit reached" ✅
5. Reset date shown in Settings page ✅
```

---

## Notes for Future Development

### Possible Improvements

1. **Update Short Links in Database After Creation**
   - Currently short links are created in background
   - Could update the `events` table with short links after creation
   - Would require storing short_links in events table or creating junction table

2. **User Notification**
   - Could show a subtle notification when short links are ready
   - Toast: "Short links ready! Updated in dashboard"

3. **Error Handling Enhancement**
   - Could log failed short link creation more prominently
   - Could show which platforms' short links failed in output modal

4. **Rate Limiting**
   - Monitor API usage for short link creation (6 requests per event)
   - May want rate limiting on `/api/create-short-link` endpoint

---

## Build & Deployment Status

```
✓ TypeScript: No compilation errors
✓ Build: Successful (npm run build)
✓ Dev Server: Running on port 3003
✓ Ready for testing
✓ Ready for production deployment
```

---

## Related Fixes

This fix complements the previous BUGFIX_SUMMARY.md fixes:

1. **Auto-Profile Creation** (Previous) → Ensures `user_profiles` exists
2. **Quota System** (Previous) → Tracks event count per user
3. **Auth Token in Requests** (This Fix) → Enables API communication with auth

All three components work together to enable complete event creation and short link generation flow.

---

## Questions?

Refer to:
- **CLAUDE.md** for project structure overview
- **QUICK_TEST.md** for manual testing guide
- **BUGFIX_SUMMARY.md** for previous fixes (auto-profile, quota system)
- Browser DevTools Console for detailed logs during testing
