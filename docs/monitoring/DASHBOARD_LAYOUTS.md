# Dashboard Layouts

Visual specifications for all monitoring dashboards in Punktual.co.

## Dashboard Hierarchy

```
├── 1. Security Dashboard (Real-time)
├── 2. GDPR Compliance Dashboard
├── 3. Performance Dashboard
├── 4. Audit Log Viewer
└── 5. Executive Summary Dashboard
```

---

## 1. Security Dashboard (Real-time)

**Purpose**: Real-time security monitoring for on-call engineers
**Refresh**: 30 seconds auto-refresh
**Access**: Engineering team
**Tool**: Grafana Cloud

### Layout (16:9 ratio)

```
┌─────────────────────────────────────────────────────────────────┐
│  SECURITY DASHBOARD - Last 24 Hours          🔴 2 Active Alerts │
├──────────────────┬──────────────────┬──────────────────┬────────┤
│                  │                  │                  │        │
│  CSRF Failures   │  Rate Limit Hits │  Auth Failures   │ Alerts │
│     ┌─────┐      │     ┌─────┐      │     ┌─────┐      │  ┌───┐ │
│     │ 247 │      │     │  89 │      │     │  12 │      │  │🔴 │ │
│     └─────┘      │     └─────┘      │     └─────┘      │  │🟡 │ │
│   +15% vs avg    │   -20% vs avg    │   +50% vs avg    │  └───┘ │
│                  │                  │                  │        │
├──────────────────┴──────────────────┴──────────────────┴────────┤
│                                                                  │
│  CSRF Validation Trend (Last 24h)                   Success: 98%│
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                               ╱────╲                        │ │
│  │    ╱──╲        ╱────╲    ╱──╱      ╲     ╱───╲            │ │
│  │ ──╱    ╲──────╱      ╲──╱            ╲──╱     ╲────       │ │
│  │                                                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│  6am     9am    12pm     3pm     6pm     9pm    12am     3am    │
│                                                                  │
├─────────────────────────────┬────────────────────────────────────┤
│                             │                                    │
│  Rate Limit Distribution    │  Top Rate Limited IPs              │
│  ┌─────────────────────┐    │  ┌──────────────────────────────┐ │
│  │ /api/create  ████ 45│    │  │ IP              Hits  Country │ │
│  │ /api/export  ███  30│    │  │ 203.0.113.45    234   🇺🇸 US  │ │
│  │ /api/delete  ██   20│    │  │ 198.51.100.12   189   🇬🇧 GB  │ │
│  │ /api/csrf    █     5│    │  │ 192.0.2.88      145   🇩🇪 DE  │ │
│  └─────────────────────┘    │  │ 203.0.113.99    112   🇫🇷 FR  │ │
│                             │  │ 198.51.100.67    89   🇯🇵 JP  │ │
│                             │  └──────────────────────────────┘ │
│                             │                                    │
├─────────────────────────────┴────────────────────────────────────┤
│                                                                  │
│  Security Events Timeline (Last 6 Hours)                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 3:45am  CSRF_VALIDATION_FAILED   User: anonymous  IP: ...  │ │
│  │ 3:42am  RATE_LIMIT_EXCEEDED      User: user_123   IP: ...  │ │
│  │ 3:40am  AUTH_FAILED              User: null        IP: ...  │ │
│  │ 3:38am  CSRF_VALIDATION_FAILED   User: anonymous  IP: ...  │ │
│  │ 3:35am  SUSPICIOUS_ACTIVITY      User: null        IP: ...  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Panel Specifications

#### Panel 1: CSRF Failures (Top Left)
- **Type**: Stat panel with sparkline
- **Query**: `COUNT WHERE type = 'CSRF_VALIDATION_FAILED' AND time > now() - 24h`
- **Comparison**: vs 24h average
- **Color**: Red if > 100, Yellow if > 50, Green otherwise
- **Size**: 1/4 width

#### Panel 2: Rate Limit Hits (Top Center-Left)
- **Type**: Stat panel with trend arrow
- **Query**: `COUNT WHERE type = 'RATE_LIMIT_EXCEEDED' AND time > now() - 24h`
- **Threshold**: Red if > 200, Yellow if > 100

#### Panel 3: Auth Failures (Top Center-Right)
- **Type**: Stat panel
- **Query**: `COUNT WHERE type = 'AUTH_FAILED'`
- **Threshold**: Red if > 50, Yellow if > 20

#### Panel 4: Active Alerts (Top Right)
- **Type**: Alert list
- **Size**: 1/4 width
- **Shows**: Current firing alerts only
- **Colors**: Red (critical), Yellow (warning)

#### Panel 5: CSRF Validation Trend (Center)
- **Type**: Time series line chart
- **Queries**:
  - Failures (red line)
  - Successes (green line)
- **Y-axis**: Count per 15-minute bucket
- **Legend**: Show success rate %
- **Size**: Full width

#### Panel 6: Rate Limit Distribution (Bottom Left)
- **Type**: Horizontal bar chart
- **Query**: `COUNT WHERE type = 'RATE_LIMIT_EXCEEDED' GROUP BY resource`
- **Order**: Descending by count
- **Size**: 1/2 width

#### Panel 7: Top Rate Limited IPs (Bottom Right)
- **Type**: Table
- **Columns**: IP, Hits, Country, Last Seen
- **Query**: `SELECT ip, COUNT(*), MAX(timestamp) ... ORDER BY COUNT(*) DESC LIMIT 10`
- **Links**: Click IP to see details
- **Size**: 1/2 width

#### Panel 8: Security Events Timeline (Bottom)
- **Type**: Logs panel (streaming)
- **Query**: `type IN ('CSRF_VALIDATION_FAILED', 'RATE_LIMIT_EXCEEDED', 'AUTH_FAILED', 'SUSPICIOUS_ACTIVITY')`
- **Sort**: Descending timestamp
- **Limit**: 50 events
- **Size**: Full width

### Grafana JSON Model (Excerpt)

```json
{
  "dashboard": {
    "title": "Security Dashboard",
    "refresh": "30s",
    "panels": [
      {
        "id": 1,
        "type": "stat",
        "title": "CSRF Failures",
        "targets": [{
          "expr": "sum(rate(audit_logs{type='CSRF_VALIDATION_FAILED'}[24h]))"
        }],
        "fieldConfig": {
          "defaults": {
            "thresholds": {
              "steps": [
                { "value": 0, "color": "green" },
                { "value": 50, "color": "yellow" },
                { "value": 100, "color": "red" }
              ]
            }
          }
        }
      }
    ]
  }
}
```

---

## 2. GDPR Compliance Dashboard

**Purpose**: Track GDPR operations for compliance team
**Refresh**: Manual (daily review)
**Access**: Legal, compliance, executive
**Tool**: Metabase or Grafana

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  GDPR COMPLIANCE DASHBOARD - October 2025                       │
├──────────────────┬──────────────────┬──────────────────┬────────┤
│                  │                  │                  │        │
│  Data Exports    │  Data Deletions  │  Export Success  │ Status │
│     ┌─────┐      │     ┌─────┐      │     ┌─────┐      │  ✅    │
│     │  47 │      │     │   3 │      │     │ 100%│      │        │
│     └─────┘      │     └─────┘      │     └─────┘      │  All   │
│   This month     │   This month     │   This month     │  OK    │
│                  │                  │                  │        │
├──────────────────┴──────────────────┴──────────────────┴────────┤
│                                                                  │
│  GDPR Requests Over Time                                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                                                             │ │
│  │  ╱╲                                                         │ │
│  │ ╱  ╲         ╱╲     ╱╲                   ╱╲               │ │
│  │╱    ╲───────╱  ╲───╱  ╲─────────────────╱  ╲─────────     │ │
│  │                                                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│  Jan   Feb   Mar   Apr   May   Jun   Jul   Aug   Sep   Oct     │
│                                                                  │
├─────────────────────────────┬────────────────────────────────────┤
│                             │                                    │
│  Export Request Details     │  Deletion Request Details          │
│  ┌─────────────────────┐    │  ┌──────────────────────────────┐ │
│  │ Date      User  Size │    │  │ Date      User      Reason   │ │
│  │ Oct 18  u_123   45KB│    │  │ Oct 15  user_456  GDPR Art.17│ │
│  │ Oct 17  u_456  123KB│    │  │ Oct 12  user_789  Account Del│ │
│  │ Oct 16  u_789   67KB│    │  │ Oct 8   user_012  GDPR Art.17│ │
│  │ Oct 15  u_012  234KB│    │  └──────────────────────────────┘ │
│  │ Oct 14  u_345   89KB│    │                                    │
│  └─────────────────────┘    │                                    │
│                             │                                    │
├─────────────────────────────┴────────────────────────────────────┤
│                                                                  │
│  Compliance Metrics                                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ✅ Average export response time: 1.2 seconds (target: <5s) │ │
│  │ ✅ Average deletion time: 3.4 seconds (target: <30s)       │ │
│  │ ✅ Export success rate: 100% (target: >95%)                │ │
│  │ ✅ Deletion success rate: 100% (target: 100%)              │ │
│  │ ✅ Audit trail completeness: 100% (all ops logged)         │ │
│  │ ✅ Data retention policy: Compliant (7 years for GDPR)     │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### SQL Queries (Metabase/Supabase)

```sql
-- Panel: Data Exports This Month
SELECT COUNT(*) as export_count
FROM audit_logs
WHERE type = 'DATA_EXPORT'
  AND created_at >= DATE_TRUNC('month', CURRENT_DATE);

