# Security Documentation

## Authentication & Authorization Architecture

### Overview

Punktual uses Supabase for authentication and database access with a defense-in-depth approach:

1. **Row-Level Security (RLS)** - Database-level access control
2. **Client-side auth** - User session management in browser
3. **Server-side validation** - API route authentication checks
4. **Service role isolation** - Admin operations confined to server

### Authentication Providers

- **Email/Password** - Traditional signup via Supabase Auth
- **Google OAuth** - Social login with offline access and consent prompt

### Session Management

- **Storage**: httpOnly cookies (automatically managed by Supabase)
- **Tokens**: Access token (1hr) + refresh token (auto-renewed)
- **State tracking**: `onAuthStateChange` listener in [useAuth.tsx](src/hooks/useAuth.tsx:112)

### Client Types & Security Boundaries

| Client Type | Location | Key Used | Bypasses RLS? | Use Cases |
|------------|----------|----------|---------------|-----------|
| **Browser Client** | Client components | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ❌ No | User data access, auth flows |
| **Server Client** | Server components | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ❌ No | SSR with user context |
| **Service Role Client** | API routes only | `SUPABASE_SERVICE_ROLE_KEY` | ✅ **YES** | Admin ops, short links |

**Critical Rule**: `SUPABASE_SERVICE_ROLE_KEY` must NEVER be exposed to the client.

---

## Current Authentication Inventory

### 1. Auth Providers Configured

**Email/Password Flow:**
- Signup: [useAuth.tsx:153-183](src/hooks/useAuth.tsx:153-183)
- Login: [useAuth.tsx:185-204](src/hooks/useAuth.tsx:185-204)
- Email confirmation: Redirects to `/auth/callback`

**Google OAuth Flow:**
- Initiation: [useAuth.tsx:206-226](src/hooks/useAuth.tsx:206-226)
- Callback handler: [src/app/auth/callback/page.tsx](src/app/auth/callback/page.tsx)
- Settings: `access_type: offline`, `prompt: consent`

### 2. Session Reading Locations

| Location | Method | Context |
|----------|--------|---------|
| [useAuth.tsx:112](src/hooks/useAuth.tsx:112) | `onAuthStateChange` listener | Client-side, sets global auth state |
| [auth/callback/page.tsx:52](src/app/auth/callback/page.tsx:52) | `exchangeCodeForSession` | OAuth code exchange |
| [create-short-link/route.ts:12](src/app/api/create-short-link/route.ts:12) | `requireAuth` helper | Server-side validation |
| [useSaveEvent.ts:33](src/hooks/useSaveEvent.ts:33) | `useAuth` hook | Client-side user context |

### 3. Client-Side Token Exposure Analysis

✅ **No hardcoded secrets found in codebase**

**Public environment variables (safe to expose):**
- `NEXT_PUBLIC_SUPABASE_URL` - Project identifier
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public key (RLS-protected)
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Analytics ID
- `NEXT_PUBLIC_BASE_URL` - Application URL

**Server-only secrets (properly isolated):**
- `SUPABASE_SERVICE_ROLE_KEY` - Only used in API routes ✅

**Git history scan:**
- No `.env` files committed ✅
- `.gitignore` properly configured ✅
- No secret strings in commit history ✅

---

## Secret Rotation Procedures

### If `SUPABASE_SERVICE_ROLE_KEY` is Leaked

**🚨 IMMEDIATE ACTIONS (Within 15 minutes):**

1. **Revoke the compromised key:**
   ```
   1. Go to: Supabase Dashboard → Your Project → Settings → API
   2. Under "Service role" section, click "Reset service_role key"
   3. Confirm the reset (old key immediately invalidated)
   4. Copy the new key to a secure location
   ```

2. **Update production environment:**
   ```bash
   # Vercel (example)
   vercel env rm SUPABASE_SERVICE_ROLE_KEY production
   vercel env add SUPABASE_SERVICE_ROLE_KEY production
   # Paste new key when prompted

   # Trigger new deployment to use new key
   vercel --prod
   ```

