/**
 * Admin Episodes API - CRUD Operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { handleApiError, successResponse } from '@/lib/api-error'
import { logger } from '@/lib/logger'
import {
    getAdminEpisodes,
    getEpisodesByDramaId,
    addAdminEpisode,
    findDuplicateEpisode,
    type AdminEpisode,
} from '@/lib/admin-store'

// GET - List episodes (optionally filter by dramaId)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const dramaId = searchParams.get('dramaId')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '50')

        let filtered = dramaId ? getEpisodesByDramaId(dramaId) : getAdminEpisodes()

        // Sort by episode number
        filtered = [...filtered].sort((a, b) => a.episodeNumber - b.episodeNumber)

        const start = (page - 1) * limit
        const end = start + limit
        const paginatedData = filtered.slice(start, end)

        return successResponse({
            data: paginatedData,
            pagination: {
                page,
                limit,
                total: filtered.length,
                totalPages: Math.ceil(filtered.length / limit),
            }
        })
    } catch (error) {
        return handleApiError(error, { endpoint: '/api/admin/episodes' })
    }
}

// POST - Create new episode
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate required fields
        const required = ['dramaId', 'episodeNumber', 'title', 'thumbnail', 'streamUrl', 'duration']
        for (const field of required) {
            if (body[field] === undefined || body[field] === null) {
                return NextResponse.json(
                    { success: false, error: `Missing required field: ${field}` },
                    { status: 400 }
                )
            }
        }

        // Check for duplicate episode number
        const existing = findDuplicateEpisode(body.dramaId, body.episodeNumber)
        if (existing) {
            return NextResponse.json(
                { success: false, error: `Episode ${body.episodeNumber} already exists for this drama` },
                { status: 409 }
            )
        }

        const newEpisode: AdminEpisode = {
            id: `ep-${body.dramaId}-${body.episodeNumber}`,
            dramaId: body.dramaId,
            episodeNumber: body.episodeNumber,
            title: body.title,
            description: body.description,
            thumbnail: body.thumbnail,
            streamUrl: body.streamUrl,
            duration: body.duration,
            releaseDate: body.releaseDate,
            subtitles: body.subtitles || [],
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        addAdminEpisode(newEpisode)

        logger.info({
            type: 'admin_action',
            action: 'create_episode',
            episodeId: newEpisode.id,
            dramaId: newEpisode.dramaId,
            episodeNumber: newEpisode.episodeNumber,
        })

        return successResponse(newEpisode, { status: 201 })
    } catch (error) {
        return handleApiError(error, { endpoint: '/api/admin/episodes' })
    }
}
