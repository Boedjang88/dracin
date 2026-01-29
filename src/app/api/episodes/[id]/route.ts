/**
 * Episode Detail API Route - BFF Proxy Layer
 * 
 * GET /api/episodes/[id]
 * Returns single episode with stream URL from external API
 */

import { NextRequest } from 'next/server'
import { videoProvider } from '@/lib/services/video-provider'
import { handleApiError, successResponse, NotFoundError } from '@/lib/api-error'
import { logger, logApiRequest } from '@/lib/logger'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const startTime = Date.now()

    try {
        logApiRequest(request)

        const { id } = await params

        // Fetch episode from external API
        const episode = await videoProvider.getEpisodeById(id)

        if (!episode) {
            throw new NotFoundError('Episode')
        }

        // Log performance
        const duration = Date.now() - startTime
        logger.info({
            type: 'api_response',
            endpoint: `/api/episodes/${id}`,
            statusCode: 200,
            durationMs: duration,
        })

        // Return with short caching for episode data
        return successResponse(episode, {
            cache: {
                maxAge: 300,
                staleWhileRevalidate: 600,
            },
        })
    } catch (error) {
        const { id } = await params
        return handleApiError(error, { endpoint: `/api/episodes/${id}` })
    }
}
