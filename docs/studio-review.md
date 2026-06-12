# Punktual — Studio Codebase Review

**Status:** Complete — full diagnostic pass executed against the live codebase
**Date:** 2026-06-12
**Framework:** `geffen-studio/projects/punktual-co/codebase-review-framework.md` (CTO, 2026-06-12)
**Method:** Static review of every core module, full dependency install, production build (passed), `npm audit`, live-site fetch of punktual.co (2026-06-12). Findings marked **[verify]** need a hands-on browser/calendar check before being treated as confirmed; everything else is read directly from code.
**Scope:** Diagnostic only. This review names what is built, broken, and missing. It does not prescribe implementations — sequencing belongs to the product re-charter.

---

## 0. Consolidated Verdict

**Punktual is live but not launchable as a paid product today — and it is closer to shippable than its bug list suggests.**

Ground truth established this review:

1. **punktual.co is deployed and serving** (verified by live fetch 2026-06-12): marketing site, free tier ("5 calendar buttons per month"), Pro tier honestly marked "Coming soon!", working `/create` funnel with no login required.
2. **The production build compiles clean** — all 22 routes generate, no type errors, middleware builds.
3. **Security posture is unusually good for an unshipped side project**: RLS on all three tables, CSRF double-submit on state-changing APIs, authenticated GDPR export/delete endpoints, SSRF guards on short-link creation, Upstash rate limiting, no secrets committed (scanned), service-role key confined to server routes.
4. **But the core value proposition — "calendar buttons that work everywhere" — does not currently survive contact with the code.** Times land wrong for non-UTC users on Outlook/Office 365. The customized button users design in the UI is unreachable from any output tab. The Embed tab generates buttons with no links in them. Every short link the system creates 404s. Recurrence is a UI illusion. The single critical dependency vulnerability is in Next.js itself (RCE advisory).

The defects cluster into two classes: **a broken date/time/ICS engine** (one rebuild fixes Google/Apple/Outlook/Yahoo correctness simultaneously, and is the same serializer the webcal-feed Pro tier needs) and **wiring gaps between working modules** (each a small, localized fix). There is no architectural rot. Estimated distance to a correct free-tier product: **one focused engineering wave** (P0 list, §6). The webcal-feed Pro tier is **feasible — GO with one named blocker** (§5).

---

## 1. Architecture and Stack Map

### What this product actually is

The framework anticipated a hosted third-party widget (CDN loader script on customer pages). The codebase is something different and simpler: **a code generator**. Users design a button in a Next.js dashboard; Punktual outputs self-contained HTML/CSS/JS which the user copy-pastes into their own site. **No Punktual-hosted script runs on any customer page.** This has large consequences for security (§4) and versioning (§2).

### Stack summary

| Layer | Choice | State |
|---|---|---|
| Framework | Next.js 15 (App Router) + React 19, TypeScript (`strict: false`) | Builds clean |
| UI | Tailwind CSS + HeroUI, framer-motion | Working |
| Database | Supabase Postgres — `events`, `user_profiles`, `short_links` | RLS enabled on all three |
| Auth | Supabase Auth (email/password + Google OAuth) | Working per docs; fragile (see below) |
| Rate limiting | Upstash Redis sliding window on `/api/*` (60/min IP, 100/min user), fail-open | Built; user-path mostly dormant |
| Analytics | GA4 `G-MQD8GRBC4V`, loaded only after cookie consent; GTM loader fully commented out | Partially wired (§3) |
| Blog | **Strapi CMS dependency** (`STRAPI_URL`, defaults `http://localhost:1337`) | Build degrades gracefully to empty blog when unreachable |
| Hosting | Vercel (confirmed serving punktual.co in production) | Live |
| Billing | — | **Does not exist** (no Stripe/Paddle/anything) |
| Tests / CI quality gates | — | **None.** Only Claude review/responder workflows (OAuth-token auth — Max-subscription compatible, no API key). ESLint ignored during builds. |

### Auth fragility — the one structural weakness

