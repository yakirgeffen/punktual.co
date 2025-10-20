# Security Monitoring Documentation

Comprehensive monitoring and metrics tracking for Punktual.co security features.

## Overview

This documentation provides a complete monitoring solution for tracking:
- ✅ CSRF protection effectiveness
- ✅ Rate limiting performance
- ✅ GDPR compliance operations
- ✅ Security incident detection
- ✅ API performance and reliability
- ✅ User activity and audit trails

**Created**: October 2025
**Maintained by**: Data Analyst / Engineering Team
**Last Updated**: October 19, 2025

---

## Quick Start

**For engineers implementing monitoring**:
1. Start with [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
2. Follow Phase 1 (4-6 hours) to get basic monitoring working
3. Reference other docs as needed

**For engineers investigating issues**:
1. Use [QUERY_EXAMPLES.md](./QUERY_EXAMPLES.md) for SQL queries
2. Check [ALERT_CONFIGURATION.md](./ALERT_CONFIGURATION.md) for runbooks

**For compliance/legal team**:
1. Review [MONITORING_ARCHITECTURE.md](./MONITORING_ARCHITECTURE.md) - Section on retention
2. Use [QUERY_EXAMPLES.md](./QUERY_EXAMPLES.md) - Compliance Reporting section

**For executives**:
1. Skip to Executive Summary Dashboard in [DASHBOARD_LAYOUTS.md](./DASHBOARD_LAYOUTS.md)

---

## Documentation Structure

```
docs/monitoring/
├── README.md (this file)                   # Overview and navigation
├── MONITORING_ARCHITECTURE.md              # System architecture and design decisions
├── METRICS_DEFINITIONS.md                  # All 36 metrics with formulas
├── TOOLS_COMPARISON.md                     # Monitoring platform evaluation
├── DASHBOARD_LAYOUTS.md                    # Dashboard UI specifications
├── ALERT_CONFIGURATION.md                  # Alert rules and runbooks
├── QUERY_EXAMPLES.md                       # 30+ SQL queries for analytics
└── IMPLEMENTATION_GUIDE.md                 # Step-by-step setup guide
```

---

## Document Summaries

### 1. [MONITORING_ARCHITECTURE.md](./MONITORING_ARCHITECTURE.md)

**Purpose**: Understand the overall monitoring system design

**Key Sections**:
- Architecture diagram (data flow)
- Data sources (Vercel, Supabase, Upstash)
- Storage locations and retention policies
- Backup strategy
- Cost breakdown ($20-$269/month)
- Architecture decision records (why we chose this design)

**Read this if**:
- Setting up monitoring for the first time
- Need to explain system to stakeholders
- Planning capacity/budget

**Time to read**: 20 minutes

---

### 2. [METRICS_DEFINITIONS.md](./METRICS_DEFINITIONS.md)

**Purpose**: Detailed specification of every metric tracked

**Key Sections**:
- 36 metrics across 6 categories
- SQL/PromQL queries for each metric
- Baseline values and alert thresholds
- Dashboard placement
- Collection methods

**Metrics Summary**:
| Category | Count | Priority |
|----------|-------|----------|
| CSRF Protection | 6 | High |
| Rate Limiting | 7 | High |
| GDPR Operations | 8 | Critical |
| Security Incidents | 4 | Critical |
| API Performance | 7 | Medium |
| Audit Analysis | 4 | Low |

**Read this if**:
- Creating dashboards
- Setting up alerts
- Understanding what should be measured

**Time to read**: 45 minutes (reference doc, not meant to read cover-to-cover)

---

### 3. [TOOLS_COMPARISON.md](./TOOLS_COMPARISON.md)

**Purpose**: Evaluate monitoring platforms and choose the right stack

**Tools Compared**:
1. DataDog ($60-200/month) - Enterprise APM
2. **Grafana Cloud ($0-49/month) - RECOMMENDED**
3. Sentry ($26-80/month) - Error tracking
4. Metabase ($0-85/month) - Business analytics
5. Supabase ($0-25/month) - Database + basic analytics
6. LogRocket ($99+/month) - Frontend monitoring
7. Vercel Analytics (included) - Basic metrics

**Recommended Stack**:
- **MVP**: Grafana Free + Supabase Free ($0/month)
- **Production**: Grafana Standard + Sentry + Supabase Pro ($154/month)

**Read this if**:
- Choosing monitoring tools
- Budgeting for monitoring
- Comparing vendor options

**Time to read**: 30 minutes

---

### 4. [DASHBOARD_LAYOUTS.md](./DASHBOARD_LAYOUTS.md)

**Purpose**: Visual specifications for all monitoring dashboards

**Dashboards**:
1. **Security Dashboard** (real-time) - For on-call engineers
2. **GDPR Compliance Dashboard** - For legal/compliance
3. **Performance Dashboard** - For engineering team
4. **Audit Log Viewer** - For investigations
5. **Executive Summary** - For leadership

**Each dashboard includes**:
- ASCII art layout preview
- Panel specifications
- SQL/PromQL queries
- Refresh rates
- Access permissions

**Read this if**:
- Building dashboards in Grafana/Metabase
- Designing custom visualizations
- Understanding what dashboards are available

**Time to read**: 30 minutes

---

### 5. [ALERT_CONFIGURATION.md](./ALERT_CONFIGURATION.md)

**Purpose**: Complete alerting setup with runbooks

**14 Alerts Configured**:

| Alert | Severity | Threshold | Response Time |
|-------|----------|-----------|---------------|
| CSRF Failure Rate High | WARNING | >10/hour | 4 hours |
| CSRF Failure Rate Critical | CRITICAL | >50/hour | 15 minutes |
| Rate Limit Spike | WARNING | >100/hour | 4 hours |
| Single IP Excessive Rate Limiting | CRITICAL | >1000/hour | Immediate |
| GDPR Export Failed | WARNING | >1 in 1hr | 4 hours |
| GDPR Deletion Failed | **CRITICAL** | ANY failure | **Immediate** |
| SSRF Attack Detected | CRITICAL | >20/hour | 15 minutes |
| API Error Rate High | WARNING | >5% | 4 hours |
| ... and 6 more |

**Each alert includes**:
- Metric definition
- Grafana/SQL query
- Warning and critical thresholds
- Notification routing (Slack, PagerDuty, Email)
- **Runbook** (step-by-step response guide)
- False positive scenarios
- Auto-resolution conditions

**Read this if**:
- Setting up alerts
- Responding to an alert (use runbook)
- On-call duty

**Time to read**: 1 hour (reference doc)

---

### 6. [QUERY_EXAMPLES.md](./QUERY_EXAMPLES.md)

**Purpose**: 30+ ready-to-use SQL queries for investigations and reporting

**Query Categories**:
1. CSRF Protection (6 queries)
2. Rate Limiting (5 queries)
3. GDPR Operations (4 queries)
4. Security Incidents (4 queries)
5. Performance Analysis (3 queries)
6. User Activity (3 queries)
7. Compliance Reporting (3 queries)
8. Advanced Queries (2 queries - cohort analysis, anomaly detection)

**Example queries**:
- "Show me CSRF failures in the last 24 hours"
- "Which IPs are hitting rate limits?"
- "Generate monthly GDPR compliance report"
- "Find slow API requests (>1 second)"
- "Detect suspicious activity patterns"

**Read this if**:
- Investigating security incidents
- Creating custom reports
- Building new dashboards
- Ad-hoc data analysis

**Time to read**: 30 minutes (copy-paste as needed)

---

### 7. [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)

**Purpose**: Step-by-step setup instructions

**5 Phases**:

**Phase 1: Foundation (Week 1)** - 4 hours
- Create Supabase audit table
- Update audit.ts to write to database
- Set up Grafana Cloud
- Import security dashboard
- Create saved queries

**Phase 2: Alerting (Week 2)** - 3 hours
- Configure Slack integration
- Create 14 alert rules
- Set up PagerDuty (optional)

**Phase 3: Compliance (Week 3)** - 3 hours
- Set up Metabase
- Create compliance reports
- Schedule automated emails

**Phase 4: Advanced (Week 4)** - 2 hours
- Add performance tracking
- Set up Sentry error tracking
- Create executive dashboard

**Phase 5: Automation (Ongoing)** - 2 hours/month
- Automate log cleanup
- Create backup scripts
- Optimize database performance

**Total Time**: 12-16 hours over 4 weeks

**Read this if**:
- You're implementing monitoring (start here!)
- Need step-by-step instructions
- Troubleshooting issues

**Time to read**: 1 hour (but you'll reference it during implementation)

---

## Current State Analysis

### What's Already Implemented

✅ **Audit Logging Infrastructure**:
- `src/lib/audit.ts` - Audit event logging utility
- `src/lib/logger.ts` - General application logging
- Console logging to Vercel stdout (captured automatically)

✅ **Security Features Being Logged**:
- CSRF validation (success/failure) via `validateCSRFMiddleware()`
- Rate limiting (hits/blocks) via middleware.ts
- GDPR operations (exports/deletions) in `/api/user/*`
- Authentication events (login/logout/signup)
- Short link creation
- Unauthorized access attempts

✅ **Existing Event Types**:
```typescript
type AuditEventType =
  | 'AUTH_LOGIN' | 'AUTH_LOGOUT' | 'AUTH_FAILED' | 'AUTH_SIGNUP'
  | 'SHORT_LINK_CREATE' | 'SHORT_LINK_ACCESS'
  | 'EVENT_CREATE' | 'EVENT_UPDATE' | 'EVENT_DELETE'
  | 'PROFILE_UPDATE'
  | 'UNAUTHORIZED_ACCESS'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INPUT_VALIDATION_FAILED'
  | 'SUSPICIOUS_ACTIVITY'
  | 'DATA_EXPORT' | 'DATA_DELETION'
  | 'CSRF_VALIDATION_FAILED';
```

✅ **Data Sources**:
- Vercel logs (stdout/stderr) - 7 day retention
- Upstash Redis analytics (rate limiting metrics)
- Application memory logs (src/lib/logger.ts)

### What Needs to Be Implemented

❌ **Missing Components**:

1. **Supabase audit_logs table** (SQL migration provided)
2. **Grafana Cloud setup** (free tier, 2 hours)
3. **Dashboard creation** (templates provided)
4. **Alert configuration** (14 alerts, 3 hours)
5. **Compliance reporting** (Metabase setup, 2 hours)
6. **Performance metric collection** (add timing to API routes)

**Estimated Total Implementation Time**: 12-16 hours

### Baseline Metrics (Local Testing)

Based on development testing:
- CSRF token generation: ~5-10 tokens/hour (low dev traffic)
- CSRF validation success rate: ~100% (no users yet)
- Rate limit hit rate: 0% (limits not enforced in dev)
- API response times:
  - `/api/csrf-token`: ~50-100ms
  - `/api/create-short-link`: ~200-400ms
  - `/api/user/export-data`: ~1-2 seconds
  - `/api/user/delete-data`: ~3-5 seconds

**Note**: Production metrics will differ significantly based on traffic.

---

## Monitoring Objectives (Recap)

### 1. CSRF Protection Monitoring ✅

**Objectives**:
- [x] Track token generation rate
- [x] Monitor validation failures
- [x] Calculate success rate
- [x] Identify problematic routes
- [x] Alert on failure spikes
- [x] Analyze expiration patterns
- [x] Geographic distribution

**Implementation Status**: Fully documented, needs deployment

---

### 2. Rate Limiting Monitoring ✅

**Objectives**:
- [x] Track rate limit hits per hour
- [x] Monitor by IP address
- [x] Monitor by user ID
- [x] Identify top offenders
- [x] Alert on unusual patterns
- [x] Track baseline traffic
- [x] Monitor Upstash latency
- [x] Compare IP vs user-based limiting

**Implementation Status**: Middleware in place, monitoring needs setup

---

### 3. GDPR Operations Monitoring ✅

**Objectives**:
- [x] Track export requests (daily/weekly/monthly)
- [x] Monitor export success rate
- [x] Track export failures by error type
- [x] Monitor export file sizes
- [x] Track deletion requests
- [x] Monitor deletion success rate (100% required)
- [x] Track deletion completion time
- [x] Alert on ANY deletion failure
- [x] Maintain audit trail (7 years)

**Implementation Status**: API endpoints logging, compliance reporting needs setup

---

### 4. Security Incident Tracking ✅

**Objectives**:
- [x] Log SSRF attack attempts
- [x] Track open redirect blocking
- [x] Monitor failed auth attempts
- [x] Track unauthorized access
- [x] Detect suspicious patterns
- [x] Alert on attack spikes

**Implementation Status**: SSRF/redirect blocking in place, dashboards needed

---

### 5. API Performance Monitoring ✅

**Objectives**:
- [x] Track response time per endpoint
- [x] Monitor error rate
- [x] Calculate p50/p95/p99 latencies
- [x] Spike detection
- [x] Slow request investigation

**Implementation Status**: Partial (needs timing instrumentation)

---

### 6. Audit Log Analysis ✅

**Objectives**:
- [x] Parse and categorize events
- [x] Track by event type
- [x] Correlate suspicious patterns
- [x] User activity timeline
- [x] Failed operation investigation
- [x] Compliance audit reports

**Implementation Status**: Schema designed, queries ready, execution pending

---

## Implementation Roadmap

### Week 1: MVP Monitoring
**Goal**: Get basic visibility into security operations

- [ ] Create Supabase audit_logs table (30 min)
- [ ] Update audit.ts to write to database (1 hour)
- [ ] Set up Grafana Cloud free tier (1 hour)
- [ ] Configure Vercel log drain (30 min)
- [ ] Import Security Dashboard (1 hour)

**Deliverable**: Real-time security dashboard showing CSRF, rate limiting, auth events

**Cost**: $0 (free tier)

---

### Week 2: Alerting
**Goal**: Get notified of security incidents

- [ ] Configure Slack integration (30 min)
- [ ] Create CSRF failure alerts (30 min)
- [ ] Create rate limiting alerts (30 min)
- [ ] Create GDPR operation alerts (30 min)
- [ ] Create security incident alerts (30 min)
- [ ] Test all alerts (30 min)

**Deliverable**: 14 alerts routing to Slack

**Cost**: $0 (Slack free tier)

---

### Week 3: Compliance
**Goal**: GDPR compliance reporting

- [ ] Set up Metabase (2 hours)
- [ ] Create GDPR Compliance Dashboard (1 hour)
- [ ] Create compliance SQL queries (30 min)
- [ ] Schedule monthly reports (30 min)

**Deliverable**: Automated GDPR compliance reports

**Cost**: $0 (self-hosted Metabase) or $85/month (cloud)

---

### Week 4: Advanced Features
**Goal**: Performance monitoring and error tracking

- [ ] Add timing to API routes (1 hour)
- [ ] Set up Sentry error tracking (1 hour)
- [ ] Create Performance Dashboard (1 hour)
- [ ] Create Executive Dashboard (1 hour)

**Deliverable**: Full observability stack

**Cost**: +$26/month (Sentry)

---

### Month 2+: Optimization
**Goal**: Automate and optimize

- [ ] Automate log cleanup (30 min)
- [ ] Set up backup script (1 hour)
- [ ] Optimize database queries (30 min)
- [ ] Fine-tune alert thresholds (ongoing)
- [ ] Team training (1 hour)

**Deliverable**: Production-ready monitoring

---

## Success Metrics

After implementation, you should achieve:

**Visibility**:
- ✅ < 5 minute detection time for security incidents
- ✅ 100% GDPR operation visibility
- ✅ Real-time dashboards for all security metrics

**Reliability**:
- ✅ < 5% false positive rate on alerts
- ✅ < 5 minute mean time to acknowledge alerts
- ✅ < 30 minute mean time to resolve incidents

**Compliance**:
- ✅ 100% GDPR audit trail coverage
- ✅ 7-year retention of GDPR operations
- ✅ Automated monthly compliance reports

**Cost Efficiency**:
- ✅ $0-20/month for MVP
- ✅ < $300/month at scale
- ✅ Open-source stack (no vendor lock-in)

---

## Team Responsibilities

### Engineering Team
- Implement Phase 1-4 (12-16 hours)
- Respond to alerts (on-call rotation)
- Maintain dashboards
- Optimize performance

### Compliance/Legal Team
- Review GDPR compliance reports (monthly)
- Investigate failed GDPR operations (immediately)
- Audit log access requests (as needed)
- Retention policy compliance

### Management/Executive
- Review executive dashboard (weekly)
- Budget approval for monitoring tools
- Security incident escalation (critical only)

### Support Team
- Investigate user-reported issues via Audit Log Viewer
- Document common issues
- Escalate security concerns

---

## FAQ

### Q: Why not just use Vercel Analytics?

**A**: Vercel Analytics provides basic metrics (function duration, error rate) but lacks:
- Security event tracking (CSRF, rate limiting)
- GDPR audit trail
- Customizable alerts
- SQL query capabilities
- Long-term retention (7+ days)

We use Vercel Analytics as a baseline and augment with Grafana + Supabase for comprehensive monitoring.

---

### Q: Do we need all 36 metrics?

**A**: No! Start with these critical 10:
1. CSRF validation failures count
2. CSRF success rate
3. Rate limit hits per hour
4. Top rate limited IPs
5. GDPR export success rate
6. GDPR deletion success rate (MUST BE 100%)
7. API error rate
8. API p99 latency
9. Failed auth attempts
10. Suspicious activity score

Add others as needed.

---

### Q: Can we skip Metabase?

**A**: Yes for MVP. Use Supabase SQL Editor for ad-hoc queries. Add Metabase when:
- Legal team needs automated reports
- You want scheduled PDF reports
- Supabase UI is too technical for stakeholders

---

### Q: What if we can't afford PagerDuty?

**A**: Use Grafana alerting + Slack for MVP. PagerDuty is recommended but not required. Alternatives:
- **Free**: Grafana → Slack (with @channel for critical)
- **Budget**: Opsgenie ($9/user/month)
- **Enterprise**: PagerDuty ($21/user/month)

---

### Q: How do we handle alert fatigue?

**A**: Follow these principles:
1. Start with high thresholds (fewer alerts)
2. Gradually lower based on actual traffic
3. Review false positive rate monthly (target: <5%)
4. Use WARNING vs CRITICAL severity
5. Auto-resolve alerts when possible
6. Deduplicate similar alerts (e.g., group by IP)

---

### Q: Can we self-host Grafana instead of cloud?

**A**: Yes, but not recommended for MVP because:
- Cloud is free (up to 50 GB logs/month)
- No maintenance overhead
- Better uptime than self-hosted
- Easier to set up (1 hour vs 4 hours)

Self-host only if:
- You need >50 GB logs/month
- You have DevOps resources
- Data sovereignty requirements

---

## Glossary

**APM**: Application Performance Monitoring
**CSRF**: Cross-Site Request Forgery
**GDPR**: General Data Protection Regulation
**LogQL**: Log Query Language (Grafana Loki)
**PromQL**: Prometheus Query Language
**RLS**: Row Level Security (Supabase)
**SSRF**: Server-Side Request Forgery
**TTL**: Time To Live

---

## Resources

**Documentation**:
- Punktual Codebase: `/Users/yakirgeffen/Desktop/punktual.co`
- Security Implementation: `SECURITY_FIXES_APPLIED.md`
- Deployment Guide: `DEPLOYMENT_READY.md`

**External Links**:
- Grafana Cloud: https://grafana.com
- Supabase: https://supabase.com
- Sentry: https://sentry.io
- Upstash: https://upstash.com
- Metabase: https://www.metabase.com

**Support**:
- Grafana Community: https://community.grafana.com
- Supabase Discord: https://discord.supabase.com
- Punktual Team: engineering@punktual.co

---

## Changelog

**v1.0 - October 19, 2025**
- Initial documentation created
- All 7 docs completed
- 36 metrics defined
- 14 alerts configured
- 30+ SQL queries provided
- Full implementation guide written

---

## Next Steps

**For immediate implementation**:

1. **Read this**: [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
2. **Block 4-6 hours** this week for Phase 1
3. **Follow step-by-step** instructions
4. **Verify** with checklist in implementation guide

**For questions or support**:
- Open GitHub issue
- Email: engineering@punktual.co
- Slack: #engineering

---

**Total Documentation**: ~25,000 words, 7 files
**Implementation Time**: 12-16 hours
**Maintenance Time**: 2-4 hours/month
**Value**: Comprehensive security visibility, GDPR compliance, incident response

Good luck! 🚀
