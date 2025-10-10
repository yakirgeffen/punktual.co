/**
 * Security Audit Logging Utility
 *
 * Logs security-relevant events for monitoring, compliance, and incident response.
 *
 * Use this to track:
 * - Authentication events (login, logout, failed attempts)
 * - Authorization failures
 * - Data access and modifications
 * - API usage patterns
 * - Suspicious activity
 *
 * In production, these logs should be sent to a centralized logging service
 * like DataDog, Sentry, LogRocket, or AWS CloudWatch.
 */

export type AuditEventType =
  | 'AUTH_LOGIN'
  | 'AUTH_LOGOUT'
  | 'AUTH_FAILED'
  | 'AUTH_SIGNUP'
  | 'SHORT_LINK_CREATE'
  | 'SHORT_LINK_ACCESS'
  | 'EVENT_CREATE'
  | 'EVENT_UPDATE'
  | 'EVENT_DELETE'
  | 'PROFILE_UPDATE'
  | 'UNAUTHORIZED_ACCESS'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INPUT_VALIDATION_FAILED'
  | 'SUSPICIOUS_ACTIVITY';

export interface AuditEvent {
  /** Type of security event */
  type: AuditEventType;

  /** User ID if authenticated, null for anonymous */
  userId?: string | null;

  /** Action being performed */
  action: string;

  /** Resource being accessed (e.g., event ID, profile ID) */
  resource?: string;

  /** IP address of the client */
  ip?: string;

  /** User agent string */
  userAgent?: string;

  /** Additional metadata */
  metadata?: Record<string, unknown>;

  /** Success or failure */
  success: boolean;

  /** Error message if failed */
  errorMessage?: string;

  /** Timestamp */
  timestamp?: string;
}

/**
 * Logs a security audit event
 *
 * @param event - The audit event to log
 *
 * @example
 * ```ts
 * await logAuditEvent({
 *   type: 'SHORT_LINK_CREATE',
 *   userId: user.id,
 *   action: 'CREATE_SHORT_LINK',
 *   resource: shortId,
 *   ip: request.headers.get('x-forwarded-for') || 'unknown',
 *   userAgent: request.headers.get('user-agent') || 'unknown',
 *   success: true,
 * });
 * ```
 */
export async function logAuditEvent(event: AuditEvent): Promise<void> {
  const timestamp = event.timestamp || new Date().toISOString();

  const logEntry = {
    ...event,
    timestamp,
    // Add environment info
    env: process.env.NODE_ENV,
  };

  // Console logging for development
  if (process.env.NODE_ENV === 'development') {
    console.log('[AUDIT]', JSON.stringify(logEntry, null, 2));
  } else {
    // Production: log to stdout in structured JSON format
    // This allows log aggregation services to parse and index logs
    console.log(JSON.stringify({ level: 'audit', ...logEntry }));
  }

  // TODO: Send to external logging service in production
  // Examples:
  //
  // 1. Sentry (for error tracking)
  // if (!event.success) {
  //   Sentry.captureMessage(`Security event: ${event.type}`, {
  //     level: 'warning',
  //     extra: logEntry,
  //   });
  // }
  //
  // 2. DataDog (for APM and logging)
  // await fetch('https://http-intake.logs.datadoghq.com/v1/input', {
  //   method: 'POST',
  //   headers: {
  //     'DD-API-KEY': process.env.DATADOG_API_KEY,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(logEntry),
  // });
  //
  // 3. Supabase (store in audit_logs table)
  // const supabase = createServiceRoleClient();
  // await supabase.from('audit_logs').insert(logEntry);

  // For now, we rely on Vercel's built-in logging which captures stdout
}

/**
 * Helper to extract client IP from request
 */
export function getClientIp(request: Request): string {
  // Try various headers in order of preference
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

/**
 * Helper to extract user agent from request
 */
export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'unknown';
}

/**
 * Convenience function for logging authentication events
 */
export async function logAuthEvent(params: {
  type: Extract<AuditEventType, 'AUTH_LOGIN' | 'AUTH_LOGOUT' | 'AUTH_FAILED' | 'AUTH_SIGNUP'>;
  userId?: string | null;
  email?: string;
  method: 'email' | 'google' | 'oauth';
  ip: string;
  userAgent: string;
  success: boolean;
  errorMessage?: string;
}): Promise<void> {
  await logAuditEvent({
    type: params.type,
    userId: params.userId,
    action: params.type.toLowerCase(),
    metadata: {
      email: params.email,
      method: params.method,
    },
    ip: params.ip,
    userAgent: params.userAgent,
    success: params.success,
    errorMessage: params.errorMessage,
  });
}

/**
 * Convenience function for logging failed authorization attempts
 */
export async function logUnauthorizedAccess(params: {
  userId?: string | null;
  action: string;
  resource: string;
  ip: string;
  userAgent: string;
  reason: string;
}): Promise<void> {
  await logAuditEvent({
    type: 'UNAUTHORIZED_ACCESS',
    userId: params.userId,
    action: params.action,
    resource: params.resource,
    ip: params.ip,
    userAgent: params.userAgent,
    success: false,
    errorMessage: params.reason,
  });
}