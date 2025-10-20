# Monitoring Tools Comparison

Comprehensive evaluation of monitoring platforms for Punktual.co security features.

## Quick Recommendation

**For MVP (Month 1-3)**:
- Grafana Cloud Free Tier + Supabase
- Cost: $0/month
- Effort: Low

**For Production (Month 4+)**:
- Grafana Cloud Standard + Sentry + Supabase Pro
- Cost: ~$100/month
- Effort: Medium

---

## Comparison Matrix

| Feature | DataDog | Grafana Cloud | Sentry | Metabase | Supabase |
|---------|---------|---------------|--------|----------|----------|
| **Pricing (Starter)** | $15/host/mo | $0-49/mo | $26/mo | $0 (self) | $0-25/mo |
| **Log Management** | Excellent | Good | Poor | None | Good (SQL) |
| **APM** | Excellent | Good | Excellent | None | None |
| **Alerts** | Excellent | Excellent | Good | Basic | Basic |
| **Dashboards** | Excellent | Excellent | Good | Excellent | Basic |
| **Setup Difficulty** | Medium | Low | Very Low | Medium | Very Low |
| **Vercel Integration** | Native | Via webhook | Native | Manual | Manual |
| **Custom Queries** | Yes (DQL) | Yes (LogQL) | Limited | SQL | SQL |
| **GDPR Compliance** | Yes | Yes | Yes | Self | Yes |
| **Data Retention** | 15 days | 14-30 days | 30-90 days | Unlimited | Unlimited |
| **Real-time** | Yes | Yes | Yes | No | Refresh |
| **Mobile App** | Yes | Yes | Yes | No | No |

---

## 1. DataDog

### Overview
Enterprise-grade monitoring, logging, and APM platform.

### Pros
- **Best-in-class APM**: Automatic instrumentation, distributed tracing
- **Powerful log analytics**: Fast search, complex queries (DQL)
- **Native Vercel integration**: One-click setup
- **Excellent alerting**: PagerDuty, Slack, webhooks
- **Security monitoring**: SIEM features, threat detection
- **Beautiful dashboards**: Out-of-the-box + custom
- **Mature product**: Used by enterprises worldwide

### Cons
- **Expensive**: Starts at $15/host, scales quickly
- **Complex pricing**: Log ingestion, APM, infrastructure all separate
- **Vendor lock-in**: Proprietary query language (DQL)
- **Overkill for small apps**: Too many features for MVP

### Pricing
```
Logs: $0.10/GB ingested + $1.27/million events
APM:  $31/host/month
Infrastructure: $15/host/month

Estimated for Punktual:
Logs (10 GB/month):    $1 + $13 = $14
APM (1 host):          $31
Infrastructure:        $15
Total:                 $60/month
```

### Setup Difficulty
**Medium** (2-4 hours)

1. Install DataDog Next.js integration
2. Configure log forwarding from Vercel
3. Create dashboards (can use templates)
4. Set up alerts

### Best For
- Enterprise applications
- Large engineering teams
- Complex microservices
- Regulatory compliance requirements

### Verdict for Punktual
**Not Recommended for MVP** (too expensive)
**Consider for Series A+** (when >10k MAU)

---

## 2. Grafana Cloud

### Overview
Open-source observability platform with hosted cloud offering.

### Pros
- **Free tier**: 14-day log retention, 10k series
- **Excellent dashboards**: Best visualization in class
- **Loki for logs**: Fast, cost-effective log aggregation
- **Prometheus for metrics**: Industry standard
- **Open source**: No vendor lock-in
- **LogQL**: Powerful query language (like SQL)
- **Alerting**: Built-in with many integrations
- **Community**: Huge ecosystem, pre-built dashboards

### Cons
- **Manual Vercel integration**: Need to set up log drain
- **Learning curve**: LogQL requires practice
- **Limited APM**: Not as comprehensive as DataDog/Sentry
- **Retention costs**: Expensive for long-term storage

