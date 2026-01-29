# Security

Dracin implements security best practices aligned with OWASP guidelines.

## Overview

| Area | Implementation |
|------|----------------|
| Authentication | NextAuth.js with hashed passwords |
| Authorization | Session-based route protection |
| Data Protection | BFF proxy layer |
| Logging | Structured logs with PII redaction |
| Error Handling | Client-safe error messages |
| Audit Trail | All auth events logged |

## Authentication

### Password Security

- Passwords hashed using **bcrypt** with salt rounds of 10
- Minimum password length enforced (8 characters)
- Passwords never logged or returned in responses

```typescript
import bcrypt from 'bcryptjs'

// Hashing
const hashedPassword = await bcrypt.hash(password, 10)

// Verification
const isValid = await bcrypt.compare(password, hashedPassword)
```

### Session Management

- Sessions stored in database (not JWT by default)
- Automatic expiration after 30 days
- Session invalidation on sign out

## Authorization

### Route Protection

```typescript
// Server Component
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const session = await auth()
  if (!session) redirect('/auth')
  
  // Authorized content
}
```

### API Route Protection

```typescript
// API Route
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED' } },
      { status: 401 }
    )
  }
  
  // Authorized logic
}
```

## Data Protection

### BFF Proxy Pattern

The client **never** directly communicates with external APIs:

```
Client ──▶ /api/dramas ──▶ VideoProvider ──▶ External API
                │
                └── API keys stay server-side
```

Benefits:
- API keys never exposed to client
- Rate limiting controlled server-side
- Response sanitization before client delivery

### Environment Variables

Sensitive configuration stored in environment variables:

```env
# .env (never committed)
DATABASE_URL="..."
AUTH_SECRET="..."
EXTERNAL_API_KEY="..."  # If applicable
```

## Logging

### Structured Logging

Using Pino for structured, JSON logging:

```typescript
import { logger } from '@/lib/services/pino-logger'

logger.info({
  type: 'api_request',
  method: 'GET',
  path: '/api/dramas',
  userId: session?.user?.id || 'anonymous'
})
```

### PII Redaction

Sensitive fields automatically redacted:

```typescript
const REDACTED_FIELDS = [
  'password',
  'token',
  'secret',
  'apiKey',
  'authorization',
  'cookie'
]

// Before: { password: "secret123", email: "user@example.com" }
// After:  { password: "[REDACTED]", email: "user@example.com" }
```

### Log Levels

| Level | Usage |
|-------|-------|
| `error` | Exceptions, failures |
| `warn` | Degraded service, retries |
| `info` | API requests, auth events |
| `debug` | Development details |

## Audit Logging

All authentication events recorded in `AuditLog` table:

```typescript
await prisma.auditLog.create({
  data: {
    userId: user.id,
    action: 'LOGIN_SUCCESS',
    ipAddress: request.headers.get('x-forwarded-for'),
    userAgent: request.headers.get('user-agent'),
    metadata: { method: 'credentials' }
  }
})
```

### Tracked Events

| Action | Description |
|--------|-------------|
| `LOGIN_SUCCESS` | Successful sign in |
| `LOGIN_FAILURE` | Failed sign in attempt |
| `LOGOUT` | User signed out |
| `REGISTER` | New account created |
| `PASSWORD_CHANGE` | Password updated |
| `ACCOUNT_UPDATE` | Profile updated |

## Error Handling

### Client-Safe Errors

Detailed errors logged server-side, generic messages sent to client:

```typescript
try {
  // Operation
} catch (error) {
  // Full details logged
  logger.error({ error, userId, operation: 'fetchDrama' })
  
  // Generic response to client
  return NextResponse.json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' }
  }, { status: 500 })
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid input |
| `INTERNAL_ERROR` | 500 | Server error |

## Headers

Security headers configured in `next.config.ts`:

```typescript
headers: [
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  }
]
```

## CSRF Protection

NextAuth.js provides built-in CSRF protection for all authentication endpoints.

## Rate Limiting

Not currently implemented. Recommended for production:
- Use middleware or external service (Vercel Edge, Cloudflare)
- Limit auth endpoints to 5 requests/minute per IP
- Limit API endpoints to 100 requests/minute per user

## Security Checklist

- [x] Passwords hashed with bcrypt
- [x] Environment variables for secrets
- [x] Session-based authentication
- [x] Protected API routes
- [x] BFF proxy pattern
- [x] Structured logging
- [x] PII redaction in logs
- [x] Audit trail for auth events
- [x] Generic client error messages
- [ ] Rate limiting (recommended)
- [ ] Content Security Policy (recommended)
