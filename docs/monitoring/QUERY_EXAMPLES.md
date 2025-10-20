# Query Examples

Practical SQL and analytics queries for Punktual.co security monitoring.

## Table of Contents

1. [CSRF Protection Queries](#csrf-protection-queries)
2. [Rate Limiting Queries](#rate-limiting-queries)
3. [GDPR Operations Queries](#gdpr-operations-queries)
4. [Security Incident Queries](#security-incident-queries)
5. [Performance Analysis Queries](#performance-analysis-queries)
6. [User Activity Queries](#user-activity-queries)
7. [Compliance Reporting Queries](#compliance-reporting-queries)

---

## CSRF Protection Queries

### Query 1: CSRF Failures in Last 24 Hours

**Purpose**: Get count of CSRF validation failures

```sql
SELECT COUNT(*) as total_failures
FROM audit_logs
WHERE type = 'CSRF_VALIDATION_FAILED'
  AND created_at > NOW() - INTERVAL '24 hours';
```

**Expected Result**: 0-50 failures (mostly legitimate token expiration)

---

### Query 2: CSRF Failures by Hour

**Purpose**: Identify patterns in CSRF failures

```sql
SELECT
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as failure_count,
  COUNT(DISTINCT ip_address) as unique_ips,
  COUNT(DISTINCT user_id) as unique_users
FROM audit_logs
WHERE type = 'CSRF_VALIDATION_FAILED'
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;
```

**Use Case**: Detect attack patterns (spike in failures)

---

### Query 3: CSRF Success Rate

**Purpose**: Calculate overall CSRF validation success rate

```sql
SELECT
  COUNT(*) FILTER (WHERE success = true) as successful,
  COUNT(*) FILTER (WHERE success = false) as failed,
  COUNT(*) FILTER (WHERE success = true) * 100.0 / COUNT(*) as success_rate_percentage
FROM audit_logs
WHERE type LIKE 'CSRF%'
  AND created_at > NOW() - INTERVAL '24 hours';
```

**Target**: > 95% success rate

---

### Query 4: Top IPs with CSRF Failures

**Purpose**: Identify potential attackers

```sql
SELECT
  ip_address,
  COUNT(*) as failure_count,
  MAX(created_at) as last_failure,
  ARRAY_AGG(DISTINCT error_message) as error_types
FROM audit_logs
WHERE type = 'CSRF_VALIDATION_FAILED'
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY ip_address
HAVING COUNT(*) > 10
ORDER BY failure_count DESC
LIMIT 20;
```

**Action**: Block IPs with > 100 failures

---

### Query 5: CSRF Failures by Route

**Purpose**: Identify which endpoints have most CSRF issues

```sql
SELECT
  resource as endpoint,
  COUNT(*) as failure_count,
  COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as percentage
FROM audit_logs
WHERE type = 'CSRF_VALIDATION_FAILED'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY endpoint
ORDER BY failure_count DESC;
```

**Use Case**: Debug endpoint-specific CSRF issues

---

### Query 6: CSRF Error Message Distribution

**Purpose**: Categorize failure reasons

```sql
SELECT
  error_message,
  COUNT(*) as occurrence_count,
  COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as percentage
FROM audit_logs
WHERE type = 'CSRF_VALIDATION_FAILED'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY error_message
ORDER BY occurrence_count DESC;
```

**Expected Distribution**:
- "CSRF token expired": 60-80%
- "CSRF token missing": 15-30%
- "CSRF token invalid": 5-10%

---

## Rate Limiting Queries

### Query 7: Rate Limit Hits Last Hour

**Purpose**: Real-time rate limiting monitoring

```sql
SELECT
  DATE_TRUNC('minute', created_at) as minute,
  COUNT(*) as hit_count
FROM audit_logs
WHERE type = 'RATE_LIMIT_EXCEEDED'
  AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY minute
ORDER BY minute DESC;
```

---

### Query 8: Top Rate Limited IPs

**Purpose**: Identify abusive IPs

```sql
SELECT
  ip_address,
  COUNT(*) as total_hits,
  MIN(created_at) as first_hit,
  MAX(created_at) as last_hit,
  (MAX(created_at) - MIN(created_at)) as duration,
  COUNT(*) / EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) * 3600 as hits_per_hour
FROM audit_logs
WHERE type = 'RATE_LIMIT_EXCEEDED'
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY ip_address
HAVING COUNT(*) > 50
ORDER BY total_hits DESC
LIMIT 50;
```

**Action**: Investigate IPs with > 1000 hits/hour

---

### Query 9: Rate Limited Users

**Purpose**: Identify users hitting rate limits (possible bot accounts)

```sql
SELECT
  user_id,
  up.email,
  COUNT(*) as rate_limit_hits,
  MAX(al.created_at) as last_hit
FROM audit_logs al
LEFT JOIN user_profiles up ON al.user_id = up.user_id
WHERE al.type = 'RATE_LIMIT_EXCEEDED'
  AND al.user_id IS NOT NULL
  AND al.created_at > NOW() - INTERVAL '24 hours'
GROUP BY user_id, up.email
HAVING COUNT(*) > 100
ORDER BY rate_limit_hits DESC;
```

---

### Query 10: Rate Limit Hit Rate Trend

**Purpose**: Track rate limiting effectiveness over time

```sql
WITH total_requests AS (
  SELECT
    DATE_TRUNC('day', created_at) as day,
    COUNT(*) as total
  FROM audit_logs
  WHERE resource LIKE '/api/%'
    AND created_at > NOW() - INTERVAL '30 days'
  GROUP BY day
),
rate_limited AS (
  SELECT
    DATE_TRUNC('day', created_at) as day,
    COUNT(*) as blocked
  FROM audit_logs
  WHERE type = 'RATE_LIMIT_EXCEEDED'
    AND created_at > NOW() - INTERVAL '30 days'
  GROUP BY day
)
SELECT
  tr.day,
  tr.total as total_requests,
  COALESCE(rl.blocked, 0) as rate_limited_requests,
  COALESCE(rl.blocked, 0) * 100.0 / tr.total as block_rate_percentage
FROM total_requests tr
LEFT JOIN rate_limited rl ON tr.day = rl.day
ORDER BY tr.day DESC;
```

**Target**: < 2% block rate

---

### Query 11: Rate Limiting by Endpoint

**Purpose**: Understand which endpoints are rate limited most

```sql
SELECT
  resource as endpoint,
  COUNT(*) as hit_count,
  COUNT(DISTINCT ip_address) as unique_ips,
  COUNT(DISTINCT user_id) as unique_users
FROM audit_logs
WHERE type = 'RATE_LIMIT_EXCEEDED'
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY endpoint
ORDER BY hit_count DESC;
```

---

## GDPR Operations Queries

### Query 12: GDPR Export Requests This Month

**Purpose**: Track data export volume for compliance

```sql
SELECT
  DATE_TRUNC('day', created_at) as day,
  COUNT(*) as export_count,
  COUNT(*) FILTER (WHERE success = true) as successful,
  COUNT(*) FILTER (WHERE success = false) as failed,
  AVG(EXTRACT(EPOCH FROM (metadata->>'completed_at')::timestamp - created_at)) as avg_duration_seconds
FROM audit_logs
WHERE type = 'DATA_EXPORT'
  AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY day
ORDER BY day DESC;
```

---

### Query 13: GDPR Deletion Requests (All Time)

**Purpose**: Comprehensive deletion audit trail

```sql
SELECT
  created_at,
  user_id,
  ip_address,
  success,
  error_message,
  metadata->>'reason' as deletion_reason,
  metadata->>'deletedAt' as deleted_timestamp
FROM audit_logs
WHERE type = 'DATA_DELETION'
ORDER BY created_at DESC;
```

**Legal Requirement**: Retain for 7 years

---

### Query 14: Failed GDPR Operations

**Purpose**: Identify operations requiring manual intervention

```sql
SELECT
  type,
  user_id,
  created_at,
  error_message,
  metadata
FROM audit_logs
WHERE type IN ('DATA_EXPORT', 'DATA_DELETION')
  AND success = false
ORDER BY created_at DESC;
```

**SLA**: Must resolve within 24 hours

---

### Query 15: GDPR Export Size Distribution

**Purpose**: Capacity planning and performance optimization

```sql
SELECT
  CASE
    WHEN (metadata->>'events_exported')::int < 10 THEN 'Small (< 10 events)'
    WHEN (metadata->>'events_exported')::int < 100 THEN 'Medium (10-100)'
    WHEN (metadata->>'events_exported')::int < 1000 THEN 'Large (100-1000)'
    ELSE 'Very Large (> 1000)'
  END as size_category,
  COUNT(*) as export_count,
  AVG((metadata->>'events_exported')::int) as avg_events,
  AVG((metadata->>'short_links_exported')::int) as avg_short_links
FROM audit_logs
WHERE type = 'DATA_EXPORT'
  AND success = true
  AND created_at > NOW() - INTERVAL '90 days'
GROUP BY size_category
ORDER BY
  CASE size_category
    WHEN 'Small (< 10 events)' THEN 1
    WHEN 'Medium (10-100)' THEN 2
    WHEN 'Large (100-1000)' THEN 3
    ELSE 4
  END;
```

---

## Security Incident Queries

### Query 16: SSRF Attack Attempts

**Purpose**: Track and analyze SSRF blocking

```sql
-- Note: This requires parsing application logs
-- Assuming SSRF attempts are logged with type 'SUSPICIOUS_ACTIVITY'

SELECT
  created_at,
  ip_address,
  user_id,
  metadata->>'blocked_url' as attempted_url,
  metadata->>'block_reason' as reason
FROM audit_logs
WHERE type = 'SUSPICIOUS_ACTIVITY'
  AND metadata->>'attack_type' = 'SSRF'
  AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

**Action**: Block IPs with > 10 attempts

---

### Query 17: Failed Authentication Attempts

**Purpose**: Detect brute force attacks

```sql
SELECT
  ip_address,
  COUNT(*) as failed_attempts,
  COUNT(DISTINCT metadata->>'email') as unique_emails_attempted,
  MIN(created_at) as first_attempt,
  MAX(created_at) as last_attempt
FROM audit_logs
WHERE type = 'AUTH_FAILED'
  AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY ip_address
HAVING COUNT(*) > 10
ORDER BY failed_attempts DESC;
```

**Threshold**: Block IPs with > 20 failures in 1 hour

---

### Query 18: Unauthorized Access Attempts

**Purpose**: Identify attempted unauthorized resource access

```sql
SELECT
  created_at,
  user_id,
  ip_address,
  action,
  resource,
  error_message as denial_reason
FROM audit_logs
WHERE type = 'UNAUTHORIZED_ACCESS'
  AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

---

### Query 19: Suspicious Activity Score by IP

**Purpose**: Composite security threat score

```sql
WITH ip_activity AS (
  SELECT
    ip_address,
    COUNT(*) FILTER (WHERE type = 'CSRF_VALIDATION_FAILED') as csrf_failures,
    COUNT(*) FILTER (WHERE type = 'AUTH_FAILED') as auth_failures,
    COUNT(*) FILTER (WHERE type = 'RATE_LIMIT_EXCEEDED') as rate_limit_hits,
    COUNT(*) FILTER (WHERE type = 'UNAUTHORIZED_ACCESS') as unauth_attempts
  FROM audit_logs
  WHERE created_at > NOW() - INTERVAL '1 hour'
  GROUP BY ip_address
)
SELECT
  ip_address,
  csrf_failures,
  auth_failures,
  rate_limit_hits,
  unauth_attempts,
  (csrf_failures * 2 + auth_failures * 3 + rate_limit_hits * 1 + unauth_attempts * 5) as threat_score
FROM ip_activity
WHERE (csrf_failures * 2 + auth_failures * 3 + rate_limit_hits * 1 + unauth_attempts * 5) > 10
ORDER BY threat_score DESC;
```

**Threshold**: Investigate IPs with threat_score > 20

---

## Performance Analysis Queries

### Query 20: API Response Time by Endpoint

**Purpose**: Identify slow endpoints

```sql
-- Note: Requires instrumentation to log response times
-- Assuming response time is stored in metadata->>'duration_ms'

SELECT
  resource as endpoint,
  COUNT(*) as request_count,
  AVG((metadata->>'duration_ms')::numeric) as avg_ms,
  PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY (metadata->>'duration_ms')::numeric) as p50_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY (metadata->>'duration_ms')::numeric) as p95_ms,
  PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY (metadata->>'duration_ms')::numeric) as p99_ms
FROM audit_logs
WHERE resource LIKE '/api/%'
  AND metadata->>'duration_ms' IS NOT NULL
  AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY endpoint
ORDER BY p99_ms DESC;
```

---

### Query 21: Slow Requests (> 1 second)

**Purpose**: Debug performance issues

```sql
SELECT
  created_at,
  resource as endpoint,
  user_id,
  (metadata->>'duration_ms')::numeric as duration_ms,
  success,
  error_message
FROM audit_logs
WHERE (metadata->>'duration_ms')::numeric > 1000
  AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY (metadata->>'duration_ms')::numeric DESC
LIMIT 100;
```

---

### Query 22: Error Rate by Endpoint

**Purpose**: Track API reliability

```sql
SELECT
  resource as endpoint,
  COUNT(*) as total_requests,
  COUNT(*) FILTER (WHERE success = false) as errors,
  COUNT(*) FILTER (WHERE success = false) * 100.0 / COUNT(*) as error_rate_percentage
FROM audit_logs
WHERE resource LIKE '/api/%'
  AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY endpoint
ORDER BY error_rate_percentage DESC;
```

**Target**: < 1% error rate

---

## User Activity Queries

### Query 23: User Activity Timeline

**Purpose**: Investigate specific user behavior

```sql
SELECT
  created_at,
  type,
  action,
  resource,
  success,
  ip_address,
  error_message
FROM audit_logs
WHERE user_id = 'USER_ID_HERE'
ORDER BY created_at DESC
LIMIT 100;
```

---

### Query 24: Most Active Users

**Purpose**: Identify power users or bots

```sql
SELECT
  user_id,
  up.email,
  COUNT(*) as total_actions,
  COUNT(DISTINCT type) as unique_action_types,
  MIN(al.created_at) as first_action,
  MAX(al.created_at) as last_action
FROM audit_logs al
LEFT JOIN user_profiles up ON al.user_id = up.user_id
WHERE al.created_at > NOW() - INTERVAL '7 days'
  AND al.user_id IS NOT NULL
GROUP BY user_id, up.email
ORDER BY total_actions DESC
LIMIT 50;
```

---

### Query 25: New User Signups

**Purpose**: Track user growth

```sql
SELECT
  DATE_TRUNC('day', created_at) as day,
  COUNT(*) as signups,
  COUNT(*) FILTER (WHERE metadata->>'method' = 'email') as email_signups,
  COUNT(*) FILTER (WHERE metadata->>'method' = 'google') as google_signups
FROM audit_logs
WHERE type = 'AUTH_SIGNUP'
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY day
ORDER BY day DESC;
```

---

## Compliance Reporting Queries

### Query 26: Monthly Security Summary

**Purpose**: Executive dashboard metrics

```sql
SELECT
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) FILTER (WHERE type = 'AUTH_FAILED') as auth_failures,
  COUNT(*) FILTER (WHERE type = 'CSRF_VALIDATION_FAILED') as csrf_failures,
  COUNT(*) FILTER (WHERE type = 'RATE_LIMIT_EXCEEDED') as rate_limit_hits,
  COUNT(*) FILTER (WHERE type = 'DATA_EXPORT') as gdpr_exports,
  COUNT(*) FILTER (WHERE type = 'DATA_DELETION') as gdpr_deletions,
  COUNT(*) FILTER (WHERE type = 'UNAUTHORIZED_ACCESS') as unauth_attempts
FROM audit_logs
WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '12 months')
GROUP BY month
ORDER BY month DESC;
```

---

### Query 27: GDPR Compliance Audit Report

**Purpose**: Annual compliance documentation

```sql
SELECT
  'GDPR Exports' as metric,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE success = true) as successful,
  COUNT(*) FILTER (WHERE success = false) as failed,
  COUNT(*) FILTER (WHERE success = true) * 100.0 / COUNT(*) as success_rate
FROM audit_logs
WHERE type = 'DATA_EXPORT'
  AND created_at >= DATE_TRUNC('year', CURRENT_DATE)

UNION ALL

SELECT
  'GDPR Deletions' as metric,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE success = true) as successful,
  COUNT(*) FILTER (WHERE success = false) as failed,
  COUNT(*) FILTER (WHERE success = true) * 100.0 / COUNT(*) as success_rate
FROM audit_logs
WHERE type = 'DATA_DELETION'
  AND created_at >= DATE_TRUNC('year', CURRENT_DATE);
```

---

### Query 28: Event Type Distribution

**Purpose**: Understand audit log composition

```sql
SELECT
  type,
  COUNT(*) as event_count,
  COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as percentage,
  COUNT(*) FILTER (WHERE success = false) as failure_count
FROM audit_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY type
ORDER BY event_count DESC;
```

---

## Advanced Queries

### Query 29: Cohort Analysis - User Retention

**Purpose**: Track user engagement over time

```sql
WITH user_cohorts AS (
  SELECT
    user_id,
    DATE_TRUNC('month', MIN(created_at)) as cohort_month
  FROM audit_logs
  WHERE type = 'AUTH_SIGNUP'
  GROUP BY user_id
),
user_activity AS (
  SELECT
    uc.cohort_month,
    DATE_TRUNC('month', al.created_at) as activity_month,
    COUNT(DISTINCT al.user_id) as active_users
  FROM user_cohorts uc
  JOIN audit_logs al ON uc.user_id = al.user_id
  WHERE al.created_at >= uc.cohort_month
  GROUP BY uc.cohort_month, activity_month
)
SELECT
  cohort_month,
  activity_month,
  active_users,
  EXTRACT(MONTH FROM AGE(activity_month, cohort_month)) as months_since_signup
FROM user_activity
ORDER BY cohort_month DESC, activity_month;
```

---

### Query 30: Anomaly Detection - Statistical Outliers

**Purpose**: Detect unusual activity patterns

```sql
WITH hourly_stats AS (
  SELECT
    DATE_TRUNC('hour', created_at) as hour,
    type,
    COUNT(*) as event_count
  FROM audit_logs
  WHERE created_at > NOW() - INTERVAL '7 days'
  GROUP BY hour, type
),
statistics AS (
  SELECT
    type,
    AVG(event_count) as mean,
    STDDEV(event_count) as stddev
  FROM hourly_stats
  GROUP BY type
)
SELECT
  hs.hour,
  hs.type,
  hs.event_count,
  s.mean,
  s.stddev,
  (hs.event_count - s.mean) / NULLIF(s.stddev, 0) as z_score
FROM hourly_stats hs
JOIN statistics s ON hs.type = s.type
WHERE ABS((hs.event_count - s.mean) / NULLIF(s.stddev, 0)) > 3 -- 3 standard deviations
ORDER BY ABS((hs.event_count - s.mean) / NULLIF(s.stddev, 0)) DESC;
```

**Use Case**: Auto-detect anomalies (z-score > 3 = unusual)

---

## Grafana LogQL Examples

For Grafana Loki (if using Grafana Cloud):

```logql
# CSRF failures in last hour
sum(rate({job="punktual-api"} |= "CSRF_VALIDATION_FAILED" [1h]))

# Error rate by endpoint
sum(rate({job="punktual-api"} |= "error" [5m])) by (endpoint)

# Top IPs by request count
topk(10, sum(count_over_time({job="punktual-api"}[1h])) by (ip))

# Slow requests (> 1s)
{job="punktual-api"} | json | duration_ms > 1000
```

---

## Materialized Views (Performance Optimization)

For frequently-run queries, create materialized views:

```sql
-- Hourly security metrics summary
CREATE MATERIALIZED VIEW security_metrics_hourly AS
SELECT
  DATE_TRUNC('hour', created_at) as hour,
  type,
  COUNT(*) as event_count,
  COUNT(*) FILTER (WHERE success = false) as failure_count,
  COUNT(DISTINCT ip_address) as unique_ips,
  COUNT(DISTINCT user_id) as unique_users
FROM audit_logs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY hour, type;

-- Refresh daily
REFRESH MATERIALIZED VIEW security_metrics_hourly;

-- Create index for fast querying
CREATE INDEX ON security_metrics_hourly (hour DESC, type);
```

---

## Query Performance Tips

1. **Use indexes**: Ensure `created_at`, `type`, `user_id`, `ip_address` are indexed
2. **Limit time range**: Always use `created_at > NOW() - INTERVAL '...'`
3. **Use EXPLAIN**: Analyze query plans with `EXPLAIN ANALYZE`
4. **Batch large queries**: Use `LIMIT` and `OFFSET` for pagination
5. **Cache results**: Store query results in Redis for dashboards
6. **Use materialized views**: For repeated complex queries

---

## Next Steps

- Copy these queries into Supabase SQL Editor
- Save frequently-used queries for quick access
- Create dashboards using these queries
- Set up automated reports (weekly/monthly)

See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for full setup instructions.
