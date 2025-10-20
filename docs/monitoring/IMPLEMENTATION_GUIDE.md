# Monitoring Implementation Guide

Step-by-step guide to set up comprehensive security monitoring for Punktual.co.

## Prerequisites

- [ ] Vercel Pro account ($20/month)
- [ ] Supabase project (Free or Pro)
- [ ] Access to punktual.co codebase
- [ ] 4-6 hours for initial setup

## Phase 1: Foundation (Week 1)

### Step 1.1: Create Supabase Audit Table

**Time**: 30 minutes

1. Open Supabase SQL Editor
2. Run the migration:

```sql
-- Create audit_logs table
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

-- Create indexes for performance
CREATE INDEX idx_audit_logs_type ON audit_logs(type);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_success ON audit_logs(success);
CREATE INDEX idx_audit_logs_ip ON audit_logs(ip_address);
CREATE INDEX idx_audit_logs_composite ON audit_logs(type, created_at DESC);

-- Add table comment
COMMENT ON TABLE audit_logs IS 'Security audit trail for all sensitive operations';
```

3. Verify table creation:

```sql
SELECT * FROM audit_logs LIMIT 1;
```

4. Test insert:

```sql
INSERT INTO audit_logs (type, action, success)
VALUES ('TEST', 'test_action', true);

SELECT * FROM audit_logs WHERE type = 'TEST';
DELETE FROM audit_logs WHERE type = 'TEST';
```

---

### Step 1.2: Update Audit Logging to Database

**Time**: 1 hour

1. Open `/Users/yakirgeffen/Desktop/punktual.co/src/lib/audit.ts`

2. Add database logging:

```typescript
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function logAuditEvent(event: AuditEvent): Promise<void> {
  const timestamp = event.timestamp || new Date().toISOString();

  const logEntry = {
    ...event,
    timestamp,
    env: process.env.NODE_ENV,
  };

  // Console logging (always keep this for Vercel logs)
  if (process.env.NODE_ENV === 'development') {
    console.log('[AUDIT]', JSON.stringify(logEntry, null, 2));
  } else {
    console.log(JSON.stringify({ level: 'audit', ...logEntry }));
  }

  // Database logging (NEW)
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
    console.error('[AUDIT] Failed to write to database:', error);
  }
}
```

3. Test the integration:

```bash
npm run dev
```

4. Trigger a test event (e.g., create a short link)

5. Verify in Supabase:

```sql
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;
```

---

### Step 1.3: Set Up Grafana Cloud

**Time**: 1 hour

1. Create account: https://grafana.com/auth/sign-up/create-user
   - Choose "Free Forever" tier
   - 14-day log retention
   - 50 GB logs/month

2. Get Loki endpoint:
   - Navigate to: Connections → Data sources → Loki
   - Copy the URL (e.g., `https://logs-prod-us-central1.grafana.net`)
   - Note the username and password

3. Configure Vercel log drain:

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Add log drain
vercel log-drain add https://YOUR_LOKI_USERNAME:YOUR_LOKI_PASSWORD@logs-prod-us-central1.grafana.net/loki/api/v1/push \
  --type json \
  --project punktual-co
```

4. Verify log ingestion:
   - Go to Grafana → Explore
   - Select Loki data source
   - Run query: `{job="punktual-api"}`
   - Wait 1-2 minutes for first logs

---

### Step 1.4: Import Security Dashboard

**Time**: 45 minutes

1. Download dashboard template:

```bash
curl -o security-dashboard.json https://grafana.com/api/dashboards/XXXXX/revisions/1/download
# Or create custom (see DASHBOARD_LAYOUTS.md)
```

2. Import to Grafana:
   - Dashboards → Import
   - Upload JSON file
   - Select Loki data source
   - Click "Import"

3. Customize panels:
   - Update queries to match your log format
   - Adjust thresholds
   - Add company branding

4. Pin to favorites

---

### Step 1.5: Create Saved Queries in Supabase

**Time**: 30 minutes

1. Open Supabase SQL Editor

2. Save these queries:

**Query 1: CSRF Failures Last Hour**
```sql
SELECT COUNT(*) as failures
FROM audit_logs
WHERE type = 'CSRF_VALIDATION_FAILED'
  AND created_at > NOW() - INTERVAL '1 hour';
```

**Query 2: Top Rate Limited IPs**
```sql
SELECT
  ip_address,
  COUNT(*) as hits
FROM audit_logs
WHERE type = 'RATE_LIMIT_EXCEEDED'
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY ip_address
ORDER BY hits DESC
LIMIT 20;
```

**Query 3: GDPR Operations Today**
```sql
SELECT
  type,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE success = false) as failures
