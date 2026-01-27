import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(request: Request) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const skip = (page - 1) * limit

        // Fetch watch history with episode and drama details
        const [historyItems, total] = await Promise.all([
            prisma.watchHistory.findMany({
                where: { userId: session.user.id },
                skip,
                take: limit,
                orderBy: { updatedAt: 'desc' },
                include: {
                    episode: {
                        include: {
                            drama: true
                        }
                    }
                }
            }),
            prisma.watchHistory.count({
                where: { userId: session.user.id }
            })
        ])

        // Format the response with progress percentage
        const formattedHistory = historyItems.map(item => ({
            id: item.id,
            episodeId: item.episodeId,
            episodeNumber: item.episode.episodeNumber,
            episodeTitle: item.episode.title,
            lastPosition: item.lastPosition,
            duration: item.episode.duration,
            progressPercentage: Math.round((item.lastPosition / item.episode.duration) * 100),
            isCompleted: item.isCompleted,
            updatedAt: item.updatedAt,
            drama: item.episode.drama
        }))

        return NextResponse.json({
            success: true,
            data: formattedHistory,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error('Error fetching history:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch history' },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const { episodeId, lastPosition } = await request.json()

        if (!episodeId) {
            return NextResponse.json(
                { success: false, error: 'Episode ID is required' },
                { status: 400 }
            )
        }

        // Mock User for Dev
        const user = await prisma.user.findFirst()
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            )
        }

        // Update or create history
        const history = await prisma.watchHistory.upsert({
            where: {
                userId_episodeId: {
                    userId: user.id,
                    episodeId
                }
            },
            update: {
                lastPosition,
                updatedAt: new Date()
            },
            create: {
                userId: user.id,
                episodeId,
                lastPosition,
                isCompleted: false // Logic for completed could be added here
            }
        })

        return NextResponse.json({ success: true, data: history })

    } catch (error) {
        console.error('History sync error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
