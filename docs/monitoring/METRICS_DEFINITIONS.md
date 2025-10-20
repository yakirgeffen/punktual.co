# Metrics Definitions

Comprehensive catalog of all security and operational metrics for Punktual.co monitoring.

## Metric Naming Convention

Format: `{CATEGORY}_{NAME}_{AGGREGATION}`

Examples:
- `CSRF_VALIDATION_FAILURES_COUNT`
- `RATE_LIMIT_HIT_RATE_PERCENTAGE`
- `API_RESPONSE_TIME_P99`

---

## 1. CSRF Protection Metrics

### 1.1 CSRF Token Generation Rate

**Metric**: `CSRF_TOKEN_GENERATION_RATE`

**Description**: Number of CSRF tokens generated per hour

**Source**: Application logs (`GET /api/csrf-token`)

**Calculation**:
```sql
SELECT
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as tokens_generated
FROM audit_logs
WHERE type = 'CSRF_TOKEN_GENERATED'
GROUP BY hour
ORDER BY hour DESC;
```

**Collection**: Real-time via Vercel logs

**Baseline**: 10-100 tokens/hour (depends on traffic)

**Alert**: If > 1000/hour (possible attack)

**Dashboard**: Security Dashboard - Top right panel

---

### 1.2 CSRF Validation Failures

**Metric**: `CSRF_VALIDATION_FAILURES_COUNT`

**Description**: Number of failed CSRF token validations per hour

**Source**: Application logs (type: `CSRF_VALIDATION_FAILED`)

**Calculation**:
```sql
SELECT
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as failures
FROM audit_logs
WHERE type = 'CSRF_VALIDATION_FAILED'
  AND success = false
GROUP BY hour
ORDER BY hour DESC;
```

**Collection**: Real-time

**Baseline**: 0-5 failures/hour (mostly legitimate token expiration)

**Alert Thresholds**:
- Warning: > 10 failures/hour
- Critical: > 50 failures/hour

**Dashboard**: Security Dashboard - CSRF panel (center-left)

**Related Metrics**:
- `CSRF_VALIDATION_SUCCESS_RATE`
- `CSRF_FAILURES_BY_ROUTE`

---

### 1.3 CSRF Validation Success Rate

**Metric**: `CSRF_VALIDATION_SUCCESS_RATE`

**Description**: Percentage of successful CSRF validations

**Source**: Application logs

**Calculation**:
```sql
SELECT
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) FILTER (WHERE success = true) * 100.0 / COUNT(*) as success_rate
FROM audit_logs
WHERE action LIKE '%csrf%'
GROUP BY hour;
```

**Collection**: Real-time

**Baseline**: > 95% success rate

**Alert**: If < 90% for 1 hour

**Dashboard**: Security Dashboard - CSRF panel (gauge chart)

---

### 1.4 CSRF Failures by Route

**Metric**: `CSRF_FAILURES_BY_ROUTE`

**Description**: Which API routes have the most CSRF failures

**Source**: Application logs (metadata.route field)

**Calculation**:
```sql
SELECT
  resource as route,
  COUNT(*) as failure_count
FROM audit_logs
WHERE type = 'CSRF_VALIDATION_FAILED'
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY route
ORDER BY failure_count DESC
LIMIT 10;
```

**Collection**: Batch (hourly)

**Use Case**: Identify problematic endpoints for debugging

**Dashboard**: Security Dashboard - table view

---

### 1.5 CSRF Token Expiration Rate

**Metric**: `CSRF_TOKEN_EXPIRATION_RATE`

**Description**: Percentage of CSRF failures due to expired tokens

**Source**: Application logs (error_message contains "expired")

**Calculation**:
```sql
SELECT
  COUNT(*) FILTER (WHERE error_message ILIKE '%expired%') * 100.0 / COUNT(*) as expiration_rate
FROM audit_logs
WHERE type = 'CSRF_VALIDATION_FAILED';
```

**Baseline**: 60-80% of failures (legitimate user behavior)

**Alert**: If < 40% (indicates attack pattern)

---

### 1.6 CSRF Geographic Distribution

**Metric**: `CSRF_FAILURES_BY_COUNTRY`

**Description**: Geographic distribution of CSRF validation failures

**Source**: IP geolocation (via Vercel headers or MaxMind GeoIP)

