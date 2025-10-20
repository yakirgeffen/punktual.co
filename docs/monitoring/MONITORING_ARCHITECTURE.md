# Monitoring Architecture for Punktual Security Features

## Overview

This document outlines the comprehensive monitoring architecture for tracking security operations, CSRF protection, rate limiting, and GDPR compliance in Punktual.co.

## Architecture Diagram

```
┌─────────────────┐
│  Application    │
│  (Next.js 15)   │
└────────┬────────┘
         │
         ├─ Audit Events (src/lib/audit.ts)
         ├─ CSRF Validation (src/lib/csrf.ts)
         ├─ Rate Limiting (middleware.ts)
         └─ GDPR Operations (src/app/api/user/*)
         │
         ▼
┌─────────────────────────────────────────┐
│         Data Collection Layer           │
├─────────────────────────────────────────┤
│  1. Vercel Logs (stdout/stderr)         │
│  2. Supabase Audit Table (optional)     │
│  3. Upstash Redis Analytics             │
│  4. Application Logger (src/lib/logger) │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│       Aggregation & Processing          │
├─────────────────────────────────────────┤
│  Option A: Vercel + DataDog/Sentry      │
│  Option B: Vercel + Grafana Cloud       │
│  Option C: Supabase + Metabase          │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│      Visualization & Alerting           │
├─────────────────────────────────────────┤
│  - Real-time Dashboards                 │
│  - Alert Management                     │
│  - Compliance Reports                   │
│  - Incident Response                    │
└─────────────────────────────────────────┘
```

## Data Sources

### 1. Application Logs (Primary)

**Location**: Stdout/stderr captured by Vercel
**Format**: Structured JSON logs
**Retention**: 7 days (Vercel free tier), 30-90 days (Pro tier)

All security events are logged via `logAuditEvent()` function:

```typescript
// Example log entry
{
  "level": "audit",
  "type": "CSRF_VALIDATION_FAILED",
  "userId": "uuid-here",
  "action": "create_short_link",
  "resource": "short_id_ABC123",
  "ip": "203.0.113.45",
  "userAgent": "Mozilla/5.0...",
  "success": false,
  "errorMessage": "CSRF token missing",
  "timestamp": "2025-10-19T10:30:00.000Z",
  "env": "production"
}
```

**Event Types**:
- `AUTH_LOGIN`, `AUTH_LOGOUT`, `AUTH_FAILED`, `AUTH_SIGNUP`
- `SHORT_LINK_CREATE`, `SHORT_LINK_ACCESS`
- `EVENT_CREATE`, `EVENT_UPDATE`, `EVENT_DELETE`
- `PROFILE_UPDATE`
- `UNAUTHORIZED_ACCESS`
- `RATE_LIMIT_EXCEEDED`
- `INPUT_VALIDATION_FAILED`
- `SUSPICIOUS_ACTIVITY`
- `DATA_EXPORT`
- `DATA_DELETION`
- `CSRF_VALIDATION_FAILED`

### 2. Upstash Redis Analytics

**Source**: `@upstash/ratelimit` built-in analytics
**Location**: Upstash Console > Analytics tab
**Metrics**:
- Request count per time window
- Rate limit hits per IP/user
- Sliding window analytics
- Geographic distribution (if configured)

**Access**: https://console.upstash.com

### 3. Supabase Database (Optional Enhancement)

**Recommended Table**: `audit_logs`

```sql
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  resource VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast querying
CREATE INDEX idx_audit_logs_type ON audit_logs(type);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_success ON audit_logs(success);
CREATE INDEX idx_audit_logs_ip ON audit_logs(ip_address);

-- Retention policy (delete logs older than 1 year)
CREATE INDEX idx_audit_logs_retention ON audit_logs(created_at)
WHERE created_at < NOW() - INTERVAL '1 year';
```

**Benefits**:
- Long-term retention (1+ years)
- Complex SQL queries for investigation
- GDPR audit trail storage
- No dependency on external services
- Native Supabase Dashboard visualization

### 4. Vercel Analytics

**Built-in Metrics**:
- Function execution count
- Function duration (p50, p95, p99)
- Error rate
- Memory usage
- Cold start frequency

**Access**: Vercel Dashboard > Project > Analytics

## Collection Methods

### Real-Time Collection

1. **Application Logs**: Written to stdout immediately
2. **Vercel Log Drains**: Stream logs to external services in real-time
3. **Upstash Analytics**: Updated on each rate limit check

### Batch Collection

1. **Supabase Exports**: SQL queries via cron jobs
2. **Vercel Log Downloads**: Manual or API-based export

## Storage Locations

| Data Type | Primary Storage | Backup Storage | Retention |
|-----------|----------------|----------------|-----------|
| Audit Logs | Vercel Logs | Supabase DB (optional) | 7-90 days |
| Rate Limit Data | Upstash Redis | DataDog/Grafana | 30 days |
| GDPR Operations | Vercel Logs + Supabase | Archive (S3) | 7 years (legal) |
| Performance Metrics | Vercel Analytics | Monitoring service | 30-90 days |
| Alert History | Monitoring service | Email backups | 1 year |

## Retention Policies

### Compliance Requirements

**GDPR (Article 5)**:
- Personal data: Only as long as necessary
- Audit logs: 6-12 months recommended
- GDPR operation logs: 7 years (proof of compliance)