### Pricing
```
Free Tier:
- Logs: 50 GB/month
- Metrics: 10k series
- Retention: 14 days
- Users: 3

Standard ($49/month):
- Logs: 100 GB/month
- Retention: 30 days
- Unlimited users

Pro ($299/month):
- Logs: 500 GB/month
- Retention: 90 days
- Advanced analytics
```

### Setup Difficulty
**Low-Medium** (2-3 hours)

1. Create Grafana Cloud account (free)
2. Set up Vercel log drain → Grafana Loki
3. Import pre-built dashboards (security, GDPR, etc.)
4. Configure alert rules

### Example Vercel Log Drain Config
```bash
# Vercel CLI
vercel env add GRAFANA_LOKI_URL
vercel log-drain add https://YOUR_LOKI_URL \
  --type syslog \
  --format json
```

### Best For
- Startups & SMBs
- Cost-conscious teams
- Open-source preference
- Custom dashboards

### Verdict for Punktual
**HIGHLY RECOMMENDED** for MVP and beyond
**Best value**: Free tier sufficient for 6-12 months

---

## 3. Sentry

### Overview
Error tracking and performance monitoring platform.

### Pros
- **Best error tracking**: Stack traces, breadcrumbs, context
- **Native Next.js SDK**: Zero config
- **Performance monitoring**: Transaction traces, LCP, FID
- **Release tracking**: Deploy notifications, regressions
- **Issue management**: Assign, resolve, track trends
- **Source maps**: Original code in production errors
- **Alerts**: Slack, email, PagerDuty
- **Free tier**: 5k errors/month

### Cons
- **Not for logs**: Errors only, not general logging
- **Limited metrics**: Performance > general observability
- **No dashboards**: Issue list only
- **Rate limit errors**: Can be noisy

### Pricing
```
Developer ($26/month):
- 50k errors/month
- 100k transactions/month
- 1 GB attachments

Team ($80/month):
- 500k errors/month
- 1M transactions/month
- Unlimited members
```

### Setup Difficulty
**Very Low** (30 minutes)

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

### Example Usage
```typescript
// Automatic error capturing
import * as Sentry from '@sentry/nextjs';

// Manual security event tracking
Sentry.captureMessage('CSRF validation failed', {
  level: 'warning',
  extra: { userId, ip, route },
});
```

### Best For
- Error tracking (not general monitoring)
- Performance monitoring
- Release management
- Developer workflows

### Verdict for Punktual
**RECOMMENDED as complement** to Grafana
**Use case**: Error tracking + performance, NOT primary logs

---

## 4. Metabase

### Overview
Open-source business intelligence and analytics platform.

### Pros
- **SQL-first**: Perfect for Supabase queries
- **Beautiful visualizations**: Charts, tables, maps
- **Self-hosted**: Free forever
- **Easy queries**: Visual query builder + SQL
- **Dashboards**: Shareable, embeddable
- **Scheduled reports**: PDF, email
- **Multi-database**: Postgres, MySQL, etc.

### Cons
- **Not real-time**: Refresh-based, not streaming
- **No alerting**: Manual checks required
- **No log management**: Only database queries
- **Self-hosting overhead**: Server maintenance
- **Not for APM**: Analytics only

### Pricing
```
Self-Hosted: $0 (AWS/Vercel/Railway costs ~$10/month)
Cloud Starter: $85/month (5 users)
Cloud Pro: $500/month (10 users)
```

### Setup Difficulty
**Medium** (3-4 hours)

1. Deploy Metabase to Railway/Heroku
2. Connect to Supabase database
3. Create audit_logs views
4. Build custom dashboards
5. Schedule daily reports

### Example Metabase SQL
```sql
-- CSRF Failures Last 7 Days
SELECT
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as failures
FROM audit_logs
WHERE type = 'CSRF_VALIDATION_FAILED'
  AND created_at > CURRENT_DATE - 7
GROUP BY date
ORDER BY date;
```

### Best For
- Business analytics
- GDPR compliance reporting
- SQL-savvy teams
- Custom visualizations

### Verdict for Punktual
**RECOMMENDED for compliance team**
**Use case**: Monthly GDPR reports, NOT real-time monitoring

---

## 5. Supabase Dashboard + SQL