**Calculation**:
```javascript
// Via Vercel Edge Config or log processing
const failuresByCountry = logs
  .filter(log => log.type === 'CSRF_VALIDATION_FAILED')
  .reduce((acc, log) => {
    const country = geolocate(log.ip); // Use Vercel geo headers
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {});
```

**Collection**: Batch processing

**Dashboard**: Heatmap on world map

**Use Case**: Detect geographic attack patterns

---

## 2. Rate Limiting Metrics

### 2.1 Rate Limit Hits per Hour

**Metric**: `RATE_LIMIT_HITS_COUNT`

**Description**: Number of requests blocked by rate limiter

**Source**: Middleware logs + Upstash Analytics

**Calculation**:
```sql
SELECT
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as rate_limit_hits
FROM audit_logs
WHERE type = 'RATE_LIMIT_EXCEEDED'
GROUP BY hour;
```

**Upstash Dashboard**: https://console.upstash.com > Analytics

**Baseline**: 5-20 hits/hour (legitimate users)

**Alert**: > 100 hits/hour (possible DDoS)

---

### 2.2 Rate Limit Hits by IP

**Metric**: `RATE_LIMIT_HITS_BY_IP`

**Description**: Top IP addresses hitting rate limits

**Source**: Middleware logs (ip_address field)

**Calculation**:
```sql
SELECT
  ip_address,
  COUNT(*) as hit_count,
  MAX(created_at) as last_hit
FROM audit_logs
WHERE type = 'RATE_LIMIT_EXCEEDED'
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY ip_address
ORDER BY hit_count DESC
LIMIT 20;
```

**Collection**: Real-time

**Dashboard**: Security Dashboard - table with IP, count, country

**Action**: Auto-block IPs with > 1000 hits/hour

---

### 2.3 Rate Limit Hits by User ID

**Metric**: `RATE_LIMIT_HITS_BY_USER`

**Description**: Authenticated users hitting rate limits

**Source**: Middleware logs (user_id field)

**Calculation**:
```sql
SELECT
  user_id,
  COUNT(*) as hit_count,
  MAX(created_at) as last_hit
FROM audit_logs
WHERE type = 'RATE_LIMIT_EXCEEDED'
  AND user_id IS NOT NULL
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY user_id
ORDER BY hit_count DESC
LIMIT 20;
```

**Action**: Investigate users with > 500 hits/hour (possible abuse)

---

### 2.4 Rate Limit Effectiveness

**Metric**: `RATE_LIMIT_EFFECTIVENESS_RATIO`

**Description**: Ratio of blocked requests to total requests

**Source**: Vercel Analytics + Rate limit logs

**Calculation**:
```sql
WITH rate_limited AS (
  SELECT COUNT(*) as blocked
  FROM audit_logs
  WHERE type = 'RATE_LIMIT_EXCEEDED'
    AND created_at > NOW() - INTERVAL '1 hour'
),
total_requests AS (
  SELECT COUNT(*) as total
  FROM vercel_logs
  WHERE path LIKE '/api/%'
    AND created_at > NOW() - INTERVAL '1 hour'
)
SELECT
  blocked * 100.0 / total as block_rate
FROM rate_limited, total_requests;
```

**Baseline**: < 2% block rate (healthy)

**Alert**: > 10% (under attack or limits too strict)

---

### 2.5 Upstash Redis Latency

**Metric**: `UPSTASH_LATENCY_P99`

**Description**: 99th percentile latency for rate limit checks

**Source**: Middleware timing logs

**Calculation**:
```javascript
// Add timing to middleware.ts
const start = performance.now();
const result = await ipRateLimiter.limit(ip);
const duration = performance.now() - start;

console.log(JSON.stringify({
  level: 'metric',
  metric: 'upstash_latency',
  duration_ms: duration,
  timestamp: new Date().toISOString()
}));
```

**Baseline**: < 50ms (p99)

**Alert**: > 200ms (performance degradation)

---

### 2.6 Successful Requests Within Limit

**Metric**: `RATE_LIMIT_ALLOWED_COUNT`

**Description**: Number of requests allowed by rate limiter (baseline traffic)

**Source**: Middleware logs (X-RateLimit-Remaining header)

**Calculation**: Total API requests - Rate limited requests

**Use Case**: Understand normal traffic patterns

---

### 2.7 IP-based vs User-based Limiting

**Metric**: `RATE_LIMIT_TYPE_DISTRIBUTION`

**Description**: Percentage of rate limiting using IP vs User ID

