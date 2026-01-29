/**
 * Recommendations API Route
 * 
 * GET /api/recommendations
 * Returns personalized drama recommendations for the user
 */

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { getRecommendations, getSimilarDramas, getContinueWatching } from '@/lib/services/recommendations'
import { videoProvider } from '@/lib/services/video-provider'
import { handleApiError, successResponse } from '@/lib/api-error'
import { logger, logApiRequest } from '@/lib/logger'
import type { Drama } from '@/lib/types/video'

export async function GET(request: NextRequest) {
    const startTime = Date.now()

    try {
        logApiRequest(request)

        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type') || 'personalized'
        const dramaId = searchParams.get('dramaId')
        const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 20)

        const session = await auth()
        const userId = session?.user?.id

        let recommendations: Drama[] | Awaited<ReturnType<typeof getContinueWatching>> = []

        switch (type) {
            case 'similar':
                // Get similar dramas to a specific drama
                if (!dramaId) {
                    recommendations = await videoProvider.getFeaturedDramas()
                } else {
                    recommendations = await getSimilarDramas(dramaId, limit)
                }
                break

            case 'continue':
                // Get continue watching
                if (!userId) {
                    recommendations = []
                } else {
                    recommendations = await getContinueWatching(userId, limit)
                }
                break

            case 'featured':
                // Get featured/trending dramas
                recommendations = await videoProvider.getFeaturedDramas()
                break

            case 'personalized':
            default:
                // Get personalized recommendations
                if (!userId) {
                    // For anonymous users, return featured
                    recommendations = await videoProvider.getFeaturedDramas()
                } else {
                    recommendations = await getRecommendations(userId, limit)
                }
                break
        }

        // Log performance
        const duration = Date.now() - startTime
        logger.info({
            type: 'api_response',
            endpoint: '/api/recommendations',
            recommendationType: type,
            userId: userId || 'anonymous',
            durationMs: duration,
            count: Array.isArray(recommendations) ? recommendations.length : 0,
        })

        return successResponse(recommendations, {
            cache: userId ? undefined : { maxAge: 300, staleWhileRevalidate: 600 },
        })
    } catch (error) {
        return handleApiError(error, { endpoint: '/api/recommendations' })
    }
}

export const dynamic = 'force-dynamic'