Three Supabase client libraries coexist: deprecated `@supabase/auth-helpers-nextjs` (used by `useAuth`, `useSaveEvent`, `useCheckEventQuota`), `@supabase/ssr` (`lib/supabase/client.ts`), and raw `@supabase/supabase-js` (server). Each manages sessions differently. Server-side `requireAuth` first looks for an `sb-access-token` cookie **that nothing in the app ever sets** — auth on API routes works only via the Bearer-header fallback, which only the logged-in save flow supplies. The repo's own history (`AUTH_FIX_SUMMARY.md`, "restored authentication to working state after issues") is the predictable output of this fragmentation. Consolidating on `@supabase/ssr` is the structural fix.

### Dependency risk table

`npm audit`: **14 vulnerabilities — 1 critical, 4 high, 9 moderate.** Fixes available via `npm audit fix` / version bumps.

| Package | Severity | Issue | Exposure |
|---|---|---|---|
| `next` (15.3.x) | **Critical** | RCE in React flight protocol (GHSA-9qr9-h5gf-34mp) + Server Actions source exposure + DoS advisories | Direct, production-facing. **Upgrade is a ship gate.** |
| `flatted`, `glob`, `minimatch`, `picomatch` | High | ReDoS / prototype pollution / injection | Transitive, mostly build-time tooling |
| `qs`, `ws`, `yaml`, others | Moderate | DoS classes | Transitive |
| `@supabase/auth-helpers-nextjs` | — | **Deprecated upstream** | Direct; migration to `@supabase/ssr` already half-done |

### Environment variable inventory

Required in production: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `NEXT_PUBLIC_BASE_URL`. Optional/inconsistent: `NEXT_PUBLIC_GA_MEASUREMENT_ID` (the live GA ID is also **hardcoded** as `G-MQD8GRBC4V` in `CookieConsent.tsx` — two sources of truth), `STRAPI_URL`/`STRAPI_API_TOKEN` (blog). No `.env` files committed; example JWTs in docs are truncated placeholders, not leaks.

### Repo hygiene

~20 root-level status/fix markdown files (`AUTH_FIX_SUMMARY.md`, `FINAL_FIX.md`, …), eight AI-agent YAML configs, an empty `project_structure.txt`. Dead code: `GtmHead.tsx` (fully commented out), `RouteTracker.tsx` (imported nowhere), `src/utils/timeUtils.ts` and `src/utils/timezoneUtils.ts` (**imported nowhere** — the app collects a timezone and then never uses these), `generateCompleteEmbedScript`'s `baseUrl` param. The in-repo `CLAUDE.md` references a `DynamicPreview.tsx` that does not exist. None of this blocks shipping; all of it misleads future contributors.

---

## 2. The Embed Snippet and Tag Engine

### Snippet model and its consequences

The output is **frozen inline code**: HTML + inline styles + an inline `<script>`, fully self-contained, zero external requests. Three consequences:

- **No versioning problem in the classic sense** — pasted code never changes when Punktual deploys. The World Cup 2026 calendar cannot be broken by anything in this repo (it is a fully independent static site that *brands* Punktual and uses `@punktual.co` UIDs/links — the only obligation is keeping the punktual.co domain and its URLs alive).
- **No update path either** — every bug shipped in generated code lives on customer pages until the customer re-pastes. With the current defect list, that makes shipping the generator before fixing it actively costly.
- **No performance concern** — the snippet is a few KB, no phone-home, no render blocking. (The `/create` builder page itself is 377 KB first-load — heavy but internal.)

### Two parallel generators, both wired wrong

There are **two** independent embed generators with divergent markup: `calendarGenerator.ts` (`generateButtonCode` — the styled, dropdown "punktual-button" widget matching the customization UI) and `embedCodeGenerator.ts` (`generateInlineEmbedCode` — a second, simpler implementation). The UI wiring defeats both:

