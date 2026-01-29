/**
 * Search API Route - BFF Proxy Layer
 * 
 * GET /api/search?q=query
 * Searches dramas via external API proxy
 */

import { NextRequest } from 'next/server'
import { videoProvider } from '@/lib/services/video-provider'
import { handleApiError, successResponse, ValidationError } from '@/lib/api-error'
import { logger, logApiRequest } from '@/lib/logger'
import type { DramaVibe } from '@/lib/types/video'

export async function GET(request: NextRequest) {
    const startTime = Date.now()

    try {
        logApiRequest(request)

        const { searchParams } = new URL(request.url)
        const query = searchParams.get('q')

        if (!query || query.trim().length === 0) {
            throw new ValidationError({ q: 'Search query is required' })
        }

        // Search options
        const options = {
            page: parseInt(searchParams.get('page') || '1'),
            limit: Math.min(parseInt(searchParams.get('limit') || '20'), 50),
            genre: searchParams.get('genre') || undefined,
            vibe: (searchParams.get('vibe') as DramaVibe) || undefined,
        }

        // Search via external API proxy
        const result = await videoProvider.searchDramas(query.trim(), options)

        // Log performance (no query logged for privacy)
        const duration = Date.now() - startTime
        logger.info({
            type: 'api_response',
            endpoint: '/api/search',
            statusCode: 200,
            durationMs: duration,
            resultCount: result.data.length,
        })

        return successResponse(result, {
            cache: {
                maxAge: 60, // 1 minute for search results
                staleWhileRevalidate: 120,
            },
        })
    } catch (error) {
        return handleApiError(error, { endpoint: '/api/search' })
    }
}

export const dynamic = 'force-dynamic'
