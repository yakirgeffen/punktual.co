# 🚀 Quick Start - Testing Locally

## What You Need to Do

1. **Pull the code** (VS Code terminal)
2. **Run database migrations** (Supabase dashboard)
3. **Start dev server** (VS Code terminal)
4. **Test features** (Browser)

---

## Step 1: Pull Latest Code

**In VS Code Terminal:**

```bash
# Make sure you're in the project directory
cd /path/to/punktual.co

# Pull latest changes
git fetch origin
git checkout claude/analyze-competitor-calendar-buttons-01Ea6XLsX5VgEhiqADKE8ZQp
git pull

# Install new dependency (React Query)
npm install
```

---

## Step 2: Run Database Migrations

⚠️ **CRITICAL: Do this before testing!**

1. Open https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor**
4. Follow **MIGRATION_INSTRUCTIONS.md** (in this repo)
   - Run all 3 migrations in order
   - Copy/paste each SQL block
   - Verify no errors

---

## Step 3: Start Dev Server

**In VS Code Terminal:**

```bash
npm run dev
```

**Expected output:**
```
✓ Ready in 3s
Local: http://localhost:3000
```

---

## Step 4: Test Features

Open **http://localhost:3000** in your browser

### Quick Test (5 minutes):

1. **Login** to your account

2. **Create Event:**
   - Click "Create Event"
   - Fill in: Title, Date, Time
   - **Important:** Select "Individual Buttons" layout
   - Choose platforms: Google, Apple, Outlook
   - Click "Save Event"

3. **Get Landing Page URL:**
   - Go to Dashboard
   - Find your event
   - Click "..." menu → "View Outputs"
   - Click "Analytics" tab
   - Copy the landing page URL (looks like: `/e/abc123`)

4. **Test Click Tracking:**
   - Open landing page URL in **incognito window**
   - Click "Google Calendar" button
   - Should redirect to Google Calendar

5. **Check Analytics:**
   - Back in dashboard (authenticated)
   - Event → "View Outputs" → "Analytics"
   - **If Pro User:** See "1 click" on Google
   - **If Free User:** See "Unlock Analytics" prompt

✅ **Working?** You're good to go!

---

## What's New in This Branch

### Features Added:
- ✅ Individual button layout (email-safe)
- ✅ Click tracking via landing pages
- ✅ Real-time analytics for pro users
- ✅ Platform breakdown with visual charts
- ✅ IP-based rate limiting (60 seconds)
- ✅ Upgrade prompts for free users

### Files Modified:
- 20+ files updated
- 4 database migrations
- Comprehensive testing suite
- Full documentation

---

## Troubleshooting

### "Table event_clicks does not exist"
→ You didn't run the migrations! See **MIGRATION_INSTRUCTIONS.md**

### "localhost:3000 won't load"
→ Make sure you ran `npm run dev` in **VS Code terminal** (not this chat)

### "Analytics not showing"
→ Check:
1. Migrations ran successfully
2. User has pro plan (check Supabase user_profiles table)
3. Event has clicks (test landing page)

### "Clicks not tracking"
→ Check:
1. Clicked landing page URL (not direct preview)
2. Wait 60 seconds between duplicate clicks (rate limiting)
3. Check Supabase logs for errors

---

## Next Steps

Once local testing passes:
1. Merge to main (or create clean PR)
2. Deploy to Vercel
3. Run migrations on production database
4. Test on production URL

---

## Questions?

- See **LOCAL_TESTING_GUIDE.md** for detailed testing steps
- See **ANALYTICS_IMPLEMENTATION.md** for architecture details
- See **DEPLOYMENT_CHECKLIST.md** for production deployment

**All set!** Start with Step 1 above. 🎉