**Calculation**:
```sql
SELECT
  CASE
    WHEN user_id IS NULL THEN 'IP-based'
    ELSE 'User-based'
  END as limiter_type,
  COUNT(*) as count
FROM audit_logs
WHERE type = 'RATE_LIMIT_EXCEEDED'
GROUP BY limiter_type;
```

**Use Case**: Validate middleware is using correct limiter

---

## 3. GDPR Operations Metrics

### 3.1 Data Export Requests

**Metric**: `GDPR_EXPORT_REQUESTS_COUNT`

**Description**: Number of data export requests per day/week/month

**Source**: Application logs (type: `DATA_EXPORT`)

**Calculation**:
```sql
SELECT
  DATE_TRUNC('day', created_at) as day,
  COUNT(*) as export_count
FROM audit_logs
WHERE type = 'DATA_EXPORT'
GROUP BY day
ORDER BY day DESC;
```

**Baseline**: 0-10 exports/month (depends on user base)

**Dashboard**: GDPR Compliance Dashboard

---

### 3.2 Data Export Success Rate

**Metric**: `GDPR_EXPORT_SUCCESS_RATE`

**Description**: Percentage of successful data exports

**Source**: Application logs

**Calculation**:
```sql
SELECT
  COUNT(*) FILTER (WHERE success = true) * 100.0 / COUNT(*) as success_rate
FROM audit_logs
WHERE type = 'DATA_EXPORT';
```

**Baseline**: > 98% success rate

**Alert**: If < 95% for 24 hours

---

### 3.3 Data Export Failures by Error Type

**Metric**: `GDPR_EXPORT_FAILURE_TYPES`

**Description**: Categorize export failures (auth, database, timeout, etc.)

**Source**: Application logs (error_message field)

**Calculation**:
```sql
SELECT
  error_message,
  COUNT(*) as failure_count
FROM audit_logs
WHERE type = 'DATA_EXPORT'
  AND success = false
GROUP BY error_message
ORDER BY failure_count DESC;
```

**Use Case**: Identify root causes of failures

---

### 3.4 Data Export Size Distribution

**Metric**: `GDPR_EXPORT_SIZE_DISTRIBUTION`

**Description**: Distribution of export file sizes

**Source**: Application logs (metadata.events_exported, metadata.short_links_exported)

**Calculation**:
```sql
SELECT
  CASE
    WHEN (metadata->>'events_exported')::int < 10 THEN 'Small (< 10)'
    WHEN (metadata->>'events_exported')::int < 100 THEN 'Medium (10-100)'
    ELSE 'Large (> 100)'
  END as size_category,
  COUNT(*) as count
FROM audit_logs
WHERE type = 'DATA_EXPORT'
  AND success = true
GROUP BY size_category;
```

**Use Case**: Capacity planning, performance optimization

---

### 3.5 Data Deletion Requests

**Metric**: `GDPR_DELETION_REQUESTS_COUNT`

**Description**: Number of data deletion requests

**Source**: Application logs (type: `DATA_DELETION`)

**Calculation**:
```sql
SELECT
  DATE_TRUNC('day', created_at) as day,
  COUNT(*) as deletion_count
FROM audit_logs
WHERE type = 'DATA_DELETION'
GROUP BY day;
```

**Alert**: > 10 deletions/day (unusual spike, investigate)

---

### 3.6 Data Deletion Success Rate

**Metric**: `GDPR_DELETION_SUCCESS_RATE`

**Description**: Percentage of successful deletions (CRITICAL METRIC)

**Calculation**:
```sql
SELECT
  COUNT(*) FILTER (WHERE success = true) * 100.0 / COUNT(*) as success_rate
FROM audit_logs
WHERE type = 'DATA_DELETION';
```

**Baseline**: 100% success rate required

**Alert**: ANY failure is CRITICAL (legal compliance)

---

### 3.7 Data Deletion Completion Time

**Metric**: `GDPR_DELETION_DURATION_P95`

**Description**: 95th percentile time to complete deletion

**Source**: Application logs (timestamp diff)

**Baseline**: < 5 seconds (p95)

**Alert**: > 30 seconds (performance issue)

---

### 3.8 GDPR Audit Trail Integrity

**Metric**: `GDPR_AUDIT_COMPLETENESS`

**Description**: Verify all GDPR operations are logged

