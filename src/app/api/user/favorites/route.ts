/**
 * User Favorites API Route
 * 
 * Handles "My List" feature
 * 
 * GET /api/user/favorites - Get user's favorites
 * POST /api/user/favorites - Add to favorites
 * DELETE /api/user/favorites - Remove from favorites
 */

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { handleApiError, successResponse, UnauthorizedError, ValidationError, NotFoundError } from '@/lib/api-error'
import { logger, logApiRequest } from '@/lib/logger'
import { logAuditEvent } from '@/lib/audit'
import { z } from 'zod'

// Schema for adding/removing favorites
const favoriteSchema = z.object({
    dramaId: z.string().min(1),
})

/**
 * GET - Fetch user's favorites
 */
export async function GET(request: NextRequest) {
    try {
        logApiRequest(request)

        const session = await auth()
        if (!session?.user?.id) {
            throw new UnauthorizedError()
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
        const skip = (page - 1) * limit

        // Fetch favorites with pagination
        const [favorites, total] = await Promise.all([
            prisma.favorites.findMany({
                where: { userId: session.user.id },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.favorites.count({
                where: { userId: session.user.id },
            }),
        ])

        logger.info({
            type: 'api_response',
            endpoint: '/api/user/favorites',
            method: 'GET',
            userId: session.user.id,
            count: favorites.length,
        })

        return successResponse({
            data: favorites,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        return handleApiError(error, { endpoint: '/api/user/favorites' })
    }
}

/**
 * POST - Add drama to favorites
 */
export async function POST(request: NextRequest) {
    try {
        logApiRequest(request)

        const session = await auth()
        if (!session?.user?.id) {
            throw new UnauthorizedError()
        }

        const body = await request.json()
        const parsed = favoriteSchema.safeParse(body)

        if (!parsed.success) {
            throw new ValidationError(parsed.error.issues)
        }

        const { dramaId } = parsed.data

        // Check if already favorited
        const existing = await prisma.favorites.findUnique({
            where: {
                userId_dramaId: {
                    userId: session.user.id,
                    dramaId,
                },
            },
        })

        if (existing) {
            return successResponse(existing, { status: 200 })
        }

        // Create favorite
        const favorite = await prisma.favorites.create({
            data: {
                userId: session.user.id,
                dramaId,
            },
        })

        // Audit log
        await logAuditEvent({
            userId: session.user.id,
            action: 'favorites_add',
            metadata: { dramaId },
        })

        logger.info({
            type: 'api_response',
            endpoint: '/api/user/favorites',
            method: 'POST',
            userId: session.user.id,
            dramaId,
        })

        return successResponse(favorite, { status: 201 })
    } catch (error) {
        return handleApiError(error, { endpoint: '/api/user/favorites' })
    }
}

/**
 * DELETE - Remove drama from favorites
 */
export async function DELETE(request: NextRequest) {
    try {
        logApiRequest(request)

        const session = await auth()
        if (!session?.user?.id) {
            throw new UnauthorizedError()
        }

        const { searchParams } = new URL(request.url)
        const dramaId = searchParams.get('dramaId')

        if (!dramaId) {
            throw new ValidationError({ dramaId: 'Drama ID is required' })
        }

        // Check if exists
        const existing = await prisma.favorites.findUnique({
            where: {
                userId_dramaId: {
                    userId: session.user.id,
                    dramaId,
                },
            },
        })

        if (!existing) {
            throw new NotFoundError('Favorite')
        }

        // Delete favorite
        await prisma.favorites.delete({
            where: {
                userId_dramaId: {
                    userId: session.user.id,
                    dramaId,
                },
            },
        })

        // Audit log
        await logAuditEvent({
            userId: session.user.id,
            action: 'favorites_remove',
            metadata: { dramaId },
        })

        logger.info({
            type: 'api_response',
            endpoint: '/api/user/favorites',
            method: 'DELETE',
            userId: session.user.id,
            dramaId,
        })

        return successResponse({ deleted: true })
    } catch (error) {
        return handleApiError(error, { endpoint: '/api/user/favorites' })
    }
}

export const dynamic = 'force-dynamic'