FROM audit_logs
WHERE type IN ('DATA_EXPORT', 'DATA_DELETION')
  AND created_at > CURRENT_DATE
GROUP BY type;
```

3. Pin frequently-used queries

---

## Phase 2: Alerting (Week 2)

### Step 2.1: Configure Slack Integration

**Time**: 30 minutes

1. Create Slack workspace or use existing

2. Create channels:
   - `#engineering` (already exists)
   - `#security-alerts` (new)
   - `#incidents` (new)

3. Add Grafana to Slack:
   - Grafana → Alerting → Contact points
   - Add "Slack" contact point
   - Authorize Grafana app
   - Select `#security-alerts` channel
   - Test notification

---

### Step 2.2: Create Alert Rules

**Time**: 2 hours

Copy alert rules from `ALERT_CONFIGURATION.md` into Grafana:

**Example: CSRF Failure Rate Alert**

1. Go to Alerting → Alert rules → New alert rule

2. Configure:
   - **Rule name**: `CSRF Failure Rate High`
   - **Data source**: Loki
   - **Query**:
     ```logql
     sum(rate({job="punktual-api"} |= "CSRF_VALIDATION_FAILED" [1h]))
     ```
   - **Condition**: `> 10`
   - **For**: `15 minutes`
   - **Labels**:
     - `severity: warning`
     - `team: engineering`
   - **Annotations**:
     - `summary: CSRF validation failure rate is high`
     - `runbook: https://github.com/your-org/punktual.co/blob/main/docs/monitoring/ALERT_CONFIGURATION.md#alert-11-csrf-failure-rate-high`

3. Set notification policy:
   - Send to: `#security-alerts`
   - Resolve timeout: 30 minutes

4. Save and test

5. Repeat for all 14 alerts (see ALERT_CONFIGURATION.md)

---

### Step 2.3: Set Up PagerDuty (Optional)

**Time**: 1 hour (if implementing)

1. Create PagerDuty account (free trial or $21/user/month)

2. Create escalation policy:
   - Level 1: On-call engineer (notify immediately)
   - Level 2: Backup engineer (after 15 min)
   - Level 3: Engineering manager (after 30 min)

3. Integrate with Grafana:
   - Grafana → Alerting → Contact points
   - Add "PagerDuty" contact point
   - Enter integration key
   - Test

4. Configure for CRITICAL alerts only

---

## Phase 3: Compliance Reporting (Week 3)

### Step 3.1: Set Up Metabase (Optional)

**Time**: 2 hours

**Option A: Self-hosted (Free)**

```bash
# Deploy to Railway
git clone https://github.com/metabase/metabase
cd metabase
railway init
railway up

# Or use Docker
docker run -d -p 3000:3000 --name metabase metabase/metabase
```

**Option B: Cloud ($85/month)**

1. Sign up: https://www.metabase.com/start/
2. Choose Starter plan

**Configuration**:

1. Connect to Supabase:
   - Add database
   - PostgreSQL
   - Host: `db.YOUR_PROJECT.supabase.co`
   - Port: `5432`
   - Database: `postgres`
   - Username: `postgres`
   - Password: From Supabase settings

2. Create GDPR Compliance Dashboard:
   - Use queries from QUERY_EXAMPLES.md
   - Add visualizations
   - Schedule weekly email report

---

### Step 3.2: Create Compliance Reports

**Time**: 1 hour

Create these reports in Metabase:

1. **Monthly GDPR Summary**
   - Data exports count
   - Data deletions count
   - Success rates
   - Average response times

2. **Security Incidents Report**
   - CSRF failures
   - Rate limit hits
   - Auth failures
   - SSRF attempts

3. **User Activity Report**
   - New signups
   - Active users
   - Events created
   - Short links generated

4. Schedule emails:
   - Recipients: legal@punktual.co, compliance@punktual.co
   - Frequency: Monthly, first Monday
   - Format: PDF attachment

---

## Phase 4: Advanced Monitoring (Week 4)

### Step 4.1: Add Performance Tracking

**Time**: 1 hour

Update API routes to log performance metrics:

```typescript
// src/app/api/create-short-link/route.ts

export async function POST(request: NextRequest) {
  const startTime = performance.now();

  try {
    // ... existing code ...

    // Log success with timing
    await logAuditEvent({
      type: 'SHORT_LINK_CREATE',
      userId: user.id,
      action: 'CREATE_SHORT_LINK',
      resource: shortId,
      ip: getClientIp(request),
      userAgent: getUserAgent(request),
      success: true,
      metadata: {
        duration_ms: performance.now() - startTime, // ADD THIS
        eventTitle: eventTitle,
      },
    });
  } catch (error) {
    // Log error with timing
    await logAuditEvent({
      type: 'SHORT_LINK_CREATE',
      userId: user?.id,
      action: 'CREATE_SHORT_LINK',
      success: false,
      metadata: {
        duration_ms: performance.now() - startTime, // ADD THIS
      },
      errorMessage: error.message,
    });
  }
}
```