**Calculation**:
```sql
-- Check for gaps in audit trail
SELECT
  user_id,
  COUNT(*) FILTER (WHERE type = 'DATA_EXPORT') as exports,
  COUNT(*) FILTER (WHERE type = 'DATA_DELETION') as deletions
FROM audit_logs
WHERE type IN ('DATA_EXPORT', 'DATA_DELETION')
GROUP BY user_id
HAVING COUNT(*) FILTER (WHERE success = false) > 0;
```

**Alert**: Any failed operation without retry/resolution

---

## 4. Security Incident Tracking

### 4.1 SSRF Attack Attempts

**Metric**: `SSRF_BLOCKED_COUNT`

**Description**: Blocked SSRF attempts in URL validation

**Source**: Application logs (src/app/api/create-short-link/route.ts)

**Calculation**: Count log entries with `[SECURITY] Blocked`

**Pattern Matching**:
```javascript
logs.filter(log =>
  log.message?.includes('[SECURITY] Blocked') &&
  (log.message.includes('localhost') ||
   log.message.includes('private IP') ||
   log.message.includes('metadata endpoint'))
);
```

**Alert**: > 10 attempts from same IP → Auto-block

---

### 4.2 Failed Authentication Attempts

**Metric**: `AUTH_FAILURE_COUNT`

**Description**: Failed login attempts per hour

**Source**: Application logs (type: `AUTH_FAILED`)

**Calculation**:
```sql
SELECT
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as failures,
  COUNT(DISTINCT ip_address) as unique_ips
FROM audit_logs
WHERE type = 'AUTH_FAILED'
GROUP BY hour;
```

**Alert**: > 100 failures/hour or > 20 from same IP

---

### 4.3 Unauthorized Access Attempts

**Metric**: `UNAUTHORIZED_ACCESS_COUNT`

**Description**: Attempts to access protected resources

**Source**: Application logs (type: `UNAUTHORIZED_ACCESS`)

**Calculation**:
```sql
SELECT
  resource,
  COUNT(*) as attempt_count,
  COUNT(DISTINCT ip_address) as unique_attackers
FROM audit_logs
WHERE type = 'UNAUTHORIZED_ACCESS'
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY resource
ORDER BY attempt_count DESC;
```

---

### 4.4 Suspicious Activity Patterns

**Metric**: `SUSPICIOUS_ACTIVITY_SCORE`

**Description**: Composite score based on multiple signals

**Signals**:
1. Multiple CSRF failures from same IP
2. Rapid authentication attempts
3. SSRF attempts
4. Rate limit violations
5. Unusual access patterns

**Calculation**:
```sql
WITH ip_scores AS (
  SELECT
    ip_address,
    COUNT(*) FILTER (WHERE type = 'CSRF_VALIDATION_FAILED') * 2 as csrf_score,
    COUNT(*) FILTER (WHERE type = 'AUTH_FAILED') * 3 as auth_score,
    COUNT(*) FILTER (WHERE type = 'RATE_LIMIT_EXCEEDED') * 1 as rate_score
  FROM audit_logs
  WHERE created_at > NOW() - INTERVAL '1 hour'
  GROUP BY ip_address
)
SELECT
  ip_address,
  csrf_score + auth_score + rate_score as total_score
FROM ip_scores
WHERE (csrf_score + auth_score + rate_score) > 10
ORDER BY total_score DESC;
```

**Alert**: Score > 20 → Investigate

---

## 5. API Performance Metrics

### 5.1 /api/csrf-token Response Time

**Metric**: `API_CSRF_TOKEN_LATENCY_P99`

**Description**: 99th percentile response time for CSRF endpoint

**Source**: Vercel Analytics or APM

**Baseline**: < 100ms (p99)

**Alert**: > 500ms (performance degradation)

---

### 5.2 /api/create-short-link Response Time

**Metric**: `API_SHORT_LINK_LATENCY_P99`

**Description**: Response time including CSRF validation + DB write

**Source**: Vercel Analytics

**Baseline**: < 300ms (p99)

**Alert**: > 1000ms

**Breakdown**:
- CSRF validation: ~50ms
- Database write: ~100ms
- Short ID generation: ~10ms

---

### 5.3 /api/user/export-data Response Time

**Metric**: `API_EXPORT_LATENCY_P95`

**Description**: Time to generate data export

**Source**: Application timing logs

**Baseline**: < 2 seconds (p95)

**Alert**: > 10 seconds

---

### 5.4 /api/user/delete-data Response Time