| # | Defect | Location | Effect |
|---|---|---|---|
| W1 | Output tabs are `links` / `embed` / `page`; default `'links'`. `generateCalendarCode('links')` returns the **plain `<ul>` text-link list**, and no tab ever passes `'button'` | `EventContext.tsx:94,146`; `OutputOptions.tsx:73` | **The styled button generator is unreachable.** Users customize a button (color, size, shape, layout) and the "HTML/CSS — Complete HTML Code… includes all styling" tab hands them an unstyled link list. The customization UI writes state nothing consumes. |
| W2 | Embed tab calls `generateInlineEmbedCode(eventData, buttonData, {}, …)` — **empty links object** | `OutputOptions.tsx:30` | Every `<a>` is filtered out (`url ? … : ''`). **The Embed output contains a button and no calendar links.** |
| W3 | Dashboard embed view calls `generateInlineEmbedCode(event, {}, {}, …)` — empty buttonData **and** links | `Dashboard/EventCard.tsx:356,364` | `selectedPlatforms` empty → output is literally `<!-- No calendar platforms selected -->`. |
| W4 | API returns short URLs as `punktual.co/eventid=ID`; the redirect route is the path `/eventid/[shortId]` | `api/create-short-link/route.ts:248` vs `app/eventid/[shortId]/route.ts` | **Every short link ever generated 404s.** (`shortLinks.ts` `isShortLink`/`extractShortId` are built around the same wrong format.) |
| W5 | `useSaveEvent` creates short links in a background promise and **discards the results** (logs only); returns the original long URLs | `useSaveEvent.ts:173–197` | Short links are written to the DB but never shown to the user; the UI then redirects to the dashboard, which never queries them either. |
| W6 | Unauthenticated "demo mode" calls the short-link API without auth; the API requires auth → silent per-platform fallback to long URLs, then a success toast: "Short links created! 🎉" | `FormTabWrapper.tsx:56–77` | False success state; the comment "works without user auth for demo" is wrong. |

### Provider coverage matrix

| Provider | Verdict | Detail |
|---|---|---|
| Google Calendar | **Built but time-broken** | Correct render URL, but emits **floating local times** with no `ctz` and no UTC `Z` — and the user-selected `timezone` field is **ignored everywhere** (the timezone utils are dead code). The event lands at the wall-clock time *in whatever timezone each viewer's calendar is set to*. Wrong for any cross-timezone audience. All-day events: end date is not exclusive (+1 day), so multi-/single-day handling is suspect **[verify]**. |
| Apple Calendar (.ics) | **Built but broken** | Served as a `data:text/calendar` URI in an `<a target="_blank">`. Modern Chrome blocks top-frame navigation to `data:` URLs — expected dead click **[verify in browser]**. The ICS itself: no escaping of `,` `;` `\n` in SUMMARY/DESCRIPTION/LOCATION (any comma in a title produces invalid ICS), no TZID/VTIMEZONE (floating times), no line folding, `UID` from `Date.now()` (collision-prone), all-day events missing `VALUE=DATE`. **RFC 5545 non-compliant for non-trivial input.** Also rejected by the short-link pipeline (http/https-only validation), so Apple links silently never shorten. |
| Outlook / Outlook.com | **Built but wrong-time** | `formatOutlookDateTime` takes the local wall time and **appends `.000Z`, claiming it is UTC**. A 10:00 Tel Aviv event lands at 10:00 UTC = 12:00/13:00 local. **This is the exact failure class of the World Cup P0** (times mislabeled as a different zone), now on the customer-facing engine. |
| Office 365 | Same as Outlook | Same UTC-mislabel bug; URL pattern (`outlook.office.com` deeplink) is current-looking **[verify]**. |
| Yahoo | **Built, floating-time** | Same floating-time issue; legacy `v=60` param **[verify format still honored]**. |
| Recurrence (cross-provider) | **Cosmetic** | Full recurrence UI (weekly/monthly/yearly, counts, end dates) exists; **no RRULE is generated for any provider, and recurrence fields are not even persisted** in `useSaveEvent`. The feature is an illusion end to end. |

**The single most important engineering fact in this review:** one canonical, timezone-correct datetime/ICS serializer fixes Google, Apple, Outlook, Office 365, Yahoo, *and* is the engine the webcal-feed Pro tier needs. It is one build, not six.

---

## 3. Tracking, Pixel, and Analytics Layer

This is the direct answer to the tags/snippets/pixels question.

### What runs on customers' pages: almost nothing — and that is the right answer

