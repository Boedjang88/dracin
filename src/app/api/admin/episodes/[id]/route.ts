/**
 * Admin Episode Detail API - Update & Delete Operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { handleApiError, successResponse } from '@/lib/api-error'
import { logger } from '@/lib/logger'
import {
    findEpisodeById,
    findEpisodeIndex,
    getAdminEpisodes,
    updateEpisodeAt,
    removeEpisodeAt,
    type AdminEpisode,
} from '@/lib/admin-store'

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET - Get single episode by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const episode = findEpisodeById(id)

        if (!episode) {
            return NextResponse.json(
                { success: false, error: 'Episode not found' },
                { status: 404 }
            )
        }

        return successResponse(episode)
    } catch (error) {
        return handleApiError(error, { endpoint: '/api/admin/episodes/[id]' })
    }
}

// PUT - Update episode
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const body = await request.json()
        const episodes = getAdminEpisodes()
        const index = findEpisodeIndex(id)

        if (index === -1) {
            return NextResponse.json(
                { success: false, error: 'Episode not found' },
                { status: 404 }
            )
        }

        const updatedEpisode: AdminEpisode = {
            ...episodes[index],
            ...body,
            id: episodes[index].id, // Prevent ID change
            dramaId: episodes[index].dramaId, // Prevent drama change
            createdAt: episodes[index].createdAt,
            updatedAt: new Date(),
        }

        updateEpisodeAt(index, updatedEpisode)

        logger.info({
            type: 'admin_action',
            action: 'update_episode',
            episodeId: id,
        })

        return successResponse(updatedEpisode)
    } catch (error) {
        return handleApiError(error, { endpoint: '/api/admin/episodes/[id]' })
    }
}

// DELETE - Delete episode
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const index = findEpisodeIndex(id)

        if (index === -1) {
            return NextResponse.json(
                { success: false, error: 'Episode not found' },
                { status: 404 }
            )
        }

        const deleted = removeEpisodeAt(index)

        logger.info({
            type: 'admin_action',
            action: 'delete_episode',
            episodeId: id,
            dramaId: deleted.dramaId,
        })

        return successResponse({ message: 'Episode deleted successfully', id })
    } catch (error) {
        return handleApiError(error, { endpoint: '/api/admin/episodes/[id]' })
    }
}
