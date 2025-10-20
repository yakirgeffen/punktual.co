# Monitoring Quick Reference Card

One-page cheat sheet for Punktual.co security monitoring.

---

## 🚨 Emergency Runbooks

### GDPR Deletion Failed (CRITICAL)
```sql
-- Check what failed
SELECT * FROM audit_logs
WHERE type = 'DATA_DELETION' AND success = false
ORDER BY created_at DESC LIMIT 1;

-- Manual deletion (use service role)
DELETE FROM short_links WHERE user_id = 'USER_ID';
DELETE FROM events WHERE user_id = 'USER_ID';
DELETE FROM user_profiles WHERE user_id = 'USER_ID';

-- Verify
SELECT 'events' as table, COUNT(*) FROM events WHERE user_id = 'USER_ID'
UNION ALL
SELECT 'short_links', COUNT(*) FROM short_links WHERE user_id = 'USER_ID'
UNION ALL
SELECT 'user_profiles', COUNT(*) FROM user_profiles WHERE user_id = 'USER_ID';
```

### CSRF Attack (>50 failures/hour)
```sql
-- Find attacking IPs
SELECT ip_address, COUNT(*) as failures
FROM audit_logs
WHERE type = 'CSRF_VALIDATION_FAILED'
  AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY ip_address
HAVING COUNT(*) > 20
ORDER BY failures DESC;

-- Block IP via Vercel
vercel firewall add rule --action deny --value IP_ADDRESS
```

### Rate Limit Abuse (>1000 hits/hour from single IP)
```bash
# Block IP
vercel firewall add rule --action deny --value IP_ADDRESS

# Or add to Upstash deny list
redis-cli SET "blocked:IP_ADDRESS" "1" EX 3600
```

---

## 📊 Most Useful Queries

### Security Dashboard (Last Hour)
```sql
SELECT
  type,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE success = false) as failures
FROM audit_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
  AND type IN ('CSRF_VALIDATION_FAILED', 'RATE_LIMIT_EXCEEDED', 'AUTH_FAILED')
GROUP BY type;
```

### Top Rate Limited IPs (Today)
```sql
SELECT ip_address, COUNT(*) as hits
FROM audit_logs
WHERE type = 'RATE_LIMIT_EXCEEDED'
  AND created_at > CURRENT_DATE
GROUP BY ip_address
ORDER BY hits DESC
LIMIT 10;
```

### GDPR Operations (This Month)
```sql
SELECT
  type,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE success = true) as successful,
  COUNT(*) FILTER (WHERE success = false) as failed
FROM audit_logs
WHERE type IN ('DATA_EXPORT', 'DATA_DELETION')
  AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY type;
```

### User Activity Timeline
```sql
SELECT created_at, type, action, resource, success
FROM audit_logs
WHERE user_id = 'USER_ID'
ORDER BY created_at DESC
LIMIT 50;
```

### Slow Requests (>1s)
```sql
SELECT
  created_at,
  resource,
  (metadata->>'duration_ms')::numeric as ms
FROM audit_logs
WHERE (metadata->>'duration_ms')::numeric > 1000
  AND created_at > NOW() - INTERVAL '1 hour'
ORDER BY ms DESC;
```

---

## 🎯 Key Metrics & Thresholds

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| CSRF Success Rate | >95% | <90% | <80% |
| CSRF Failures/hour | <5 | >10 | >50 |
| Rate Limit Hits/hour | <20 | >100 | >500 |
| GDPR Export Success | >95% | <95% | <90% |
| GDPR Deletion Success | 100% | <100% | ANY failure |
| API Error Rate | <1% | >5% | >15% |
| API p99 Latency | <500ms | >1s | >5s |
| Auth Failures/hour | <10 | >50 | >200 |

---

## 🔔 Alert Response Times

| Severity | Response Time | Examples |
|----------|---------------|----------|
| INFO | No action | User signup, normal operations |
| WARNING | 4 hours | CSRF spike, rate limit increase |
| CRITICAL | 15 minutes | GDPR failure, attack detected |
| EMERGENCY | Immediate | All APIs down |

---

## 📱 Where to Find Things

### Dashboards
- **Security Dashboard**: Grafana → "Punktual Security"
- **GDPR Dashboard**: Metabase → "Compliance"
- **Performance**: Vercel Analytics + Grafana
- **Audit Logs**: Supabase → SQL Editor

### Alerts
- **Slack**: #security-alerts, #engineering
- **PagerDuty**: https://punktual.pagerduty.com
- **Email**: security@punktual.co

### Documentation
- **Full Docs**: `/docs/monitoring/README.md`
- **Implementation**: `/docs/monitoring/IMPLEMENTATION_GUIDE.md`
- **Runbooks**: `/docs/monitoring/ALERT_CONFIGURATION.md`
- **Queries**: `/docs/monitoring/QUERY_EXAMPLES.md`

---

## 🛠️ Common Commands

### Grafana
```bash
# View logs
grafana-cli logs tail

# Test alert
grafana-cli alerts test ALERT_NAME

# Import dashboard
grafana-cli dashboards import dashboard.json
```