The generated embed performs **zero Punktual-side tracking**. No phone-home, no pixel, no cookies, no localStorage, no fingerprinting, no third-party SDKs, no global variables (IIFE-scoped). The only tracking behavior: an optional `gtag('event', 'calendar_link_click', …)` **into the host page's own GA** if the host already has `gtag` — i.e., it rides the customer's analytics and consent, never Punktual's. GDPR/consent exposure on customer sites is effectively nil. This is a genuine trust story worth keeping deliberately ("the no-spyware calendar button") rather than accidentally.

Two defects inside that small surface: the `data-platform` attribute the tracking reads is **never set** (every event reports `platform: 'unknown'`), and `eventData.title` is interpolated **unescaped into the inline script string** — an apostrophe breaks the script; `</script>` in a title escapes the script context entirely (§4).

### Punktual's own site analytics

| Item | State |
|---|---|
| GA4 loading | Only after cookie-consent accept (good). Hardcoded `G-MQD8GRBC4V`; env `NEXT_PUBLIC_GA_MEASUREMENT_ID` is a second, divergent source of truth. |
| GTM | Loader fully commented out (`GtmHead.tsx`) — GTM is dead. |
| Custom events (`sign_up`, `calendar_link_click`, `calendar_event_created`) | Pushed via `dataLayer.push({event: …})` — a **GTM-shaped pattern with GTM disabled**. These almost certainly never become GA4 events **[verify in GA4 DebugView]**. Funnel measurement is currently blind exactly where it matters (creation → conversion). |
| UTM capture | `trackTrafficSource` fires via `gtag` event — works only post-consent, and `RouteTracker` (SPA pageview tracking) is imported nowhere. |

### Click analytics as a product feature (the Pro-tier promise)

The pricing page promises "Click analytics & insights." Current substrate: `short_links.click_count`, incremented on redirect (fire-and-forget, read-then-write race — undercounts under concurrency), per-platform granularity available because links are minted per platform. **No UI surfaces any of it** — the dashboard never queries `short_links` and shows no counts. So the paid-tier analytics feature is: fix the short-link pipeline (W4/W5), add an atomic increment, and build one dashboard view. The data design is adequate for a v1; nothing needs inventing.

### Coexistence with customers' marketing stacks

No namespace collisions (no globals), no cookie writes, no interference with host Facebook/TikTok/Google pixels. The optional host-`gtag` call binds click listeners unconditionally but emits only if the host loaded GA itself — acceptable; worth documenting publicly when selling to privacy-conscious customers.

---

## 4. Security of Injected and Generated Code

The trust boundary is unusual and favorable: **Punktual never executes its own code on customer pages** — the *customer* pastes code into their own site. Punktual's obligation is therefore "never hand a customer code that can hurt them." Today it can:

### Risk register

| ID | Severity | Finding | Where |
|---|---|---|---|
| S1 | **Critical** | Next.js version carries an RCE advisory (React flight protocol, GHSA-9qr9-h5gf-34mp) plus Server-Actions source-exposure and DoS advisories. Direct production exposure on punktual.co. | `package.json` (`next ^15.3.2`) |
| S2 | **High** | **Generated-code injection (XSS class).** Event title / custom button text / CTA text are interpolated unescaped into the generated HTML and into the inline `<script>` string. Today the author pastes it into their own site (self-XSS); the moment events become shareable, team-editable, or template-driven (the blog prefill flow already feeds `localStorage` → form), this is stored XSS on customer sites — the single worst incident class for an embed product. Escape all user content at generation time (HTML-entity + JS-string contexts). | `calendarGenerator.ts:343–373,506–516`; `embedCodeGenerator.ts:63,152–172` |
| S3 | **High** (trust, not exploit) | **Wrong-time generation** (Outlook/Office365 UTC mislabel; floating times elsewhere; timezone field ignored). For a calendar product, time correctness *is* the security-equivalent trust surface — same failure class as the World Cup P0. | `calendarGenerator.ts:23–44` |
| S4 | Medium | `increment_event_count` RPC is `SECURITY DEFINER` with **no caller check** — any authenticated user can increment any `user_id`'s count (quota griefing). Quota is enforced client-side only anyway; direct API/SQL callers bypass the 3-event limit entirely. | `20251022_setup_quota_system.sql`; `useCheckEventQuota.ts` |
| S5 | Medium | **Open-redirect surface:** `punktual.co/eventid/<id>` 302s to any authenticated user's arbitrary http(s) URL — a phishing-friendly primitive once links actually resolve (post-W4 fix). SSRF guard exists (localhost/private ranges blocked); destination domain allowlist (calendar providers only) would close it, since legitimate destinations are exactly five hosts + ICS. | `eventid/[shortId]/route.ts` |
| S6 | Medium | punktual.co CSP allows `'unsafe-inline' 'unsafe-eval'` in `script-src` (GTM legacy; GTM is dead). Tighten alongside the GTM decision. | `next.config.ts:54` |
| S7 | Low | Host-page CSP compatibility: the generated embed is inline script + inline styles + `onclick` attributes — **blocked on any strict-CSP customer site**. A limitation to document now; a hosted versioned script + nonce support is the eventual enterprise answer. | generated output |
| S8 | Low | Rate-limit user-path dormant (Bearer-only detection), fail-open by design; `requireAuth`'s cookie branch reads a cookie nothing sets (dead path — token is verified server-side via Supabase when present, so no forgery risk). | `middleware.ts`, `lib/supabase/server.ts` |

