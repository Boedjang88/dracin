/**
 * Drama Detail API Route - BFF Proxy Layer
 * 
 * GET /api/dramas/[id]
 * Returns single drama with episodes from external API
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

        // Fetch drama and episodes in parallel
        const [drama, episodes] = await Promise.all([
            videoProvider.getDramaById(id),
            videoProvider.getEpisodes(id),
        ])

        if (!drama) {
            throw new NotFoundError('Drama')
        }

        // Log performance
        const duration = Date.now() - startTime
        logger.info({
            type: 'api_response',
            endpoint: `/api/dramas/${id}`,
            statusCode: 200,
            durationMs: duration,
        })

        // Return with caching headers
        return successResponse(
            {
                ...drama,
                episodes,
            },
            {
                cache: {
                    maxAge: 600, // 10 minutes for detail pages
                    staleWhileRevalidate: 1200,
                },
            }
        )
    } catch (error) {
        const { id } = await params
        return handleApiError(error, { endpoint: `/api/dramas/${id}` })
    }
}
