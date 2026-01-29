# Security Guide

This guide explains how Dracin protects user data, handles authentication, and follows security best practices.

---

## 📖 Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Authorization](#authorization)
- [Data Protection](#data-protection)
- [Logging & Auditing](#logging--auditing)
- [Error Handling](#error-handling)
- [Security Headers](#security-headers)
- [Common Vulnerabilities](#common-vulnerabilities)
- [Security Checklist](#security-checklist)
- [Incident Response](#incident-response)

---

## Overview

Dracin implements multiple layers of security:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SECURITY LAYERS                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐                                               │
│  │   HTTPS          │  Encrypted transport                          │
│  └────────┬─────────┘                                               │
│           ▼                                                          │
│  ┌──────────────────┐                                               │
│  │  Rate Limiting   │  Prevent brute force                          │
│  └────────┬─────────┘                                               │
│           ▼                                                          │
│  ┌──────────────────┐                                               │
│  │  Input Validation│  Sanitize all inputs                          │
│  └────────┬─────────┘                                               │
│           ▼                                                          │
│  ┌──────────────────┐                                               │
│  │  Authentication  │  Verify identity                              │
│  └────────┬─────────┘                                               │
│           ▼                                                          │
│  ┌──────────────────┐                                               │
│  │  Authorization   │  Check permissions                            │
│  └────────┬─────────┘                                               │
│           ▼                                                          │
│  ┌──────────────────┐                                               │
│  │  Audit Logging   │  Record all actions                           │
│  └──────────────────┘                                               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Authentication

### How Users Log In

Dracin uses **NextAuth.js v5** for authentication, which handles:
- Session management
- CSRF protection
- Secure cookie handling
- OAuth provider integration

### Password Security

**Hashing Algorithm:** bcrypt with 10 salt rounds

```typescript
import bcrypt from 'bcryptjs'

// When user registers
const hashedPassword = await bcrypt.hash(password, 10)
// Store hashedPassword in database (NEVER the plain password)

// When user logs in
const isValid = await bcrypt.compare(inputPassword, storedHash)
```

**Why bcrypt?**
- Intentionally slow (prevents brute force)
- Includes salt (prevents rainbow tables)
- Widely audited and trusted

### Password Requirements

| Requirement | Value |
|-------------|-------|
| Minimum length | 8 characters |
| Maximum length | 72 characters (bcrypt limit) |

### Session Management

```typescript
// src/lib/auth.ts
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: 'database', // Sessions stored in database
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // ...
})
```

**How Sessions Work:**

```
1. User logs in successfully
   ↓
2. Server creates Session record in database
   ↓
3. Browser receives session cookie
   ↓
4. Each request includes cookie automatically
   ↓
5. Server validates session on each request
   ↓
6. User logs out → Session deleted from database
```

### Session Cookie Settings

| Setting | Value | Why |
|---------|-------|-----|
| HttpOnly | true | Can't be accessed by JavaScript |
| Secure | true (production) | Only sent over HTTPS |
| SameSite | lax | Prevents CSRF on cross-site requests |
| Path | / | Valid for entire site |

---

## Authorization

### Protecting Routes

#### Server Components (Recommended)

```typescript
// src/app/watchlist/page.tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function WatchlistPage() {
  const session = await auth()
  
  // Not logged in? Redirect to login
  if (!session?.user) {
    redirect('/auth')
  }
  
  // User is authenticated, show content
  return <div>Your watchlist...</div>
}
```

#### API Routes

```typescript
// src/app/api/user/favorites/route.ts
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Please log in' } },
      { status: 401 }
    )
  }
  
  // User is authenticated
  const favorites = await prisma.favorites.findMany({
    where: { userId: session.user.id }
  })
  
  return NextResponse.json({ success: true, data: favorites })
}
```

### User ID Validation

Always verify the user owns the resource:

```typescript
// ❌ BAD - Anyone can delete any favorite
await prisma.favorites.delete({
  where: { id: favoriteId }
})

// ✅ GOOD - Only owner can delete their favorite
await prisma.favorites.delete({
  where: { 
    id: favoriteId,
    userId: session.user.id // Verify ownership
  }
})
```

---

## Data Protection

### BFF Proxy Pattern

The client NEVER directly accesses external APIs:

```
┌────────┐     ┌──────────────┐     ┌──────────────┐
│Client  │────▶│ Dracin API   │────▶│ External API │
│        │     │ (Your Server)│     │              │
└────────┘     └──────────────┘     └──────────────┘
                     │
            API keys stay here ✅
```

**Why this matters:**
- API keys never exposed to browser
- Can't be stolen from browser dev tools
- Server controls all external requests

### Environment Variables

```bash
# .env (NEVER commit this file!)

# Database connection
DATABASE_URL="postgresql://user:password@host:5432/db"

# Authentication secret (generate with: openssl rand -base64 32)
AUTH_SECRET="your-super-secret-random-string"

# External API keys (if any)
VIDEO_API_KEY="keep-this-secret"
```

**Git Ignore:**
```gitignore
# .gitignore
.env
.env.local
.env.*.local
```

### Sensitive Data Handling

| Data Type | Storage | Encryption |
|-----------|---------|------------|
| Passwords | Database | bcrypt hash |
| Session tokens | Cookie + DB | Signed |
| API keys | Environment | Plain (server only) |
| User emails | Database | Plain |

---

## Logging & Auditing

### Structured Logging

Dracin uses **Pino** for JSON-formatted logs:

```typescript
import { logger } from '@/lib/services/pino-logger'

// Log API request
logger.info({
  type: 'api_request',
  method: 'GET',
  path: '/api/dramas',
  userId: session?.user?.id || 'anonymous'
})

// Log error
logger.error({
  type: 'api_error',
  error: error.message,
  stack: error.stack
})
```

### PII Redaction

Sensitive fields are automatically removed from logs:

```typescript
// Before logging
const data = {
  email: 'user@example.com',
  password: 'secret123',
  apiKey: 'sk_live_xxx'
}

// After redaction
{
  email: 'user@example.com', // OK - email is not redacted
  password: '[REDACTED]',    // Redacted!
  apiKey: '[REDACTED]'       // Redacted!
}
```

**Redacted Fields:**
- password
- secret
- token
- apiKey
- authorization
- cookie
- credential

### Audit Logging

Important actions are recorded in the AuditLog table:

```typescript
import { logAuditEvent } from '@/lib/audit'

// On successful login
await logAuditEvent({
  userId: user.id,
  action: 'LOGIN_SUCCESS',
  metadata: { method: 'credentials', ip: request.ip }
})

// On failed login
await logAuditEvent({
  userId: null,
  action: 'LOGIN_FAILURE',
  metadata: { email, ip: request.ip }
})
```

**Tracked Events:**

| Action | When Logged |
|--------|-------------|
| `LOGIN_SUCCESS` | User logs in successfully |
| `LOGIN_FAILURE` | Failed login attempt |
| `LOGOUT` | User logs out |
| `REGISTER` | New account created |
| `PASSWORD_CHANGE` | Password updated |
| `ACCOUNT_DELETE` | Account deleted |

---

## Error Handling

### The Problem with Errors

Raw errors can leak sensitive information:

```javascript
// ❌ BAD - Exposes internal details
{
  error: "PrismaClientKnownRequestError: Invalid `prisma.user.findUnique()` 
         invocation: Unique constraint failed on the fields: (`email`)"
}
```

### The Solution: Generic Errors

```javascript
// ✅ GOOD - Generic message to client
{
  success: false,
  error: {
    code: 'INTERNAL_ERROR',
    message: 'Something went wrong'
  }
}
```

### Implementation

```typescript
// src/app/api/example/route.ts
export async function GET() {
  try {
    const data = await riskyOperation()
    return Response.json({ success: true, data })
    
  } catch (error) {
    // Log full error (server-side only)
    logger.error({
      type: 'api_error',
      error: error.message,
      stack: error.stack,
      // Add context for debugging
      endpoint: '/api/example'
    })
    
    // Return generic error to client
    return Response.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
      }
    }, { status: 500 })
  }
}
```

### Error Code Reference

| Code | Status | User Message |
|------|--------|--------------|
| UNAUTHORIZED | 401 | Please log in to continue |
| FORBIDDEN | 403 | You don't have permission |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid input provided |
| INTERNAL_ERROR | 500 | Something went wrong |

---

## Security Headers

Recommended headers (configure in `next.config.ts`):

```typescript
// next.config.ts
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY' // Prevent clickjacking
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff' // Prevent MIME sniffing
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block' // XSS filter
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders
      }
    ]
  }
}
```

---

## Common Vulnerabilities

### SQL Injection

**Risk:** Attacker manipulates database queries.

**Protection:** Prisma uses parameterized queries automatically.

```typescript
// ✅ SAFE - Prisma handles escaping
const user = await prisma.user.findFirst({
  where: { email: userInput }
})
```

### XSS (Cross-Site Scripting)

**Risk:** Attacker injects malicious scripts.

**Protection:** React escapes content by default.

```tsx
// ✅ SAFE - React escapes this
<div>{userGeneratedContent}</div>

// ⚠️ DANGEROUS - Only if you trust the content
<div dangerouslySetInnerHTML={{ __html: content }} />
```

### CSRF (Cross-Site Request Forgery)

**Risk:** Attacker tricks user into unwanted actions.

**Protection:** NextAuth includes CSRF tokens automatically.

### Open Redirects

**Risk:** Redirecting users to malicious sites.

**Protection:** Validate redirect URLs.

```typescript
const allowedHosts = ['localhost:3000', 'yourdomain.com']

function safeRedirect(url: string) {
  try {
    const parsed = new URL(url)
    if (allowedHosts.includes(parsed.host)) {
      return url
    }
  } catch {
    // Invalid URL
  }
  return '/' // Default to home
}
```

---

## Security Checklist

### Required ✅

- [x] Passwords hashed with bcrypt
- [x] Session tokens are HttpOnly cookies
- [x] API routes check authentication
- [x] Sensitive data not in logs
- [x] Environment variables for secrets
- [x] Generic error messages to clients

### Recommended 🔧

- [ ] Rate limiting on auth endpoints
- [ ] Content Security Policy header
- [ ] Regular dependency updates
- [ ] Penetration testing
- [ ] Security monitoring/alerting

### Production Only 🚀

- [ ] HTTPS enforced
- [ ] Database connections encrypted
- [ ] Secrets in secure vault (not .env)
- [ ] WAF (Web Application Firewall)

---

## Incident Response

### If You Suspect a Breach

1. **Contain**
   - Rotate affected secrets immediately
   - Revoke compromised sessions
   - Block suspicious IPs

2. **Investigate**
   - Check audit logs for suspicious activity
   - Review access patterns
   - Identify affected accounts

3. **Notify**
   - Inform affected users
   - Report to relevant authorities if required
   - Document timeline

4. **Recover**
   - Reset affected passwords
   - Review and patch vulnerability
   - Update security measures

### Useful Commands

```bash
# Check recent logins
SELECT * FROM "AuditLog" 
WHERE action IN ('LOGIN_SUCCESS', 'LOGIN_FAILURE')
ORDER BY timestamp DESC
LIMIT 100;

# Find suspicious activity
SELECT * FROM "AuditLog"
WHERE timestamp > NOW() - INTERVAL '24 hours'
AND action = 'LOGIN_FAILURE'
GROUP BY "ipAddress"
HAVING COUNT(*) > 10;
```

---

## Resources

- [OWASP Top 10](https://owasp.org/Top10/)
- [NextAuth.js Security](https://authjs.dev/concepts/security)
- [Prisma Security Best Practices](https://www.prisma.io/docs/concepts/security)

---

## Next Steps

- [Architecture](./architecture.md) - System overview
- [API Reference](./api.md) - Endpoint documentation
- [Database](./database.md) - Data structures
