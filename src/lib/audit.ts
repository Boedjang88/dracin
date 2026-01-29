/**
 * Audit Logging Service
 * 
 * Logs security-relevant events to the database.
 * Following OWASP Logging Cheat Sheet and NIST SP 800-92.
 * 
 * Events logged:
 * - login / logout
 * - failed authentication attempts
 * - password changes
 * - sensitive operations
 */

import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import type { AuditAction, AuditLogEntry } from '@/lib/types/video'

/**
 * Log an audit event to the database
 * 
 * IMPORTANT: Never include sensitive data in metadata!
 * Allowed: userId, action type, IP, user agent, timestamps
 * NOT allowed: passwords, tokens, API keys, raw emails
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
    try {
        // Sanitize metadata - remove any sensitive fields that might have leaked
        const sanitizedMetadata = entry.metadata
            ? sanitizeMetadata(entry.metadata)
            : null

        await prisma.auditLog.create({
            data: {
                userId: entry.userId || null,
                action: entry.action,
                ip: entry.ip || null,
                userAgent: entry.userAgent
                    ? truncateUserAgent(entry.userAgent)
                    : null,
                metadata: sanitizedMetadata
                    ? JSON.stringify(sanitizedMetadata)
                    : null,
            },
        })

        // Also log to application logs
        logger.info({
            type: 'audit',
            action: entry.action,
            userId: entry.userId || 'anonymous',
            ip: maskIp(entry.ip),
        })
    } catch (error) {
        // Never fail the main operation due to audit logging
        logger.error({
            type: 'audit_error',
            message: 'Failed to write audit log',
            error: error instanceof Error ? error.message : 'Unknown error',
        })
    }
}

/**
 * Log authentication success
 */
export async function logAuthSuccess(
    userId: string,
    ip?: string,
    userAgent?: string
): Promise<void> {
    await logAuditEvent({
        userId,
        action: 'login',
        ip,
        userAgent,
        metadata: {
            timestamp: new Date().toISOString(),
        },
    })
}

/**
 * Log authentication failure
 */
export async function logAuthFailure(
    email: string,
    ip?: string,
    userAgent?: string,
    reason?: string
): Promise<void> {
    await logAuditEvent({
        // Don't store email directly - hash or use identifier
        userId: undefined,
        action: 'failed_auth',
        ip,
        userAgent,
        metadata: {
            // Store partial email for debugging (first char + domain)
            emailHint: maskEmail(email),
            reason: reason || 'invalid_credentials',
            timestamp: new Date().toISOString(),
        },
    })
}

/**
 * Log user logout
 */
export async function logLogout(
    userId: string,
    ip?: string,
    userAgent?: string
): Promise<void> {
    await logAuditEvent({
        userId,
        action: 'logout',
        ip,
        userAgent,
    })
}

/**
 * Log password change
 */
export async function logPasswordChange(
    userId: string,
    ip?: string,
    userAgent?: string
): Promise<void> {
    await logAuditEvent({
        userId,
        action: 'password_change',
        ip,
        userAgent,
        metadata: {
            timestamp: new Date().toISOString(),
        },
    })
}

/**
 * Log sensitive operation (for future use)
 */
export async function logSensitiveOperation(
    userId: string,
    operation: string,
    ip?: string,
    userAgent?: string
): Promise<void> {
    await logAuditEvent({
        userId,
        action: 'sensitive_operation',
        ip,
        userAgent,
        metadata: {
            operation,
            timestamp: new Date().toISOString(),
        },
    })
}

// ============================================
// Helper Functions
// ============================================

/**
 * Remove sensitive fields from metadata object
 */
function sanitizeMetadata(
    metadata: Record<string, unknown>
): Record<string, unknown> {
    const sensitiveKeys = [
        'password',
        'token',
        'apiKey',
        'secret',
        'authorization',
        'cookie',
        'jwt',
        'accessToken',
        'refreshToken',
    ]

    const sanitized: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(metadata)) {
        if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
            continue // Skip sensitive keys
        }
        sanitized[key] = value
    }

    return sanitized
}

/**
 * Truncate user agent to reasonable length
 */
function truncateUserAgent(userAgent: string): string {
    const maxLength = 256
    return userAgent.length > maxLength
        ? userAgent.substring(0, maxLength) + '...'
        : userAgent
}

/**
 * Mask IP address for logging (privacy)
 */
function maskIp(ip?: string): string {
    if (!ip) return 'unknown'

    // IPv4: show first two octets only
    if (ip.includes('.')) {
        const parts = ip.split('.')
        return `${parts[0]}.${parts[1]}.x.x`
    }

    // IPv6: show first segment only
    if (ip.includes(':')) {
        const parts = ip.split(':')
        return `${parts[0]}:****`
    }

    return 'unknown'
}

/**
 * Mask email for audit logs
 */
function maskEmail(email: string): string {
    if (!email || !email.includes('@')) return '***'

    const [local, domain] = email.split('@')
    const maskedLocal = local.charAt(0) + '***'

    return `${maskedLocal}@${domain}`
}