### Overview
Built-in Supabase dashboard with SQL editor and basic charts.

### Pros
- **Free**: Included with Supabase
- **Direct database access**: No middleware
- **SQL editor**: Run any query
- **Table views**: Browse audit logs
- **Simple charts**: Basic visualization
- **No setup**: Already available

### Cons
- **Basic UI**: Not as polished as dedicated tools
- **Limited charts**: Bar, line, pie only
- **No alerting**: Manual checks
- **No real-time**: Refresh-based
- **No APM**: Database-only

### Pricing
```
Free Tier: Included
Pro: Included ($25/month for database)
```

### Setup Difficulty
**Very Low** (1 hour)

1. Create `audit_logs` table (migration)
2. Update `logAuditEvent()` to write to database
3. Create SQL saved queries
4. Pin charts to dashboard

### Example Setup
```sql
-- Create audit table (already shown in MONITORING_ARCHITECTURE.md)
CREATE TABLE audit_logs (...);

-- Save useful queries in Supabase dashboard:
-- 1. "CSRF Failures Last Hour"
-- 2. "Top Rate Limited IPs"
-- 3. "GDPR Exports This Month"
```

### Best For
- Proof of concept
- Small teams
- SQL-savvy developers
- Ad-hoc investigation

### Verdict for Punktual
**RECOMMENDED for MVP**
**Use case**: First 3 months, then augment with Grafana

---

## 6. LogRocket

### Overview
Frontend monitoring with session replay and error tracking.

### Pros
- **Session replay**: Video of user sessions
- **Network inspector**: API calls, timing
- **Console logs**: Client-side errors
- **Redux/Zustand**: State debugging
- **Performance**: Core Web Vitals

### Cons
- **Frontend only**: Not for backend monitoring
- **Expensive**: $99/month for 10k sessions
- **Privacy concerns**: Records user sessions
- **Not for security logs**: User experience focus

### Pricing
```
Team ($99/month): 10k sessions
Pro ($299/month): 50k sessions
```

### Verdict for Punktual
**NOT RECOMMENDED** (backend monitoring priority)

---

## 7. New Relic

### Overview
Enterprise APM and observability platform (similar to DataDog).

### Pros
- Similar to DataDog (APM, logs, infrastructure)
- Free tier: 100 GB/month logs

### Cons
- Complex pricing
- Steep learning curve
- Overkill for Punktual

### Verdict
**NOT RECOMMENDED** (DataDog is better if going enterprise)

---

## 8. Vercel Analytics (Built-in)

### Overview
Vercel's native monitoring for Edge Functions and API routes.

### Pros
- **Free on Pro plan**: Included in $20/month
- **Zero setup**: Automatic
- **Function metrics**: Duration, memory, errors
- **Real User Monitoring**: Actual user experience
- **No code changes**: Native integration

### Cons
- **Limited customization**: Can't query logs
- **No log search**: Basic dashboard only
- **No alerting**: Manual checks
- **Retention**: 7-30 days only

### Pricing
```
Hobby: Limited analytics
Pro ($20/month): Full analytics
Enterprise: Advanced features
```

### Verdict
**USE as baseline** (already have it)
**Complement with Grafana** for logs and alerts

---

## Recommended Stack by Phase

### Phase 1: MVP (Month 1-3)
**Goal**: Prove monitoring value, minimal cost

**Stack**:
- Vercel Analytics (included)
- Supabase Dashboard (free)
- Grafana Cloud Free Tier (free)
- Total: **$0/month** (+ Vercel Pro $20)

**Setup Time**: 4-6 hours

---

### Phase 2: Growth (Month 4-12)
**Goal**: Production-ready monitoring, reasonable cost

**Stack**:
- Vercel Analytics (included)
- Grafana Cloud Standard ($49/month)
- Sentry Team ($80/month)
- Supabase Pro ($25/month)
- Total: **$154/month** (+ Vercel Pro $20)

**Setup Time**: 8-12 hours

---

### Phase 3: Scale (Year 2+)
**Goal**: Enterprise-grade observability

