/**
 * Dramas API Route - BFF Proxy Layer
 * 
 * Proxies all drama requests through the server.
 * Client NEVER calls external video API directly.
 * 
 * Features:
 * - Caching (s-maxage for CDN caching)
 * - Error masking (client sees generic errors)
 * - Secure logging (no sensitive data)
 */

import { NextRequest } from 'next/server'
import { videoProvider } from '@/lib/services/video-provider'
import { handleApiError, successResponse } from '@/lib/api-error'
import { logger, logApiRequest } from '@/lib/logger'
import type { DramaVibe, SearchOptions } from '@/lib/types/video'

export async function GET(request: NextRequest) {
    const startTime = Date.now()

    try {
        logApiRequest(request)

        const { searchParams } = new URL(request.url)

        // Parse query parameters
        const options: SearchOptions = {
            page: parseInt(searchParams.get('page') || '1'),
            limit: Math.min(parseInt(searchParams.get('limit') || '12'), 50), // Cap at 50
            genre: searchParams.get('genre') || undefined,
            vibe: (searchParams.get('vibe') as DramaVibe) || undefined,
            year: searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined,
            sortBy: (searchParams.get('sortBy') as 'latest' | 'rating' | 'popularity') || 'latest',
        }

        // Fetch from video provider (external API proxy)
        const result = await videoProvider.getDramas(options)

        // Log performance
        const duration = Date.now() - startTime
        logger.info({
            type: 'api_response',
            endpoint: '/api/dramas',
            statusCode: 200,
            durationMs: duration,
            resultCount: result.data.length,
        })

        // Return with caching headers
        return successResponse(result, {
            cache: {
                maxAge: 300, // 5 minutes
                staleWhileRevalidate: 600, // 10 minutes
            },
        })
    } catch (error) {
        return handleApiError(error, { endpoint: '/api/dramas' })
    }
}

// Explicitly allow GET only
export const dynamic = 'force-dynamic'