### What is already right

RLS policies on `events` / `user_profiles` / `short_links` are present and correctly scoped. CSRF double-submit (hashed httpOnly cookie + header token) on state-changing routes. GDPR export/delete endpoints: authenticated, CSRF-checked, confirmation-token-gated, service-role used appropriately. SSRF validation on submitted URLs. Audit logging to structured stdout (Vercel-captured; no audit table — the `audit_logs` insert is a documented TODO). Crypto-secure short-ID generation. No secrets in the repo or its history (scanned). PII footprint: email + optional full name + IP/user-agent in stdout logs only; no PII collected on customer pages at all.

---

## 5. Ship-Readiness

### Per-area verdict

| Area | State | Gap → effort |
|---|---|---|
| Domain + marketing site | **Built and live** (verified 2026-06-12) | Pricing copy says 5 events/mo, code enforces 3 (`MONTHLY_LIMIT`); navbar links to `/billing` which doesn't exist. Copy/route fixes — trivial. |
| Create flow (event → output) | **Built but broken at the output layer** | W1/W2 wiring + S2 escaping + S3 time engine. One focused wave. |
| Customized button output | **Built but unreachable** (W1) | Wiring — small. |
| Short links | **Built but broken end-to-end** (W4/W5/W6) | URL-format fix is one line + data backfill; surfacing results is a small UI pass. |
| Auth | **Built, works, fragile** | Consolidate to `@supabase/ssr` — medium, schedulable after launch. |
| Dashboard | **Built; embed view broken (W3); no click data** | Small fixes + one analytics view (paid-tier seed). |
| Quota | **Half-built** | Client-side only + S4. Server-side enforcement — small (check in the authed insert path / RPC with caller check). |
| Recurrence | **Cosmetic** (UI without RRULE or persistence) | Decide: wire RRULE into the new serializer (medium) or remove the UI for v1 (trivial). Shipping the illusion is the one option that's wrong. |
| Billing / Pro tier | **Missing entirely** | Stripe (or similar) integration — medium; gate for any paid launch, not for free relaunch. ⚠ Payment-rail choice is a commercial decision (CCO/CFO) — and any paid service adoption routes through spend approval first (studio Principle #21). |
| Blog | **Built, but hostage to Strapi** | Needs a running Strapi instance (env default `localhost:1337`) — paid infra to host. Free alternative: in-repo MDX. Decision flagged per Principle #21; blog degrades gracefully meanwhile, so not a launch gate. |
| User analytics (paid promise) | **Missing UI; substrate half-exists** | Post-shortlink-fix: atomic increment + one dashboard view — small/medium. |
| Tests / CI | **Missing** | At minimum: serializer unit tests (timezone/escaping/RRULE golden files) + build-and-lint CI — small, high leverage given the engine rebuild. |

### The webcal-feed Pro tier — feasibility verdict

**GO — with one named blocker.**

- **Endpoint:** does not exist. No route serves `text/calendar`; nothing generates ICS server-side. (The Apple path builds ICS client-side as a `data:` URI — not reusable as-is.)
- **Data model:** **adequate for v1 single events.** `events` carries title, description, location, start/end date + time, timezone, `is_all_day`, `user_id`, and an auto-generated `share_id` usable as a stable feed key. Missing for full value: recurrence persistence (not stored today) and an explicit feed/collection concept if one feed should aggregate multiple events (a `feeds` table or a per-user feed keyed off `user_id` — small migration either way).
- **The blocker:** the feed inherits whatever ICS serializer exists, and the existing one is RFC-5545-non-compliant with broken timezone semantics (§2). **Build the canonical serializer first** (escaping, folding, TZID/VTIMEZONE or UTC normalization, stable UIDs, DTSTAMP, VALUE=DATE all-day, RRULE) — then the feed endpoint is a small route: query by feed key → serialize → `Content-Type: text/calendar` + cache headers.
- **Load:** trivial. Apple's ~15-min polling at 1,000 subscribers ≈ ~67 req/min — comfortably inside any Vercel tier; add `Cache-Control`/ETag and it rounds to zero.
- **Strategic note:** the market scan (Noa, 2026-06-12) identifies managed publisher webcal feeds as unoccupied territory [HYP — confirmatory search still owed]. The World Cup calendar already proves the studio can produce exactly this artifact; productizing it is an endpoint + a dashboard surface away once the serializer exists.

---

## 6. Priority Register (diagnostic ordering, not an implementation spec)

**P0 — gates for relaunching even the free tier** (defects in the center of the value proposition):

1. Rebuild the datetime/ICS engine: honor the selected timezone; emit UTC (`Z`) for Outlook/Office365; `ctz` or UTC for Google; TZID/VTIMEZONE + escaping + folding + `VALUE=DATE` + stable UIDs for ICS. One canonical serializer shared by links, button code, and (later) the feed. *(Fixes S3 + Apple ICS validity in one build.)*
2. Fix short-link URL format (W4) — generated URL must match the `/eventid/[shortId]` route; reconcile `isShortLink`/`extractShortId`; decide whether existing DB rows need backfill.
3. Fix embed/output wiring (W1, W2, W3) — make the customized button reachable; pass real links to the embed generator; fix the dashboard embed call.
4. Escape user content in all generated HTML/JS (S2).
5. Upgrade Next.js past the RCE advisory; run `npm audit fix` (S1).
6. Surface honest short-link results (W5, W6) — no success toast for links that don't exist.
7. Reconcile pricing copy (5 vs 3) and remove or implement the `/billing` nav link.

**P1 — before any paid launch:** recurrence (wire RRULE + persist, or remove the UI); Apple `.ics` as a served file/endpoint instead of a `data:` URI (doubles as the feed's foundation); server-side quota enforcement + RPC caller check (S4); short-link destination allowlist (S5); click-count atomic increment + dashboard analytics view; auth consolidation to `@supabase/ssr`; serializer unit tests + build CI.

**P2 — hygiene and posture:** Strapi decision (Principle #21 — flag cost; MDX is the free path); CSP tightening + GTM decision (S6, dead `dlPush` events); remove dead code and stale root docs; document the no-tracking embed story as a marketing asset; strict-CSP/hosted-script roadmap item (S7).

---

## 7. Standing Constraints Confirmed

- **World Cup 2026 calendar:** independent static site; zero code-level coupling to this repo. Obligation: keep punktual.co (domain + referenced URLs) alive. Any future change to short-link URL semantics must not orphan URLs already in the wild — there are no known generator customers yet, which makes **now** the cheapest moment these fixes will ever be.
- **No ads until this verdict is acted on** (Yakir directive 2026-06-12): the P0 list is the actionable definition of "acted on."
- **Scrub list:** these findings are studio-internal; no external sharing without explicit clearance.
- **Studio runtime (Principle #27):** the repo's GitHub workflows already authenticate via Claude Code OAuth token — Max-subscription compatible, no API-key dependency. Keep it that way.

---

*Review executed by the studio orchestrator against the CTO framework (Sections 1–5), consolidating the CTO (architecture/embed), Neta (tracking/analytics), CSO-Security (injected-code security), and Elan/Ari (back-end/front-end ship-readiness) lanes. Findings route to the CPO for product re-charter sequencing.*
