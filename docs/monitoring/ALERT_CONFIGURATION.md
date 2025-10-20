# Alert Configuration Guide

Complete alerting setup for Punktual.co security monitoring.

## Alert Philosophy

**Goals**:
1. **Actionable**: Every alert requires immediate response
2. **Minimal noise**: No false positives
3. **Graduated**: Warning → Critical escalation
4. **Routed**: Right alert to right person
5. **Documented**: Runbooks for every alert

---

## Alert Severity Levels

| Level | Description | Response Time | Notification | Examples |
|-------|-------------|---------------|--------------|----------|
| **INFO** | Informational only | No action required | Dashboard only | New user signup |
| **WARNING** | Needs investigation | Within 4 hours | Slack | CSRF failure spike |
| **CRITICAL** | Immediate action | Within 15 minutes | PagerDuty + SMS | GDPR deletion failed |
| **EMERGENCY** | Service down | Immediate | Phone call | All APIs down |

---

## 1. CSRF Protection Alerts

### Alert 1.1: CSRF Failure Rate High

**Metric**: `CSRF_VALIDATION_FAILURES_COUNT`

**Condition**:
```yaml
WARNING:
  - Rate: > 10 failures/hour
  - Duration: > 15 minutes

CRITICAL:
  - Rate: > 50 failures/hour
  - Duration: > 5 minutes
```

**Query** (Grafana):
```promql
sum(rate(audit_logs{type="CSRF_VALIDATION_FAILED"}[1h])) > 10
```

**Query** (SQL):
```sql
SELECT COUNT(*) as failure_count
FROM audit_logs
WHERE type = 'CSRF_VALIDATION_FAILED'
  AND created_at > NOW() - INTERVAL '1 hour'
HAVING COUNT(*) > 10;
```

**Notification**:
- WARNING: Slack #engineering
- CRITICAL: PagerDuty on-call engineer

**Runbook**:
1. Check if failures are from single IP (possible attack)
2. Verify CSRF token generation endpoint is working
3. Check if token expiration time is too short
4. Review recent deployments for bugs
5. If attack: Block offending IPs via Vercel firewall

**False Positive Scenarios**:
- Legitimate users with expired tokens (60-80% of failures)
- Browser extensions interfering
- Mobile app version mismatch

**Auto-Resolution**: Alert clears if rate drops below threshold for 30 minutes

---

### Alert 1.2: CSRF Success Rate Low

**Metric**: `CSRF_VALIDATION_SUCCESS_RATE`

**Condition**:
```yaml
WARNING:
  - Success rate: < 90%
  - Duration: > 1 hour

CRITICAL:
  - Success rate: < 80%
  - Duration: > 30 minutes
```

**Query** (Grafana):
```promql
(
  sum(rate(audit_logs{type="CSRF_VALIDATION_SUCCESS"}[1h])) /
  sum(rate(audit_logs{type=~"CSRF_VALIDATION.*"}[1h]))
) * 100 < 90
```

**Notification**: Slack #engineering

**Runbook**:
1. Check CSRF endpoint `/api/csrf-token` status
2. Verify cookie settings (httpOnly, sameSite)
3. Check if CDN/proxy is stripping headers
4. Review browser compatibility issues

---

### Alert 1.3: CSRF Geographic Anomaly

**Metric**: `CSRF_FAILURES_BY_COUNTRY`

**Condition**:
```yaml
WARNING:
  - Single country: > 50% of all failures
  - Country: Not in top 5 user countries
```

**Query** (SQL):
```sql
WITH country_failures AS (
  SELECT
    country,
    COUNT(*) as failure_count,
    COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as percentage
  FROM audit_logs
  WHERE type = 'CSRF_VALIDATION_FAILED'
    AND created_at > NOW() - INTERVAL '1 hour'
  GROUP BY country
)
SELECT *
FROM country_failures
WHERE percentage > 50
  AND country NOT IN ('US', 'GB', 'CA', 'DE', 'FR');
```

**Notification**: Slack #engineering

**Runbook**:
1. Check if known bot traffic
2. Verify legitimate traffic from that region
3. Consider geo-blocking if attack

---

## 2. Rate Limiting Alerts

### Alert 2.1: Rate Limit Hit Rate High

**Metric**: `RATE_LIMIT_HITS_COUNT`

**Condition**:
```yaml
WARNING:
  - Hits: > 100/hour
  - Duration: > 30 minutes

CRITICAL:
  - Hits: > 500/hour
  - Duration: > 5 minutes
```

