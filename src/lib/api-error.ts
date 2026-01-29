/**
 * API Error Handler Utility
 * 
 * Implements error masking as per security requirements:
 * - Client only sees generic error messages
 * - Real error details logged server-side only
 */

import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

// ============================================
// Error Types
// ============================================

export class ApiError extends Error {
    constructor(
        public statusCode: number,
        public code: string,
        message: string,
        public details?: unknown
    ) {
        super(message)
        this.name = 'ApiError'
    }
}

export class NotFoundError extends ApiError {
    constructor(resource: string) {
        super(404, 'NOT_FOUND', `${resource} not found`)
    }
}

export class UnauthorizedError extends ApiError {
    constructor() {
        super(401, 'UNAUTHORIZED', 'Authentication required')
    }
}

export class ForbiddenError extends ApiError {
    constructor() {
        super(403, 'FORBIDDEN', 'Access denied')
    }
}

export class ValidationError extends ApiError {
    constructor(details: unknown) {
        super(400, 'VALIDATION_ERROR', 'Invalid request data', details)
    }
}

export class ExternalApiError extends ApiError {
    constructor(provider: string, originalError?: unknown) {
        super(502, 'EXTERNAL_API_ERROR', `External API error: ${provider}`)
        // Log original error but don't expose to client
        logger.error({
            type: 'external_api',
            provider,
            error: originalError instanceof Error ? originalError.message : originalError,
        })
    }
}

// ============================================
// Error Response Handler
// ============================================

/**
 * Handle API errors with proper masking
 * 
 * - Logs full error details to server
 * - Returns sanitized error to client
 */
export function handleApiError(
    error: unknown,
    context?: { endpoint?: string; userId?: string }
): NextResponse {
    // Log the actual error server-side
    logger.error({
        type: 'api_error',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        ...context,
    })

    // Handle known API errors
    if (error instanceof ApiError) {
        return NextResponse.json(
            {
                success: false,
                error: error.message,
                code: error.code,
            },
            { status: error.statusCode }
        )
    }

    // For unknown errors, return generic message (error masking)
    return NextResponse.json(
        {
            success: false,
            error: 'Something went wrong',
            code: 'INTERNAL_ERROR',
        },
        { status: 500 }
    )
}

// ============================================
// Success Response Helper
// ============================================

export function successResponse<T>(
    data: T,
    options?: {
        status?: number
        headers?: Record<string, string>
        cache?: {
            maxAge?: number
            staleWhileRevalidate?: number
        }
    }
): NextResponse {
    const headers: Record<string, string> = options?.headers || {}

    // Add cache headers if specified
    if (options?.cache) {
        const maxAge = options.cache.maxAge || 300
        const swr = options.cache.staleWhileRevalidate || 600
        headers['Cache-Control'] = `s-maxage=${maxAge}, stale-while-revalidate=${swr}`
    }

    return NextResponse.json(
        { success: true, data },
        {
            status: options?.status || 200,
            headers,
        }
    )
}

// ============================================
// Request Validation
// ============================================

export function validateRequest<T>(
    data: unknown,
    schema: { safeParse: (data: unknown) => { success: boolean; data?: T; error?: unknown } }
): T {
    const result = schema.safeParse(data)
    if (!result.success) {
        throw new ValidationError(result.error)
    }
    return result.data as T
}
