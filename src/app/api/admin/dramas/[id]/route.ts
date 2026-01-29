/**
 * Admin Drama Detail API - Update & Delete Operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { handleApiError, successResponse } from '@/lib/api-error'
import { logger } from '@/lib/logger'
import {
    findDramaById,
    findDramaIndex,
    getAdminDramas,
    updateDramaAt,
    removeDramaAt,
    type AdminDrama,
} from '@/lib/admin-store'

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET - Get single drama by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const drama = findDramaById(id)

        if (!drama) {
            return NextResponse.json(
                { success: false, error: 'Drama not found' },
                { status: 404 }
            )
        }

        return successResponse(drama)
    } catch (error) {
        return handleApiError(error, { endpoint: '/api/admin/dramas/[id]' })
    }
}

// PUT - Update drama
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const body = await request.json()
        const dramas = getAdminDramas()
        const index = findDramaIndex(id)

        if (index === -1) {
            return NextResponse.json(
                { success: false, error: 'Drama not found' },
                { status: 404 }
            )
        }

        const updatedDrama: AdminDrama = {
            ...dramas[index],
            ...body,
            id: dramas[index].id, // Prevent ID change
            createdAt: dramas[index].createdAt, // Preserve original
            updatedAt: new Date(),
        }

        updateDramaAt(index, updatedDrama)

        logger.info({
            type: 'admin_action',
            action: 'update_drama',
            dramaId: id,
        })

        return successResponse(updatedDrama)
    } catch (error) {
        return handleApiError(error, { endpoint: '/api/admin/dramas/[id]' })
    }
}

// DELETE - Delete drama
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const index = findDramaIndex(id)

        if (index === -1) {
            return NextResponse.json(
                { success: false, error: 'Drama not found' },
                { status: 404 }
            )
        }

        const deleted = removeDramaAt(index)

        logger.info({
            type: 'admin_action',
            action: 'delete_drama',
            dramaId: id,
            title: deleted.title,
        })

        return successResponse({ message: 'Drama deleted successfully', id })
    } catch (error) {
        return handleApiError(error, { endpoint: '/api/admin/dramas/[id]' })
    }
}
