/**
 * Pino Logger with OWASP-Compliant Secure Logging
 * 
 * Security Rules (per OWASP Logging Cheat Sheet):
 * - NEVER log: passwords, JWT, cookies, API keys, tokens, raw emails
 * - ALLOWED: userId, endpoint, error code, stack trace (server only)
 * - All sensitive fields are automatically redacted
 */

import pino from 'pino'

// Determine if we're in development
const isDev = process.env.NODE_ENV !== 'production'

// Paths to redact from all log output
const REDACT_PATHS = [
    'password',
    'newPassword',
    'oldPassword',
    'token',
    'accessToken',
    'refreshToken',
    'apiKey',
    'cookie',
    'cookies',
    'authorization',
    'Authorization',
    'x-api-key',
    'X-API-KEY',
    'secret',
    'AUTH_SECRET',
    'jwt',
    'sessionToken',
    'req.headers.cookie',
    'req.headers.authorization',
    'res.headers["set-cookie"]',
    '*.password',
    '*.token',
    '*.apiKey',
    '*.secret',
]

// Create the logger instance
export const logger = pino({
    level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),

    // Redact sensitive fields automatically
    redact: {
        paths: REDACT_PATHS,
        censor: '[REDACTED]',
    },

    // Base context for all logs
    base: {
        env: process.env.NODE_ENV,
        service: 'dracin',
    },

    // Pretty print in development
    transport: isDev
        ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'HH:MM:ss',
                ignore: 'pid,hostname',
            },
        }
        : undefined,
})

/**
 * Create a child logger with request context
 * Use this to add userId, endpoint, or other safe context
 */
export function createRequestLogger(context: {
    userId?: string
    endpoint?: string
    method?: string
    requestId?: string
}) {
    return logger.child({
        ...context,
        // Never include full user object, only ID
        userId: context.userId || 'anonymous',
    })
}

/**
 * Log an API request (sanitized)
 */
export function logApiRequest(req: Request, userId?: string) {
    const url = new URL(req.url)

    logger.info({
        type: 'api_request',
        method: req.method,
        path: url.pathname,
        userId: userId || 'anonymous',
        // Don't log query params as they may contain sensitive data
    })
}

/**
 * Log an API response (sanitized)
 */
export function logApiResponse(
    endpoint: string,
    statusCode: number,
    duration: number,
    userId?: string
) {
    logger.info({
        type: 'api_response',
        endpoint,
        statusCode,
        durationMs: duration,
        userId: userId || 'anonymous',
    })
}

/**
 * Log an error with safe context
 * Stack traces are included server-side only
 */
export function logError(
    error: Error | unknown,
    context?: {
        userId?: string
        endpoint?: string
        action?: string
    }
) {
    const errorObj = error instanceof Error ? error : new Error(String(error))

    logger.error({
        type: 'error',
        message: errorObj.message,
        stack: errorObj.stack, // Only visible in server logs
        ...context,
    })
}

/**
 * Log security-related events
 */
export function logSecurityEvent(event: {
    action: string
    userId?: string
    success: boolean
    ip?: string
    details?: string
}) {
    const level = event.success ? 'info' : 'warn'

    logger[level]({
        type: 'security',
        ...event,
        // Never include actual credentials or tokens
    })
}

// Export default logger for simple cases
export default logger
