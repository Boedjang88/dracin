import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const vibe = searchParams.get('vibe')
        const search = searchParams.get('search')

        const skip = (page - 1) * limit

        // Build where clause
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {}

        if (vibe) {
            where.vibe = vibe
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { tags: { hasSome: [search] } }
            ]
        }

        // Fetch dramas with pagination
        const [dramas, total] = await Promise.all([
            prisma.drama.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: { episodes: true }
                    }
                }
            }),
            prisma.drama.count({ where })
        ])

        return NextResponse.json({
            success: true,
            data: dramas,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error('Error fetching dramas:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch dramas' },
            { status: 500 }
        )
    }
}
