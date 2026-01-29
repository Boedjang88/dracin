/**
 * User Progress API Route
 * 
 * Handles "Continue Watching" feature
 * 
 * GET /api/user/progress - Get user's watch progress
 * POST /api/user/progress - Update watch progress
 */

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { handleApiError, successResponse, UnauthorizedError, ValidationError } from '@/lib/api-error'
import { logger, logApiRequest } from '@/lib/logger'
import { z } from 'zod'

// Schema for progress update
const updateProgressSchema = z.object({
    episodeId: z.string().min(1),
    dramaId: z.string().min(1),
    currentTime: z.number().min(0),
    duration: z.number().min(0),
    completed: z.boolean().optional(),
})

/**
 * GET - Fetch user's watch progress for continue watching
 */
export async function GET(request: NextRequest) {
    try {
        logApiRequest(request)

        const session = await auth()
        if (!session?.user?.id) {
            throw new UnauthorizedError()
        }

        const { searchParams } = new URL(request.url)
        const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 20)

        // Fetch incomplete progress records
        const progress = await prisma.userProgress.findMany({
            where: {
                userId: session.user.id,
                completed: false,
            },
            orderBy: { updatedAt: 'desc' },
            take: limit,
        })

        logger.info({
            type: 'api_response',
            endpoint: '/api/user/progress',
            method: 'GET',
            userId: session.user.id,
            count: progress.length,
        })

        return successResponse(progress)
    } catch (error) {
        return handleApiError(error, { endpoint: '/api/user/progress' })
    }
}

/**
 * POST - Update watch progress
 */
export async function POST(request: NextRequest) {
    try {
        logApiRequest(request)

        const session = await auth()
        if (!session?.user?.id) {
            throw new UnauthorizedError()
        }

        const body = await request.json()
        const parsed = updateProgressSchema.safeParse(body)

        if (!parsed.success) {
            throw new ValidationError(parsed.error.issues)
        }

        const { episodeId, dramaId, currentTime, duration, completed } = parsed.data

        // Calculate if completed (watched 90%+ of episode)
        const isCompleted = completed ?? (duration > 0 && currentTime / duration >= 0.9)

        // Upsert progress
        const progress = await prisma.userProgress.upsert({
            where: {
                userId_episodeId: {
                    userId: session.user.id,
                    episodeId,
                },
            },
            update: {
                currentTime,
                duration,
                completed: isCompleted,
            },
            create: {
                userId: session.user.id,
                episodeId,
                dramaId,
                currentTime,
                duration,
                completed: isCompleted,
            },
        })

        // Also add to watch history
        await prisma.watchHistory.create({
            data: {
                userId: session.user.id,
                episodeId,
                dramaId,
                watchTime: currentTime,
            },
        })

        logger.info({
            type: 'api_response',
            endpoint: '/api/user/progress',
            method: 'POST',
            userId: session.user.id,
            episodeId,
            completed: isCompleted,
        })

        return successResponse(progress)
    } catch (error) {
        return handleApiError(error, { endpoint: '/api/user/progress' })
    }
}

export const dynamic = 'force-dynamic'