### Supabase
```bash
# Run migration
psql $DATABASE_URL -f migration.sql

# Export audit logs
psql $DATABASE_URL -c "COPY (SELECT * FROM audit_logs WHERE created_at > CURRENT_DATE - 1) TO STDOUT CSV HEADER" > audit_logs.csv

# Backup database
pg_dump $DATABASE_URL > backup.sql
```

### Vercel
```bash
# View logs
vercel logs

# List firewalls
vercel firewall ls

# Block IP
vercel firewall add rule --action deny --value IP_ADDRESS

# Remove block
vercel firewall remove rule RULE_ID
```

---

## 🔍 Troubleshooting

### No Data in Grafana
1. Check Vercel log drain: `vercel log-drain ls`
2. Verify Loki credentials
3. Wait 2-3 minutes for ingestion
4. Run query: `{job=~".*"}`

### Alert Not Firing
1. Check alert is enabled
2. Test query in Explore
3. Verify notification channel
4. Check alert history for errors

### Slow Queries
1. Check indexes: `\d+ audit_logs`
2. Run EXPLAIN: `EXPLAIN ANALYZE SELECT ...`
3. Add missing indexes
4. Run VACUUM: `VACUUM ANALYZE audit_logs`

### High Costs
1. Review log volume: Grafana → Usage
2. Check Upstash usage: Upstash Console
3. Optimize retention periods
4. Consider downgrading tiers

---

## 📞 Escalation

### Level 1 (Engineering)
- On-call engineer
- Slack: #engineering
- Response: 15 minutes

### Level 2 (Management)
- Engineering manager
- Email: engineering@punktual.co
- Response: 1 hour

### Level 3 (Executive)
- CTO for technical issues
- CEO for GDPR failures
- Phone: (listed in PagerDuty)
- Response: Immediate

### Level 4 (Legal)
- GDPR violations
- Data breaches
- Email: legal@punktual.co
- Response: 4 hours

---

## 🔐 Access Credentials

### Grafana Cloud
- URL: https://punktual.grafana.net
- Login: SSO via Google
- API Key: Stored in 1Password

### Supabase
- URL: https://supabase.com/dashboard/project/YOUR_PROJECT
- Service Role Key: Environment variable `SUPABASE_SERVICE_ROLE_KEY`
- Database: `postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres`

### Upstash
- Console: https://console.upstash.com
- Redis URL: `UPSTASH_REDIS_REST_URL`
- Token: `UPSTASH_REDIS_REST_TOKEN`

### Sentry
- URL: https://sentry.io/organizations/punktual
- DSN: `NEXT_PUBLIC_SENTRY_DSN`

---

## 📅 Maintenance Checklist

### Daily ✅
- [ ] Check Security Dashboard
- [ ] Review overnight alerts

### Weekly ✅
- [ ] Review alert frequency
- [ ] Check dashboard health
- [ ] Review slow queries

### Monthly ✅
- [ ] Generate GDPR report
- [ ] Optimize alert thresholds
- [ ] Backup audit logs
- [ ] Review costs

### Quarterly ✅
- [ ] Alert fire drill
- [ ] Update runbooks
- [ ] Team training
- [ ] Access audit

---

## 💰 Cost Monitoring

### Current Spend (Month to Date)
```sql
-- Approximate log volume
SELECT
  DATE_TRUNC('day', created_at) as day,
  COUNT(*) as events,
  COUNT(*) * 0.5 / 1024 as estimated_mb -- rough estimate
FROM audit_logs
WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY day
ORDER BY day DESC;
```

### Projected Monthly Cost
- Grafana: Check Usage dashboard
- Supabase: Database size in Settings
- Upstash: Commands/month in Console
- Sentry: Events in Stats

### Budget Alerts
- Set up billing alerts in each platform
- Notify if >80% of budget
- Review on 1st of each month

---

## 🎓 Learning Resources

### Video Tutorials
- Grafana Dashboards: https://grafana.com/tutorials/
- Supabase Database: https://supabase.com/docs/guides/database
- Sentry Setup: https://docs.sentry.io/platforms/javascript/guides/nextjs/

### Cheat Sheets
- SQL: https://www.sqltutorial.org/sql-cheat-sheet/
- LogQL: https://grafana.com/docs/loki/latest/logql/
- PostgreSQL: https://www.postgresqltutorial.com/postgresql-cheat-sheet/

### Community
- Grafana Community: https://community.grafana.com
- Supabase Discord: https://discord.supabase.com
- Next.js Discord: https://nextjs.org/discord

---

## 📖 Documentation Index

| Doc | Purpose | Read Time |
|-----|---------|-----------|
| README | Navigation & overview | 20 min |
| MONITORING_ARCHITECTURE | System design | 20 min |
| METRICS_DEFINITIONS | Metric catalog | 45 min |
| TOOLS_COMPARISON | Platform evaluation | 30 min |
| DASHBOARD_LAYOUTS | Dashboard specs | 30 min |
| ALERT_CONFIGURATION | Alert runbooks | 1 hour |
| QUERY_EXAMPLES | SQL queries | 30 min |
| IMPLEMENTATION_GUIDE | Setup instructions | 1 hour |

**Total**: ~5 hours to read all docs

---

**Print this page and keep near your desk for quick reference! 📄**

**Last Updated**: October 19, 2025
