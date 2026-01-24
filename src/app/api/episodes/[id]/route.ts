import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const episode = await prisma.episode.findUnique({
            where: { id },
            include: {
                drama: {
                    include: {
                        episodes: {
                            orderBy: { episodeNumber: 'asc' }
                        }
                    }
                }
            }
        })

        if (!episode) {
            return NextResponse.json(
                { success: false, error: 'Episode not found' },
                { status: 404 }
            )
        }

        // Check history for current user (dev mode: first user)
        const user = await prisma.user.findFirst()
        let lastPosition = 0

        if (user) {
            const history = await prisma.watchHistory.findUnique({
                where: {
                    userId_episodeId: {
                        userId: user.id,
                        episodeId: id
                    }
                }
            })
            if (history) {
                lastPosition = history.lastPosition
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                ...episode,
                lastPosition
            }
        })

    } catch (error) {
        console.error('Error fetching episode:', error)
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