-- Panel: GDPR Requests Over Time
SELECT
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) FILTER (WHERE type = 'DATA_EXPORT') as exports,
  COUNT(*) FILTER (WHERE type = 'DATA_DELETION') as deletions
FROM audit_logs
WHERE type IN ('DATA_EXPORT', 'DATA_DELETION')
GROUP BY month
ORDER BY month DESC
LIMIT 12;

-- Panel: Export Request Details
SELECT
  TO_CHAR(created_at, 'Mon DD') as date,
  SUBSTRING(user_id, 1, 8) as user,
  (metadata->>'events_exported')::int + (metadata->>'short_links_exported')::int as records
FROM audit_logs
WHERE type = 'DATA_EXPORT'
  AND created_at > CURRENT_DATE - 30
ORDER BY created_at DESC
LIMIT 10;
```

---

## 3. Performance Dashboard

**Purpose**: Monitor API performance and latency
**Refresh**: 1 minute auto-refresh
**Access**: Engineering team
**Tool**: Grafana Cloud + Vercel Analytics

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  API PERFORMANCE DASHBOARD - Last 6 Hours                       │
├──────────────────┬──────────────────┬──────────────────┬────────┤
│                  │                  │                  │        │
│  Avg Latency     │  P99 Latency     │  Error Rate      │  QPS   │
│     ┌─────┐      │     ┌─────┐      │     ┌─────┐      │ ┌────┐│
│     │ 187 │ms    │     │ 542 │ms    │     │ 0.3%│      │ │ 45 ││
│     └─────┘      │     └─────┘      │     └─────┘      │ └────┘│
│   +10ms vs avg   │   Normal         │   ✅ Good        │        │
│                  │                  │                  │        │
├──────────────────┴──────────────────┴──────────────────┴────────┤
│                                                                  │
│  API Response Time by Endpoint (P50, P95, P99)                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                                 ╱P99 ────                   │ │
│  │                        ╱───────╱                            │ │
│  │              ╱────────╱    P95 ─────                        │ │
│  │     ╱───────╱                                               │ │
│  │ ───╱  P50 ────────                                          │ │
│  └────────────────────────────────────────────────────────────┘ │
│  1h ago      2h       3h       4h       5h       6h       Now   │
│                                                                  │
├─────────────────────────────┬────────────────────────────────────┤
│                             │                                    │
│  Latency by Endpoint        │  Error Breakdown                   │
│  ┌─────────────────────┐    │  ┌──────────────────────────────┐ │
│  │ /api/csrf     87ms  │    │  │ 500 Internal    █████  15    │ │
│  │ /api/short   234ms  │    │  │ 429 Rate Limit  ███     8    │ │
│  │ /api/export  1.2s   │    │  │ 403 CSRF Fail   ██      5    │ │
│  │ /api/delete  3.4s   │    │  │ 401 Unauth      █       2    │ │
│  └─────────────────────┘    │  └──────────────────────────────┘ │
│                             │                                    │
├─────────────────────────────┴────────────────────────────────────┤
│                                                                  │
│  Slow Requests (> 1 second)                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 3:45am  /api/user/export-data    2.3s   user_123   200 OK  │ │
│  │ 3:42am  /api/user/delete-data    4.1s   user_456   200 OK  │ │
│  │ 3:40am  /api/create-short-link   1.7s   user_789   500 ERR │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Integration with Vercel Analytics

Vercel provides:
- Function execution time (p50, p95, p99)
- Invocation count
- Error rate
- Memory usage

Export to Grafana via webhook or manual export.

---

## 4. Audit Log Viewer

**Purpose**: Investigate specific events and user activity
**Refresh**: On-demand search
**Access**: Engineering, compliance, support
**Tool**: Supabase Dashboard or Grafana Explore

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  AUDIT LOG VIEWER                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Filters: ┌──────────────┬──────────────┬──────────────┬─────┐ │
│           │ Event Type ▼ │ User ID      │ Date Range ▼ │ 🔍  │ │
│           └──────────────┴──────────────┴──────────────┴─────┘ │
│                                                                  │
│  Results: 1,247 events                     ⬇️ Download CSV      │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Time      Type               User      IP         Success  │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │ 3:45am    CSRF_FAILED        u_123     203...45   ❌       │ │
│  │ 3:44am    SHORT_LINK_CREATE  u_123     203...45   ✅       │ │
│  │ 3:43am    AUTH_LOGIN         u_123     203...45   ✅       │ │
│  │ 3:42am    RATE_LIMIT_HIT     u_456     198...12   ❌       │ │
│  │ 3:40am    DATA_EXPORT        u_789     192...88   ✅       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Event Details (selected row): CSRF_FAILED at 3:45am            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ {                                                           │ │
│  │   "type": "CSRF_VALIDATION_FAILED",                        │ │
│  │   "user_id": "user_123",                                   │ │
│  │   "ip": "203.0.113.45",                                    │ │
│  │   "user_agent": "Mozilla/5.0...",                          │ │
│  │   "action": "create_short_link",                           │ │
│  │   "error": "CSRF token missing",                           │ │
│  │   "metadata": { "route": "/api/create-short-link" }       │ │
│  │ }                                                           │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Supabase SQL Query

```sql
-- Search audit logs
SELECT
  created_at,
  type,
  user_id,
  ip_address,
  success,
  error_message,
  metadata