3. **Update local development:**
   ```bash
   # Update .env.local (NEVER commit this file)
   SUPABASE_SERVICE_ROLE_KEY=your_new_service_role_key
   ```

4. **Notify team:**
   - Alert all developers to update their local `.env.local`
   - Check CI/CD secrets if applicable
   - Document the incident for post-mortem

**🔍 FOLLOW-UP ACTIONS (Within 24 hours):**

1. **Audit database access logs:**
   ```sql
   -- Check for suspicious queries (if logging enabled)
   -- Run in Supabase SQL Editor
   SELECT * FROM auth.audit_log_entries
   WHERE created_at > '[TIME_OF_LEAK]'
   ORDER BY created_at DESC;
   ```

2. **Review short_links table:**
   ```sql
   -- Check for unauthorized link creation
   SELECT short_id, event_title, user_id, created_at
   FROM short_links
   WHERE created_at > '[TIME_OF_LEAK]'
   ORDER BY created_at DESC;
   ```

3. **Check for data exfiltration:**
   - Review user_profiles for unexpected exports
   - Check events table for bulk reads
   - Monitor for unusual click_count increments

4. **Force user re-authentication (if severe breach):**
   ```sql
   -- ONLY IN EXTREME CASES - logs out all users
   -- Run in Supabase SQL Editor
   DELETE FROM auth.sessions;
   ```

### If `NEXT_PUBLIC_SUPABASE_ANON_KEY` is Leaked

**Risk Level: LOW** (This key is designed to be public)

However, if you suspect abuse:

1. **Check RLS policies are enabled:**
   ```sql
   -- Verify RLS is ON for all tables
   SELECT schemaname, tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public'
   AND rowsecurity = false;
   -- Should return 0 rows
   ```

2. **Rotate the key (if absolutely necessary):**
   ```
   1. Supabase Dashboard → Settings → API
   2. Click "Reset anon key"
   3. Update NEXT_PUBLIC_SUPABASE_ANON_KEY everywhere
   4. Redeploy ALL environments (breaks existing sessions)
   ```

   **⚠️ WARNING**: This will log out ALL users and break any hardcoded references.

### If User Credentials are Compromised

1. **User-initiated password reset:**
   - User clicks "Forgot password" in your app
   - Implements: [useAuth.tsx:248-260](src/hooks/useAuth.tsx:248-260)

2. **Admin-initiated password reset:**
   ```
   1. Supabase Dashboard → Authentication → Users
   2. Find the user by email
   3. Click "..." menu → "Send password recovery"
   ```

3. **Disable user account (if necessary):**
   ```sql
   -- Temporarily ban user account
   UPDATE auth.users
   SET banned_until = NOW() + INTERVAL '7 days'
   WHERE email = 'compromised@email.com';
   ```

---

## Row-Level Security (RLS) Policies

### Current RLS Status

**Tables requiring RLS policies:**

| Table | RLS Enabled? | Policies Implemented | Migration File |
|-------|--------------|---------------------|----------------|
| `user_profiles` | ✅ **YES** | SELECT, INSERT, UPDATE | [20251010_add_rls_policies.sql](supabase/migrations/20251010_add_rls_policies.sql) |
| `events` | ✅ **YES** | SELECT, INSERT, UPDATE, DELETE | [20251010_add_rls_policies.sql](supabase/migrations/20251010_add_rls_policies.sql) |
| `short_links` | ✅ **YES** | Public read (active), user CRUD | [20250830_create_short_links_table.sql](supabase/migrations/20250830_create_short_links_table.sql) |

**✅ STATUS**: All RLS policies implemented and documented (as of 2025-10-10)

### Example RLS Policies