Repeat for all API endpoints:
- `/api/csrf-token`
- `/api/user/export-data`
- `/api/user/delete-data`

---

### Step 4.2: Set Up Error Tracking with Sentry

**Time**: 1 hour

1. Install Sentry:

```bash
npm install --save @sentry/nextjs
npx @sentry/wizard -i nextjs
```

2. Configure (wizard does this automatically):

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of transactions
  beforeSend(event, hint) {
    // Don't send rate limit errors (expected)
    if (event.message?.includes('Rate limit')) {
      return null;
    }
    return event;
  },
});
```

3. Test integration:

```bash
npm run build
npm start
```

4. Trigger an error:

```typescript
// Add to any page temporarily
throw new Error("Test Sentry integration");
```

5. Verify in Sentry dashboard

6. Remove test error

---

### Step 4.3: Create Executive Dashboard

**Time**: 1 hour

1. Create new Grafana dashboard "Executive Summary"

2. Add panels (see DASHBOARD_LAYOUTS.md):
   - Security posture (stat panel)
   - Monthly trends (line chart)
   - GDPR compliance (table)
   - Recent security enhancements (text panel)

3. Set refresh: Daily snapshot (not real-time)

4. Export as PDF:
   - Install Grafana Image Renderer
   - Schedule PDF email to executives

---

## Phase 5: Automation & Optimization (Ongoing)

### Step 5.1: Automate Log Cleanup

**Time**: 30 minutes

Create Supabase cron job:

```sql
-- Install pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Delete old audit logs (except GDPR)
SELECT cron.schedule(
  'cleanup-old-audit-logs',
  '0 2 * * 0', -- Every Sunday at 2 AM
  $$
  DELETE FROM audit_logs
  WHERE created_at < NOW() - INTERVAL '1 year'
    AND type NOT IN ('DATA_EXPORT', 'DATA_DELETION');
  $$
);

-- Delete very old GDPR logs (7 years legal requirement)
SELECT cron.schedule(
  'cleanup-old-gdpr-logs',
  '0 3 1 1 *', -- Every January 1st at 3 AM
  $$
  DELETE FROM audit_logs
  WHERE created_at < NOW() - INTERVAL '7 years'
    AND type IN ('DATA_EXPORT', 'DATA_DELETION');
  $$
);

-- View scheduled jobs
SELECT * FROM cron.job;
```

---

### Step 5.2: Create Backup Script

**Time**: 1 hour

```bash
#!/bin/bash
# scripts/backup-audit-logs.sh

# Load environment
source .env

# Export yesterday's logs
YESTERDAY=$(date -d "yesterday" +%Y-%m-%d)
OUTPUT_FILE="audit_logs_${YESTERDAY}.csv.gz"

psql $DATABASE_URL -c "COPY (
  SELECT * FROM audit_logs
  WHERE created_at >= '$YESTERDAY'::date
  AND created_at < '$YESTERDAY'::date + INTERVAL '1 day'
) TO STDOUT CSV HEADER" | gzip > $OUTPUT_FILE

# Upload to S3 (if configured)
if [ ! -z "$AWS_S3_BUCKET" ]; then
  aws s3 cp $OUTPUT_FILE s3://$AWS_S3_BUCKET/audit-logs/$(date +%Y/%m)/
  echo "Uploaded to S3"
fi

# Keep local copy for 7 days
find . -name "audit_logs_*.csv.gz" -mtime +7 -delete

echo "Backup complete: $OUTPUT_FILE"
```

Schedule with cron:

```bash
# Run daily at 1 AM
crontab -e

0 1 * * * /path/to/scripts/backup-audit-logs.sh >> /var/log/audit-backup.log 2>&1
```

---

### Step 5.3: Optimize Database Performance

**Time**: 30 minutes

1. Analyze query performance:

```sql
-- Find slow queries
SELECT
  query,
  calls,
  total_time,
  mean_time