**Metric**: `API_DELETE_LATENCY_P95`

**Description**: Time to delete all user data

**Source**: Application timing logs

**Baseline**: < 5 seconds (p95)

**Alert**: > 30 seconds (cascading deletes may be slow)

---

### 5.5 API Error Rate by Endpoint

**Metric**: `API_ERROR_RATE`

**Description**: Percentage of 5xx errors per endpoint

**Calculation**:
```sql
SELECT
  resource as endpoint,
  COUNT(*) FILTER (WHERE success = false) * 100.0 / COUNT(*) as error_rate
FROM audit_logs
WHERE resource LIKE '/api/%'
GROUP BY endpoint
ORDER BY error_rate DESC;
```

**Baseline**: < 1% error rate

**Alert**: > 5% for any endpoint

---

### 5.6 99th Percentile Response Times

**Metric**: `API_LATENCY_P99_BY_ENDPOINT`

**Source**: Vercel Analytics

**Dashboard**: Performance Dashboard - table view

**Tracked Endpoints**:
- `/api/csrf-token`
- `/api/create-short-link`
- `/api/user/export-data`
- `/api/user/delete-data`

---

### 5.7 Latency Spike Detection

**Metric**: `API_LATENCY_SPIKE_DETECTED`

**Description**: Boolean alert when latency > 2x baseline

**Calculation**:
```javascript
const baseline = calculateP50Last7Days();
const current = getCurrentP50();
const spike = current > (baseline * 2);
```

**Alert**: Immediate notification to on-call engineer

---

## 6. Audit Log Analysis

### 6.1 Events by Type Distribution

**Metric**: `AUDIT_EVENTS_BY_TYPE`

**Description**: Breakdown of audit event types

**Calculation**:
```sql
SELECT
  type,
  COUNT(*) as event_count,
  COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as percentage
FROM audit_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY type
ORDER BY event_count DESC;
```

**Use Case**: Understand application usage patterns

---

### 6.2 User Activity Timeline

**Metric**: `USER_ACTIVITY_TIMELINE`

**Description**: Chronological view of all actions by a user

**Calculation**:
```sql
SELECT
  created_at,
  type,
  action,
  resource,
  success
FROM audit_logs
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT 100;
```

**Use Case**: Investigate specific user behavior

---

### 6.3 Failed Operations Investigation

**Metric**: `FAILED_OPERATIONS_SUMMARY`

**Description**: All failed operations in last 24 hours

**Calculation**:
```sql
SELECT
  type,
  action,
  error_message,
  COUNT(*) as occurrence_count,
  ARRAY_AGG(DISTINCT user_id) as affected_users
FROM audit_logs
WHERE success = false
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY type, action, error_message
ORDER BY occurrence_count DESC;
```

**Dashboard**: Operations Dashboard - failed operations panel

---

### 6.4 Compliance Audit Report

**Metric**: `COMPLIANCE_AUDIT_SUMMARY`

**Description**: Monthly summary for compliance team

**Calculation**:
```sql
SELECT
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) FILTER (WHERE type = 'DATA_EXPORT') as gdpr_exports,
  COUNT(*) FILTER (WHERE type = 'DATA_DELETION') as gdpr_deletions,
  COUNT(*) FILTER (WHERE type = 'UNAUTHORIZED_ACCESS') as security_incidents,
  COUNT(*) FILTER (WHERE type LIKE 'AUTH_%' AND success = false) as auth_failures
FROM audit_logs
GROUP BY month
ORDER BY month DESC;
```

**Report**: Auto-generated PDF sent to compliance officer

---

## Summary Table

| Category | Metrics Count | Priority | Alert Count |
|----------|--------------|----------|-------------|
| CSRF Protection | 6 | High | 3 |
| Rate Limiting | 7 | High | 4 |
| GDPR Operations | 8 | Critical | 5 |
| Security Incidents | 4 | Critical | 4 |
| API Performance | 7 | Medium | 4 |
| Audit Analysis | 4 | Low | 0 |
| **TOTAL** | **36** | - | **20** |

## Metric Collection Checklist

- [x] All metrics have clear definitions
- [x] All metrics have SQL/code examples
- [x] Baselines defined for anomaly detection
- [x] Alert thresholds specified
- [x] Dashboard placement indicated
- [x] Collection method specified
- [ ] Metrics implemented in code (TODO)
- [ ] Dashboards created (TODO)
- [ ] Alerts configured (TODO)