**Query** (Grafana):
```promql
sum(rate(audit_logs{type="RATE_LIMIT_EXCEEDED"}[1h])) > 100
```

**Notification**:
- WARNING: Slack #engineering
- CRITICAL: PagerDuty + Slack

**Runbook**:
1. Identify top offending IPs (see dashboard)
2. Check if legitimate user behavior (API integration)
3. Verify rate limits are not too strict
4. If attack: Block IPs via Upstash or Vercel firewall
5. Consider dynamic rate limiting

**Auto-Mitigation**:
```javascript
// Auto-block IPs with >1000 hits/hour
if (hitCount > 1000) {
  await redis.set(`blocked:${ip}`, '1', { ex: 3600 });
}
```

---

### Alert 2.2: Single IP Excessive Rate Limiting

**Metric**: `RATE_LIMIT_HITS_BY_IP`

**Condition**:
```yaml
CRITICAL:
  - Single IP: > 1000 hits/hour
```

**Query** (SQL):
```sql
SELECT
  ip_address,
  COUNT(*) as hit_count
FROM audit_logs
WHERE type = 'RATE_LIMIT_EXCEEDED'
  AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY ip_address
HAVING COUNT(*) > 1000;
```

**Notification**: PagerDuty (immediate)

**Runbook**:
1. Verify IP is not internal/monitoring service
2. Check WHOIS for IP ownership
3. Block IP via Vercel firewall:
   ```bash
   vercel firewall add rule --action deny --value 203.0.113.45
   ```
4. Document incident in security log

---

### Alert 2.3: Upstash Redis Latency High

**Metric**: `UPSTASH_LATENCY_P99`

**Condition**:
```yaml
WARNING:
  - P99: > 200ms
  - Duration: > 5 minutes

CRITICAL:
  - P99: > 1000ms
  - Duration: > 2 minutes
```

**Query**: Custom metric from middleware timing

**Notification**: Slack #engineering

**Runbook**:
1. Check Upstash status page: https://status.upstash.com
2. Verify network connectivity
3. Review Redis instance metrics (memory, CPU)
4. Consider upgrading Upstash plan if consistently high
5. Implement circuit breaker to fail open

---

## 3. GDPR Operations Alerts

### Alert 3.1: GDPR Export Failed

**Metric**: `GDPR_EXPORT_FAILURE`

**Condition**:
```yaml
WARNING:
  - Failures: > 1 in 1 hour

CRITICAL:
  - Failures: > 3 in 24 hours
```

**Query** (SQL):
```sql
SELECT COUNT(*) as failure_count
FROM audit_logs
WHERE type = 'DATA_EXPORT'
  AND success = false
  AND created_at > NOW() - INTERVAL '24 hours'
HAVING COUNT(*) > 3;
```

**Notification**:
- WARNING: Slack #engineering
- CRITICAL: PagerDuty + Email to legal@punktual.co

**Runbook**:
1. Check error message in audit logs
2. Verify database connectivity
3. Test export manually for affected user
4. Check if user has excessive data (>10MB)
5. Fix issue and re-run export
6. Notify user of completion
7. Document in GDPR audit trail

**SLA**: Must resolve within 24 hours (legal requirement)

---

### Alert 3.2: GDPR Deletion Failed

**Metric**: `GDPR_DELETION_FAILURE`

**Condition**:
```yaml
CRITICAL:
  - ANY failure (zero tolerance)
```

**Query** (SQL):
```sql
SELECT *
FROM audit_logs
WHERE type = 'DATA_DELETION'
  AND success = false
ORDER BY created_at DESC
LIMIT 1;
```

**Notification**:
- PagerDuty (immediate)
- Email to legal@punktual.co
- SMS to on-call engineer

**Runbook**:
1. **URGENT**: Investigate immediately
2. Check which tables failed to delete
3. Verify foreign key constraints
4. Re-run deletion manually with service role
5. Verify complete deletion with SQL queries:
   ```sql
   SELECT COUNT(*) FROM events WHERE user_id = $1;
   SELECT COUNT(*) FROM short_links WHERE user_id = $1;
   SELECT COUNT(*) FROM user_profiles WHERE user_id = $1;
   ```
6. Document incident report
7. Update user (legal requirement)

**SLA**: Must resolve within 4 hours (CRITICAL legal issue)

---

### Alert 3.3: GDPR Export Latency High

**Metric**: `GDPR_EXPORT_DURATION_P95`