```sql
-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can insert their own profile (for signup)
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## Security Checklist

### Pre-Deployment

- [x] All `.env*` files in `.gitignore` ✅
- [x] No hardcoded secrets in codebase ✅
- [x] Service role key only used in API routes ✅
- [x] RLS policies enabled on all tables ✅ (as of 2025-10-10)
- [ ] RLS policies tested with different users ⚠️ **PENDING**
- [x] OAuth redirect URLs configured in Supabase ✅
- [ ] CORS settings reviewed (if using external domains)

### Production Environment

- [x] `SUPABASE_SERVICE_ROLE_KEY` stored as encrypted secret ✅
- [ ] Environment variables set in Vercel/hosting platform
- [x] HTTPS enforced (automatic with Vercel) ✅
- [x] Cookie settings: `httpOnly`, `secure`, `SameSite=Strict` ✅ (handled by Supabase)
- [x] Rate limiting enabled ✅ (60 req/min via middleware.ts)
- [x] Security headers configured ✅ (CSP, X-Frame-Options, etc.)
- [x] Input validation with Zod schemas ✅
- [x] Audit logging for security events ✅
- [ ] Monitoring/alerting for auth failures ⚠️ **RECOMMENDED**

### Ongoing Maintenance

- [ ] Regular security audits (quarterly)
- [ ] Dependency updates (`npm audit`)
- [ ] Review Supabase auth logs monthly
- [ ] Test password reset flow quarterly
- [ ] Verify RLS policies after schema changes

---

## Incident Response Contacts

**Security Issues:**
- Supabase Support: https://supabase.com/support
- Project Owner: [Add contact info]
- DevOps Lead: [Add contact info]

**Reporting Vulnerabilities:**
- Create private GitHub Security Advisory
- Email: [Add security email]

---

## Implemented Security Features (2025-10-10)

### ✅ Completed

1. **Row-Level Security (RLS) Policies** ✅
   - Created migration: [20251010_add_rls_policies.sql](supabase/migrations/20251010_add_rls_policies.sql)
   - Enabled RLS on `events` and `user_profiles` tables
   - Policies enforce user data isolation

2. **Rate Limiting** ✅
   - Implemented in: [src/middleware.ts](src/middleware.ts)
   - 60 requests per minute per IP address
   - Applies to all `/api/*` routes
   - Returns 429 status with `Retry-After` header

3. **Security Headers** ✅
   - Configured in: [next.config.ts](next.config.ts)
   - CSP, X-Frame-Options, X-Content-Type-Options, etc.
   - Prevents clickjacking, MIME sniffing, XSS

4. **Input Validation** ✅
   - Zod schemas for API routes
   - Example: [create-short-link/route.ts](src/app/api/create-short-link/route.ts)
   - Validates URL format, length limits, UUID format

5. **Audit Logging** ✅
   - Utility: [src/lib/audit.ts](src/lib/audit.ts)
   - Logs security events (auth, data access, failures)
   - Integrated in short link API

6. **Cryptographic Security** ✅
   - Replaced `Math.random()` with `crypto.randomBytes()`
   - Short IDs generated with cryptographically secure random

7. **Dependency Vulnerabilities** ✅
   - Updated Next.js, brace-expansion, @eslint/plugin-kit
   - All known vulnerabilities fixed (`npm audit` clean)

### 📋 Next Steps

1. **Run Migration in Production** (P0 - CRITICAL)
   ```bash
   # Apply the new RLS migration
   # Supabase Dashboard → Database → Migrations → Run migration
   ```

2. **Test RLS Policies** (P1 - High Priority)
   - Create test users in different accounts
   - Verify users cannot access each other's data
   - Test all CRUD operations

3. **Deploy to Production** (P1)
   - Push changes to main branch
   - Verify deployment succeeds
   - Test security headers in production
   - Monitor rate limit headers in browser DevTools

4. **Set Up Monitoring** (P2 - Recommended)
   - Configure Sentry for error tracking
   - Set up alerts for rate limit violations
   - Monitor audit logs for suspicious activity

5. **External Security Audit** (P3 - Optional)
   - Consider third-party penetration testing
   - Review by security consultant
   - Automated security scanning (Snyk, etc.)

---

## References

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables#security)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
