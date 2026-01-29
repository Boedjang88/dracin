/**
 * Admin Dramas API - CRUD Operations
 * 
 * Protected endpoints for managing drama content.
 * In production, this should be protected with admin authentication.
 */

import { NextRequest, NextResponse } from 'next/server'
import { handleApiError, successResponse } from '@/lib/api-error'
import { logger } from '@/lib/logger'
import {
    getAdminDramas,
    addAdminDrama,
    type AdminDrama,
} from '@/lib/admin-store'

// GET - List all admin dramas
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')

        const dramas = getAdminDramas()
        const start = (page - 1) * limit
        const end = start + limit
        const paginatedData = dramas.slice(start, end)

        return successResponse({
            data: paginatedData,
            pagination: {
                page,
                limit,
                total: dramas.length,
                totalPages: Math.ceil(dramas.length / limit),
            }
        })
    } catch (error) {
        return handleApiError(error, { endpoint: '/api/admin/dramas' })
    }
}

// POST - Create new drama
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate required fields
        const required = ['title', 'description', 'posterUrl', 'bannerUrl', 'releaseYear', 'totalEpisodes', 'status', 'country', 'language']
        for (const field of required) {
            if (!body[field]) {
                return NextResponse.json(
                    { success: false, error: `Missing required field: ${field}` },
                    { status: 400 }
                )
            }
        }

        const newDrama: AdminDrama = {
            id: `drama-${Date.now()}`,
            title: body.title,
            originalTitle: body.originalTitle,
            description: body.description,
            posterUrl: body.posterUrl,
            bannerUrl: body.bannerUrl,
            genres: body.genres || [],
            cast: body.cast || [],
            releaseYear: body.releaseYear,
            totalEpisodes: body.totalEpisodes,
            rating: body.rating,
            vibe: body.vibe,
            status: body.status,
            country: body.country,
            language: body.language,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        addAdminDrama(newDrama)

        logger.info({
            type: 'admin_action',
            action: 'create_drama',
            dramaId: newDrama.id,
            title: newDrama.title,
        })

        return successResponse(newDrama, { status: 201 })
    } catch (error) {
        return handleApiError(error, { endpoint: '/api/admin/dramas' })
    }
}