**Condition**:
```yaml
WARNING:
  - P95: > 5 seconds

CRITICAL:
  - P95: > 30 seconds
```

**Notification**: Slack #engineering

**Runbook**:
1. Check database query performance
2. Review indexes on events/short_links tables
3. Consider pagination for large exports
4. Optimize Supabase queries

---

## 4. Security Incident Alerts

### Alert 4.1: SSRF Attack Detected

**Metric**: `SSRF_BLOCKED_COUNT`

**Condition**:
```yaml
WARNING:
  - Attempts: > 5 from single IP in 1 hour

CRITICAL:
  - Attempts: > 20 from any source in 1 hour
```

**Query**: Parse application logs for `[SECURITY] Blocked`

**Notification**:
- WARNING: Slack #engineering
- CRITICAL: PagerDuty + security@punktual.co

**Runbook**:
1. Identify attacking IP(s)
2. Block IP via firewall
3. Review URL validation logic
4. Document attack pattern
5. Consider reporting to abuse contact

---

### Alert 4.2: Failed Authentication Spike

**Metric**: `AUTH_FAILURE_COUNT`

**Condition**:
```yaml
WARNING:
  - Failures: > 50/hour

CRITICAL:
  - Failures: > 200/hour
  - OR > 20 from single IP
```

**Query** (Grafana):
```promql
sum(rate(audit_logs{type="AUTH_FAILED"}[1h])) > 50
```

**Notification**: Slack #engineering

**Runbook**:
1. Check if credential stuffing attack
2. Verify if single user account targeted (brute force)
3. Consider account lockout after 5 failures
4. Enable CAPTCHA for repeated failures
5. Block attacking IPs

---

### Alert 4.3: Suspicious Activity Pattern

**Metric**: `SUSPICIOUS_ACTIVITY_SCORE`

**Condition**:
```yaml
WARNING:
  - Score: > 20 from single IP

CRITICAL:
  - Score: > 50 from single IP
```

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
WHERE (csrf_score + auth_score + rate_score) > 20;
```

**Notification**: Slack #engineering

**Runbook**:
1. Investigate IP activity timeline
2. Check if known bot/scanner
3. Block if malicious
4. Document in security incident log

---

## 5. API Performance Alerts

### Alert 5.1: API Error Rate High

**Metric**: `API_ERROR_RATE`

**Condition**:
```yaml
WARNING:
  - Error rate: > 5% for any endpoint
  - Duration: > 10 minutes

CRITICAL:
  - Error rate: > 15% for any endpoint
  - Duration: > 5 minutes
```

**Query** (Grafana):
```promql
(
  sum(rate(http_requests_total{status=~"5.."}[5m])) /
  sum(rate(http_requests_total[5m]))
) * 100 > 5
```

**Notification**:
- WARNING: Slack #engineering
- CRITICAL: PagerDuty

**Runbook**:
1. Check recent deployments (rollback if needed)
2. Review error logs for root cause
3. Verify database connectivity
4. Check Supabase status
5. Scale infrastructure if needed

---

### Alert 5.2: API Latency Spike

**Metric**: `API_LATENCY_P99_BY_ENDPOINT`

**Condition**:
```yaml
WARNING:
  - P99: > 2x baseline for 15 minutes

CRITICAL:
  - P99: > 5x baseline for 5 minutes
```

**Query**: Compare current P99 to 7-day moving average

**Notification**: Slack #engineering

**Runbook**:
1. Identify slow endpoint
2. Check database query performance
3. Review recent code changes
4. Check for N+1 query issues
5. Consider caching

---

## Alert Routing Configuration

### Slack Channels

```yaml
#engineering:
  - All WARNING alerts
  - All performance issues
  - CSRF/Rate limiting warnings

#security:
  - CRITICAL security incidents
  - SSRF attacks
  - Suspicious activity

#compliance:
  - GDPR operation failures
  - Audit trail issues

#incidents:
  - All CRITICAL alerts
  - PagerDuty escalations
```

### PagerDuty Escalation

```yaml
Level 1 (0-15 min):
  - On-call engineer (primary)

Level 2 (15-30 min):
  - On-call engineer (backup)
  - Engineering manager

Level 3 (30+ min):
  - CTO
  - CEO (for GDPR failures)
```

### Email Notifications

```yaml
security@punktual.co:
  - CRITICAL security incidents
  - SSRF attacks

legal@punktual.co:
  - GDPR operation failures
  - Data deletion issues

engineering@punktual.co:
  - Daily summary of all alerts
