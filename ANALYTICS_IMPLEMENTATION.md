# Analytics Implementation - Unified Tracking System

## Overview

This document describes the comprehensive analytics implementation for Punktual.co, enabling click tracking and analytics for calendar button interactions across all platforms.

## Architecture

### Unified Tracking Flow

```
User clicks button → Landing page (/e/{shareId}?cal=platform)
                  ↓
            Rate limit check (IP + 60s window)
                  ↓
            Record click to database
                  ↓
            Redirect to actual calendar URL
                  ↓
            Analytics dashboard shows data
```

## Database Schema

### Tables

**`event_clicks`** - Main click tracking table
```sql
CREATE TABLE event_clicks (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  platform VARCHAR(20) CHECK (platform IN ('google', 'apple', 'outlook', 'office365', 'outlookcom', 'yahoo')),
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT,
  referrer TEXT,
  ip_address INET
);
```

**`events.total_clicks`** - Denormalized counter (performance optimization)
- Auto-incremented via trigger
- Enables fast dashboard queries without aggregation

### SQL Functions

**`get_event_analytics(event_id)`**
- Returns: total_clicks, platform_breakdown (JSONB), last_clicked_at
- Used by useEventAnalytics hook

**`check_recent_click(event_id, ip_address, window_seconds)`**
- Returns: boolean (true if recently clicked)
- Prevents spam/bot inflation

**`get_user_events_analytics(user_id)`**
- Returns: all events with click counts for dashboard overview

### Row Level Security (RLS)

- Public INSERT policy: Anyone can track clicks (anonymous landing pages)
- Restricted SELECT policy: Users can only view clicks for their own events

## Frontend Implementation

### 1. React Query Setup

**`src/providers/QueryProvider.tsx`**
- Wraps app with QueryClientProvider
- Configured defaults:
  - 1 minute stale time
  - 5 minute cache time
  - Single retry on failure
  - No refetch on window focus

### 2. Analytics Hook

**`src/hooks/useEventAnalytics.ts`**
```typescript
const { analytics, isLoading, hasData, isPro } = useEventAnalytics(eventId);
```

Features:
- Fetches data via `get_event_analytics` RPC
- Only enabled for authenticated pro users
- Returns: totalClicks, platformBreakdown[], lastClickedAt
- Auto-sorts platforms by clicks descending
- Supports manual refetch and auto-refresh intervals

### 3. User Plan Detection

**`src/hooks/useUserPlan.ts`**
- Lightweight hook returning user's subscription tier
- Used to gate analytics features

### 4. Click Tracking

**Landing Page: `/e/[shareId]/page.tsx`**
- Server-side click tracking before redirect
- Rate limiting via SQL function (60-second IP window)
- Captures: event_id, platform, ip_address, user_agent, referrer
- Falls back to client if event not found

**API Endpoint: `/api/track-click/route.ts`**
- Client-side fallback for click tracking
- Same rate limiting logic
- Used when server-side tracking isn't possible

**Event Landing Client: `EventLandingClient.tsx`**
- Displays event details and calendar buttons
- All buttons link to `/e/{shareId}?cal=platform`
- Includes "Powered by Punktual" badge for free tier

### 5. Code Generators (Unified Tracking)

All code generators now support `shareId` parameter:

**`calendarGenerator.ts`**
- `generateButtonCode()` - Main entry point
- `generateIndividualButtonsHTML()` - Email-safe table layout
- `generateHTMLCode()` - Dropdown button layout
- `generateReactComponent()` - React component
- `generateDirectLinks()` - Simple link list

**Logic:**
- When `shareId` provided: Use `/e/{shareId}?cal=platform` (tracked)
- When `shareId` missing: Use direct calendar URLs (preview mode)

**`embedCodeGenerator.ts`**
- `generateInlineEmbedCode()` - Inline JavaScript embed
- Same conditional logic for shareId

### 6. Dashboard Analytics Display

**`EventCard.tsx`** - Updated with analytics

**Click Badges:**
- Grid view: Shows total clicks in footer
- List view: Shows total clicks in metadata row
- Only visible to pro users
- Emerald theme styling

**Analytics Tab in Modal:**

For Pro Users:
- Total clicks counter with gradient background
- Last clicked timestamp
- Platform breakdown with:
  - Platform names (properly formatted)
  - Click counts and percentages
  - Visual progress bars
- Event landing page URL with copy button
- Empty state for events with no clicks

For Free Users:
- Upgrade prompt with feature highlights
- Benefits list (real-time tracking, platform breakdown, insights)
- "Upgrade to Pro" CTA button

## Testing

### Component Tests

**`EventSummary.test.tsx`** (10 tests)
- Event details rendering
- Date/time formatting (standard, all-day, multi-day)
- Edge cases and missing data