**Industry Best Practices**:
- Security logs: 90 days minimum
- Authentication logs: 1 year
- Financial transactions: 7 years

### Implementation

**Vercel Tier**:
- Free: 7 days
- Pro: 30 days
- Enterprise: 90+ days

**Supabase**:
```sql
-- Weekly cleanup job (run via pg_cron or external cron)
DELETE FROM audit_logs
WHERE created_at < NOW() - INTERVAL '1 year'
  AND type NOT IN ('DATA_EXPORT', 'DATA_DELETION');

-- GDPR logs: keep for 7 years
DELETE FROM audit_logs
WHERE created_at < NOW() - INTERVAL '7 years'
  AND type IN ('DATA_EXPORT', 'DATA_DELETION');
```

**Upstash Redis**:
- TTL: Automatic expiration (configured in rate limiter)
- Analytics: 30 days default

## Backup Strategy

### Critical Data

**GDPR Audit Trail** (highest priority):
1. Export monthly to S3/archive storage
2. Encrypted at rest
3. Immutable storage (WORM)
4. Regular integrity checks

**Security Incident Logs**:
1. Immediate backup on detection
2. Multiple geographic locations
3. Air-gapped copies for forensics

### Automation

**Daily Backups** (via cron):
```bash
#!/bin/bash
# Export yesterday's audit logs from Supabase
psql $DATABASE_URL -c "COPY (
  SELECT * FROM audit_logs
  WHERE created_at >= CURRENT_DATE - INTERVAL '1 day'
  AND created_at < CURRENT_DATE
) TO STDOUT CSV HEADER" | \
gzip > "audit_logs_$(date -d yesterday +%Y%m%d).csv.gz"

# Upload to S3
aws s3 cp audit_logs_*.csv.gz s3://punktual-audit-logs/$(date +%Y/%m/)/
```

**Monthly Archives**:
- Full database exports
- Vercel log exports (via API)
- Upstash analytics snapshots

## Cost Optimization

### Vercel Logs
- Free: $0 (7 days)
- Pro: $20/month (30 days)
- Enterprise: Custom (90+ days)

**Recommendation**: Start with Pro tier ($20/month)

### Supabase
- Free: $0 (500 MB database)
- Pro: $25/month (8 GB + daily backups)

**Estimate**: ~1 million audit logs = ~500 MB
**Recommendation**: Free tier initially, upgrade if >500k logs/month

### Monitoring Tools (see TOOLS_COMPARISON.md)
- DataDog: ~$50-200/month
- Grafana Cloud: $0-50/month
- Sentry: $26/month
- Metabase: $0 (self-hosted) or $85/month

**Recommendation**: Start with Grafana Cloud free tier + Supabase

### Total Monthly Cost (MVP)

```
Vercel Pro:        $20
Supabase Free:     $0
Grafana Cloud:     $0 (free tier)
Upstash:           $0 (free tier sufficient)
─────────────────────
Total:             $20/month
```

### Total Monthly Cost (Production)

```
Vercel Pro:        $20
Supabase Pro:      $25
Grafana Cloud:     $49 (standard)
Upstash Pro:       $10
Sentry (errors):   $26
─────────────────────
Total:             $130/month
```

## Architecture Decision Records

### ADR-001: Why Structured JSON Logs?

**Decision**: Use JSON format for all audit logs

**Rationale**:
- Easy parsing by log aggregators
- Consistent structure
- Type-safe with TypeScript
- Better than plain text for automation

### ADR-002: Why Vercel Logs as Primary?

**Decision**: Use Vercel's native logging instead of immediate external writes

**Rationale**:
- No performance impact (async)
- Built-in reliability
- Cost-effective
- Easy to stream to multiple destinations

**Alternative Considered**: Direct writes to DataDog/Sentry
**Rejected Because**: Adds latency, single point of failure, vendor lock-in

### ADR-003: Why Optional Supabase Audit Table?

**Decision**: Make Supabase audit logging optional, not mandatory

**Rationale**:
- Vercel logs sufficient for most use cases
- Database writes add latency
- Easier to scale
- Separation of concerns

**When to Enable**:
- Need >90 day retention
- Complex SQL queries needed
- GDPR compliance requires 7-year storage

## Next Steps

1. **Phase 1 (Week 1)**: Set up Vercel log drains → Grafana
2. **Phase 2 (Week 2)**: Create dashboards (see DASHBOARD_LAYOUTS.md)
3. **Phase 3 (Week 3)**: Configure alerts (see ALERT_CONFIGURATION.md)
4. **Phase 4 (Week 4)**: Implement Supabase audit table (optional)
5. **Phase 5 (Month 2)**: Add compliance reporting automation

## References

- [METRICS_DEFINITIONS.md](./METRICS_DEFINITIONS.md) - Detailed metric specifications
- [TOOLS_COMPARISON.md](./TOOLS_COMPARISON.md) - Monitoring tool evaluation
- [DASHBOARD_LAYOUTS.md](./DASHBOARD_LAYOUTS.md) - Dashboard designs
- [ALERT_CONFIGURATION.md](./ALERT_CONFIGURATION.md) - Alert setup guide
- [QUERY_EXAMPLES.md](./QUERY_EXAMPLES.md) - SQL and analytics queries