FROM pg_stat_statements
WHERE query LIKE '%audit_logs%'
ORDER BY total_time DESC
LIMIT 10;
```

2. Add missing indexes:

```sql
-- If you see many queries on specific fields
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
```

3. Vacuum table:

```sql
VACUUM ANALYZE audit_logs;
```

---

## Verification Checklist

After completing all phases, verify:

- [ ] Audit logs are being written to Supabase
- [ ] Vercel logs are streaming to Grafana Loki
- [ ] Security dashboard shows real data
- [ ] All 14 alerts are configured and tested
- [ ] Slack notifications work
- [ ] Saved queries run successfully in Supabase
- [ ] Performance metrics are being collected
- [ ] Sentry is capturing errors
- [ ] GDPR compliance dashboard is accurate
- [ ] Backup script runs successfully
- [ ] Log cleanup cron job is scheduled

---

## Testing

### Test Each Alert

```bash
# Test CSRF alert
for i in {1..15}; do
  curl -X POST https://punktual.co/api/create-short-link \
    -H "Content-Type: application/json" \
    -d '{"originalUrl": "https://example.com"}'
  sleep 1
done
# Wait 15 minutes, alert should fire

# Test rate limit alert
for i in {1..100}; do
  curl https://punktual.co/api/csrf-token
done
# Alert should fire if rate limiting is working

# Test GDPR export (manual)
# Login and visit /api/user/export-data
# Check Supabase for audit log entry
```

---

## Troubleshooting

### Issue: Logs not appearing in Grafana

**Solution**:
1. Check Vercel log drain status: `vercel log-drain ls`
2. Verify Loki credentials are correct
3. Check Grafana Explore for any logs: `{job=~".*"}`
4. Wait 2-3 minutes (delay is normal)

### Issue: Alerts not firing

**Solution**:
1. Check alert rule is enabled
2. Verify query returns data in Explore
3. Check notification policy is correct
4. Test contact point (Slack)
5. Review alert history for errors

### Issue: Supabase audit_logs table growing too fast

**Solution**:
1. Verify cleanup cron job is running
2. Reduce log retention period
3. Consider partitioning table by month
4. Upgrade Supabase plan if needed

### Issue: High Upstash costs

**Solution**:
1. Review rate limit thresholds (may be too aggressive)
2. Check for legitimate traffic being blocked
3. Implement caching to reduce API calls
4. Consider upgrading to Pro tier (better value)

---

## Cost Breakdown

### Month 1 (MVP)

| Service | Plan | Cost |
|---------|------|------|
| Vercel | Pro | $20 |
| Supabase | Free | $0 |
| Grafana Cloud | Free | $0 |
| Upstash Redis | Free | $0 |
| **TOTAL** | | **$20/month** |

### Month 6 (Production)

| Service | Plan | Cost |
|---------|------|------|
| Vercel | Pro | $20 |
| Supabase | Pro | $25 |
| Grafana Cloud | Standard | $49 |
| Sentry | Team | $80 |
| Upstash Redis | Pro | $10 |
| Metabase | Cloud Starter | $85 |
| **TOTAL** | | **$269/month** |

### Cost Optimization Tips

1. Start with free tiers
2. Upgrade only when hitting limits
3. Use Supabase instead of external log storage
4. Self-host Metabase ($5/month Railway vs $85 cloud)
5. Negotiate annual contracts (20% discount)

---

## Maintenance Schedule

### Daily
- [ ] Check dashboard for anomalies
- [ ] Review overnight alerts

### Weekly
- [ ] Review alert firing frequency
- [ ] Check Grafana dashboard health
- [ ] Review slow query log

### Monthly
- [ ] Generate GDPR compliance report
- [ ] Review and adjust alert thresholds
- [ ] Backup audit logs to cold storage
- [ ] Review cost vs budget

### Quarterly
- [ ] Conduct alert fire drill
- [ ] Update runbooks
- [ ] Review retention policies
- [ ] Audit access permissions

---

## Next Steps

1. **Week 1**: Complete Phase 1 (Foundation)
2. **Week 2**: Complete Phase 2 (Alerting)
3. **Week 3**: Complete Phase 3 (Compliance)
4. **Week 4**: Complete Phase 4 (Advanced)
5. **Ongoing**: Phase 5 (Automation)

---

## Support Resources

- **Grafana Docs**: https://grafana.com/docs/
- **Supabase Docs**: https://supabase.com/docs
- **Sentry Docs**: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Upstash Docs**: https://docs.upstash.com/redis
- **Metabase Docs**: https://www.metabase.com/docs/latest/

---

## Team Training

Schedule 1-hour training sessions for:

1. **Engineering team**: How to use dashboards, respond to alerts
2. **Compliance team**: GDPR reporting, audit log access
3. **Support team**: User activity investigation
4. **Management**: Executive dashboard interpretation

---

**Estimated Total Setup Time**: 12-16 hours over 4 weeks

**Maintenance Time**: 2-4 hours/month

Good luck with your monitoring implementation!