**`PreviewTabs.test.tsx`** (7 tests)
- Tab switching behavior
- Active state management
- Layout change callbacks

### Integration Tests

**`clickTracking.test.tsx`** (8 test suites)
- Analytics data fetching
- Empty state handling
- Error handling
- Free user gating
- Undefined eventId handling
- Platform breakdown sorting
- Analytics flags (hasData)

## User Experience

### Preview Flow (No Tracking)
1. User creates event in EventCreator
2. Preview shows calendar buttons with direct URLs
3. Clicking buttons goes directly to calendar platforms
4. No analytics tracked

### Production Flow (With Tracking)
1. User saves event → receives shareId
2. Generated code uses `/e/{shareId}?cal=platform` URLs
3. User embeds code on website/email
4. Visitor clicks button → lands on `/e/{shareId}?cal=platform`
5. Server tracks click (with rate limiting)
6. Visitor redirected to actual calendar URL
7. Analytics appear in dashboard immediately

### Analytics Dashboard
1. Pro user opens dashboard
2. Each event shows click badge
3. User clicks "View Outputs" → opens modal
4. Clicks "Analytics" tab
5. Sees:
   - Total clicks with timestamp
   - Platform breakdown with visual bars
   - Landing page URL to share

## Freemium Strategy

**Free Tier:**
- Click tracking still works (all buttons go through landing pages)
- Analytics data is collected in database
- Dashboard shows "Unlock Analytics" prompt
- Can upgrade to see historical data immediately

**Pro Tier:**
- Full access to analytics dashboard
- Real-time click tracking visible
- Platform breakdown insights
- Event performance metrics

## Performance Optimizations

1. **Denormalized Counters**
   - `events.total_clicks` updated via trigger
   - Dashboard queries don't need aggregation

2. **React Query Caching**
   - 1-minute stale time prevents excessive fetches
   - Placeholder data prevents UI flicker

3. **Database Indexes**
   - `event_clicks(event_id)` for fast lookups
   - `event_clicks(event_id, platform)` for aggregations
   - `event_clicks(ip_address, clicked_at)` for rate limiting
   - `events(total_clicks DESC)` for sorting

4. **RLS Policies**
   - Minimal overhead on INSERT (public)
   - User-scoped SELECT (efficient with indexes)

## Security Considerations

1. **Rate Limiting**
   - IP-based 60-second window
   - Prevents spam/bot inflation
   - SQL function for atomic checks

2. **Data Privacy**
   - IP addresses stored for rate limiting only
   - User agent and referrer optional
   - RLS ensures users only see own data

3. **Input Validation**
   - Platform enum constraint in database
   - Event ID validation in hooks
   - UUID validation in API routes

## Migration Path

All SQL migrations are in `supabase/migrations/`:
- `20251116_create_event_clicks_table.sql`
- `20251116_create_analytics_functions.sql`
- `20251116_add_total_clicks_to_events.sql`
- `20251116_rollback_event_clicks.sql` (safety rollback)

To apply: Run migrations in order via Supabase CLI or dashboard

## Future Enhancements

1. **Advanced Analytics**
   - Geographic click distribution
   - Device/browser breakdown
   - Time-based trends (hourly, daily, weekly)
   - Conversion tracking (added to calendar vs just clicked)

2. **Webhooks**
   - Real-time notifications on click milestones
   - Integration with analytics platforms

3. **A/B Testing**
   - Test different button styles
   - Test different platform orderings
   - Measure conversion impact

4. **Export Capabilities**
   - CSV export of click data
   - PDF reports
   - API access for custom dashboards

## Troubleshooting

**Analytics not showing:**
- Verify user has pro plan (`user_profiles.plan = 'pro'`)
- Check RPC function exists: `SELECT * FROM pg_proc WHERE proname = 'get_event_analytics'`
- Verify RLS policies: `SELECT * FROM pg_policies WHERE tablename = 'event_clicks'`

**Clicks not tracking:**
- Check rate limit window (60 seconds)
- Verify event exists and has share_id
- Check server logs for insert errors
- Verify RLS allows INSERT (should be public)

**Button links wrong:**
- Verify shareId passed to code generators
- Check NEXT_PUBLIC_BASE_URL environment variable
- Ensure landing page route exists

## Summary

This implementation provides a complete, production-ready analytics system with:
- ✅ Unified tracking architecture
- ✅ Rate limiting and spam prevention
- ✅ Freemium-friendly design
- ✅ Comprehensive testing
- ✅ Performance optimizations
- ✅ Security best practices
- ✅ Excellent user experience

All calendar buttons now funnel through tracking landing pages, enabling accurate analytics while maintaining a seamless user experience.