**Stack Option A (DataDog)**:
- DataDog ($200/month)
- Sentry ($80/month)
- Supabase Pro ($25/month)
- Total: **$305/month**

**Stack Option B (Open Source)**:
- Grafana Cloud Pro ($299/month)
- Sentry Team ($80/month)
- Metabase Cloud ($85/month)
- Supabase Pro ($25/month)
- Total: **$489/month**

---

## Decision Matrix

### If you value...

**Cost efficiency** → Grafana Cloud + Supabase
**Ease of use** → DataDog (if budget allows)
**Error tracking** → Sentry (complement to any stack)
**Business analytics** → Metabase
**Frontend monitoring** → LogRocket (not recommended)
**Zero setup** → Vercel Analytics + Supabase

---

## Final Recommendation for Punktual

### Immediate (Week 1)
1. **Implement Supabase audit_logs table** (free, 2 hours)
2. **Set up Grafana Cloud free tier** (free, 2 hours)
3. **Use Vercel Analytics** (already have)

**Cost**: $0/month
**Effort**: 4 hours
**Value**: 70% of monitoring needs

---

### Short-term (Month 2-3)
4. **Add Sentry for error tracking** ($26/month, 1 hour)
5. **Upgrade Grafana to Standard** ($49/month) when free tier limits hit

**Cost**: $75/month
**Effort**: +1 hour
**Value**: 90% of monitoring needs

---

### Long-term (Month 6+)
6. **Add Metabase for compliance reporting** ($85/month or self-host)
7. **Consider DataDog if raising funding** ($200+/month)

**Cost**: $160-285/month
**Effort**: Ongoing
**Value**: 100% of monitoring needs

---

## Integration Guides

### Grafana Cloud Setup

```bash
# 1. Create Grafana Cloud account
https://grafana.com/auth/sign-up/create-user

# 2. Get Loki endpoint
# Dashboard → Loki → "Send data" → Copy endpoint

# 3. Configure Vercel log drain
vercel login
vercel log-drain add https://YOUR_LOKI_URL \
  --type json \
  --project punktual-co

# 4. Import dashboards
# Use pre-built: https://grafana.com/grafana/dashboards/
```

### Sentry Setup

```bash
# 1. Install SDK
npm install --save @sentry/nextjs

# 2. Run wizard
npx @sentry/wizard -i nextjs

# 3. Configure (done automatically)
# sentry.client.config.ts
# sentry.server.config.ts
# sentry.edge.config.ts

# 4. Deploy
vercel --prod
```

### Supabase Audit Logs

```sql
-- See MONITORING_ARCHITECTURE.md for full schema

-- Update audit.ts to write to database
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function logAuditEvent(event: AuditEvent) {
  // Console logging
  console.log(JSON.stringify({ level: 'audit', ...event }));

  // Database logging (optional, add this)
  try {
    const supabase = createServiceRoleClient();
    await supabase.from('audit_logs').insert({
      type: event.type,
      user_id: event.userId,
      action: event.action,
      resource: event.resource,
      ip_address: event.ip,
      user_agent: event.userAgent,
      success: event.success,
      error_message: event.errorMessage,
      metadata: event.metadata,
    });
  } catch (error) {
    // Don't fail main operation if logging fails
    console.error('Failed to write audit log:', error);
  }
}
```

---

## Cost Optimization Tips

1. **Use log sampling**: Only log 10% of successful requests, 100% of failures
2. **Set retention wisely**: 30 days for most, 1 year for GDPR
3. **Use Grafana free tier limits**: 50 GB/month is plenty for MVP
4. **Self-host Metabase**: Railway costs $5/month vs $85 cloud
5. **Vercel log drains**: Stream to multiple services from one source
6. **Supabase Free tier**: 500 MB database = ~1M audit logs

---

## Conclusion

**Winner**: Grafana Cloud + Supabase + Sentry

**Why**:
- Free to start ($0/month)
- Scales to production ($154/month)
- No vendor lock-in (open source)
- All features needed (logs, errors, alerts, dashboards)
- Easy setup (4-6 hours)

**Next Steps**: See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for setup instructions.