FROM audit_logs
WHERE
  ($1::text IS NULL OR type = $1) AND
  ($2::uuid IS NULL OR user_id = $2) AND
  created_at BETWEEN $3 AND $4
ORDER BY created_at DESC
LIMIT 1000;
```

---

## 5. Executive Summary Dashboard

**Purpose**: High-level overview for leadership
**Refresh**: Daily snapshot
**Access**: C-suite, investors, board
**Tool**: Metabase (PDF export) or Grafana

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  PUNKTUAL SECURITY SUMMARY - October 2025                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🔒 Security Posture: ✅ HEALTHY                                │
│                                                                  │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐ │
│  │              │              │              │              │ │
│  │  Auth        │  Rate Limit  │  CSRF        │  GDPR        │ │
│  │  Success     │  Hit Rate    │  Success     │  Compliance  │ │
│  │    99.2%     │    1.4%      │    98.1%     │    100%      │ │
│  │   ✅ Good    │   ✅ Good    │   ✅ Good    │   ✅ Good    │ │
│  │              │              │              │              │ │
│  └──────────────┴──────────────┴──────────────┴──────────────┘ │
│                                                                  │
│  Security Trends (Last 30 Days)                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                                                             │ │
│  │  Attacks Blocked:    ████████████████████  342  (+5%)      │ │
│  │  Auth Failures:      ████████             145  (-12%)      │ │
│  │  CSRF Failures:      █████                 89  (-8%)       │ │
│  │  SSRF Blocked:       ██                    12  (+100%)     │ │
│  │                                                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ✅ No critical security incidents this month                   │
│  ✅ GDPR compliance: 47 exports, 3 deletions (all successful)  │
│  ✅ Uptime: 99.98% (target: >99.9%)                            │
│  ⚠️  Note: Rate limit hits increased 5% (under investigation)  │
│                                                                  │
│  Recent Security Enhancements:                                  │
│  • Oct 10: Implemented CSRF protection on all POST endpoints   │
│  • Oct 10: Added rate limiting (60 req/min per IP)             │
│  • Oct 10: Deployed GDPR export/deletion endpoints             │
│  • Oct 10: Enabled RLS policies on all tables                  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Dashboard Access Matrix

| Dashboard | Engineering | Compliance | Legal | Executive | Public |
|-----------|-------------|------------|-------|-----------|--------|
| Security | ✅ Full | ❌ View | ❌ None | ❌ None | ❌ None |
| GDPR | ✅ Full | ✅ Full | ✅ View | ✅ View | ❌ None |
| Performance | ✅ Full | ❌ None | ❌ None | ❌ None | ❌ None |
| Audit Log | ✅ Full | ✅ View | ✅ View | ❌ None | ❌ None |
| Executive | ✅ View | ✅ View | ✅ View | ✅ Full | ❌ None |

---

## Mobile View Considerations

All dashboards should be responsive for mobile:
- Stack panels vertically on < 768px width
- Simplify charts (fewer data points)
- Use collapsible sections
- Prioritize most critical metrics at top

---

## Dark Mode

Recommended color scheme for night shifts:
- Background: #1A1A1A
- Text: #E0E0E0
- Success: #10B981 (Emerald)
- Warning: #F59E0B (Amber)
- Error: #EF4444 (Red)
- Neutral: #6B7280 (Gray)

---

## Next Steps

1. **Week 1**: Create Security Dashboard in Grafana
2. **Week 2**: Set up GDPR Compliance Dashboard in Metabase
3. **Week 3**: Build Performance Dashboard
4. **Week 4**: Configure Audit Log Viewer
5. **Month 2**: Add Executive Summary Dashboard

See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for detailed setup instructions.