```

---

## Grafana Alert Setup

### Example: CSRF Failure Rate

```yaml
# alert-csrf-failure-rate.yaml
apiVersion: 1
groups:
  - name: security
    interval: 1m
    rules:
      - alert: CSRFFailureRateHigh
        expr: sum(rate(audit_logs{type="CSRF_VALIDATION_FAILED"}[1h])) > 10
        for: 15m
        labels:
          severity: warning
          team: engineering
        annotations:
          summary: "CSRF validation failure rate is high"
          description: "{{ $value }} CSRF failures per hour (threshold: 10)"
          runbook: "https://docs.punktual.co/runbooks/csrf-failures"
```

### Import to Grafana

```bash
# Via API
curl -X POST \
  https://YOUR_GRAFANA_URL/api/ruler/grafana/api/v1/rules/security \
  -H "Authorization: Bearer $GRAFANA_API_KEY" \
  -H "Content-Type: application/yaml" \
  --data-binary @alert-csrf-failure-rate.yaml
```

---

## Supabase Alert Setup

### Using pg_cron (for SQL-based alerts)

```sql
-- Install pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule hourly GDPR failure check
SELECT cron.schedule(
  'gdpr-failure-check',
  '0 * * * *', -- Every hour
  $$
  SELECT
    CASE
      WHEN COUNT(*) > 0 THEN
        pg_notify('gdpr_failure', json_build_object(
          'failures', COUNT(*),
          'timestamp', NOW()
        )::text)
      ELSE NULL
    END
  FROM audit_logs
  WHERE type = 'DATA_DELETION'
    AND success = false
    AND created_at > NOW() - INTERVAL '1 hour';
  $$
);

-- Listen for notifications (in backend service)
-- Use Supabase Realtime or polling
```

---

## Alert Testing

### Test Checklist

- [ ] Trigger each alert manually
- [ ] Verify notification delivery (Slack, PagerDuty, Email)
- [ ] Confirm escalation works
- [ ] Test auto-resolution
- [ ] Validate runbook accuracy
- [ ] Check false positive rate

### Test Scripts

```bash
#!/bin/bash
# test-csrf-alert.sh

# Generate 15 fake CSRF failures
for i in {1..15}; do
  curl -X POST http://localhost:3000/api/create-short-link \
    -H "Content-Type: application/json" \
    -d '{"originalUrl": "https://example.com"}' # Missing CSRF token
  sleep 1
done

echo "Alert should trigger in 15 minutes (after threshold duration)"
```

---

## Alert Maintenance

### Weekly Tasks

- [ ] Review alert firing frequency
- [ ] Adjust thresholds if too noisy
- [ ] Update runbooks based on incidents
- [ ] Check notification channels work

### Monthly Tasks

- [ ] Review false positive rate (target: < 5%)
- [ ] Update escalation contacts
- [ ] Test PagerDuty escalation flow
- [ ] Audit alert coverage (any gaps?)

### Quarterly Tasks

- [ ] Review all alert thresholds
- [ ] Update baselines for anomaly detection
- [ ] Conduct alert fire drill
- [ ] Document lessons learned

---

## Alert Metrics

Track alert effectiveness:

```sql
-- Alert firing frequency
SELECT
  alert_name,
  COUNT(*) as times_fired,
  AVG(duration_seconds) as avg_duration
FROM alert_history
WHERE fired_at > NOW() - INTERVAL '30 days'
GROUP BY alert_name
ORDER BY times_fired DESC;

-- False positive rate
SELECT
  alert_name,
  COUNT(*) FILTER (WHERE resolved_as = 'false_positive') * 100.0 / COUNT(*) as false_positive_rate
FROM alert_history
WHERE fired_at > NOW() - INTERVAL '30 days'
GROUP BY alert_name;
```

Target KPIs:
- False positive rate: < 5%
- Mean time to acknowledge: < 5 minutes
- Mean time to resolve: < 30 minutes
- Alert fatigue score: < 10 alerts/week per engineer

---

## Summary

| Category | Alert Count | Critical Alerts | Runbooks |
|----------|-------------|-----------------|----------|
| CSRF Protection | 3 | 1 | 3 |
| Rate Limiting | 3 | 2 | 3 |
| GDPR Operations | 3 | 2 (zero tolerance) | 3 |
| Security Incidents | 3 | 2 | 3 |
| API Performance | 2 | 1 | 2 |
| **TOTAL** | **14** | **8** | **14** |

**Next Steps**: See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for setup instructions.
