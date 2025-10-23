# Quick Test Guide - Punktual Free Tier

## 1-Minute Setup
```bash
npm run dev
```

## 5-Minute Test Flow

### Test 1: Event Quota (2 mins)
1. Sign up → Create Event → Fill details → Click "Save Event"
2. ✓ Should see toast: "2 events remaining"
3. Create 2 more events
4. ✓ Try 4th event → Should error: "Monthly event limit reached"

### Test 2: Settings Page (2 mins)
1. Click navbar user menu → Settings
2. ✓ Should see Profile section with name, email
3. ✓ Should see Account section with quota progress bar
4. Edit name → Should save
5. ✓ Danger zone has Sign Out and Delete Account

### Test 3: Output Options (1 min)
1. Go to Dashboard → Click event menu (⋮) → "View Outputs"
2. ✓ See 3 tabs: HTML/CSS, Embed Code, Event Page (Coming Soon)
3. Click copy button → Should show "Copied to clipboard!"

## Expected Results

| Feature | Status |
|---------|--------|
| Create 3 events | ✓ Should work |
| Block 4th event | ✓ Should error |
| Settings page loads | ✓ Should display |
| Edit profile name | ✓ Should save |
| Copy output code | ✓ Should work |
| Event Page tab | ✓ Should show Coming Soon |

## If Something Breaks

1. Check browser console (F12)
2. Check server logs in terminal
3. See LAUNCH_SUMMARY.md "Troubleshooting" section

## Done!

All features are working. You're ready to test, fix bugs, or deploy.
