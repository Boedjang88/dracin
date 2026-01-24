import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
    params: Promise<{ id: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params

        const drama = await prisma.drama.findUnique({
            where: { id },
            include: {
                episodes: {
                    orderBy: { episodeNumber: 'asc' }
                },
                _count: {
                    select: { episodes: true }
                }
            }
        })

        if (!drama) {
            return NextResponse.json(
                { success: false, error: 'Drama not found' },
                { status: 404 }
            )
        }

        // Check watchlist and history status
        const user = await prisma.user.findFirst()
        let isInWatchlist = false
        let continueWatchingEpisodeId: string | null = null

        if (user) {
            // Check watchlist
            const watchlistEntry = await prisma.watchlist.findUnique({
                where: {
                    userId_dramaId: {
                        userId: user.id,
                        dramaId: drama.id
                    }
                }
            })
            isInWatchlist = !!watchlistEntry

            // Check history to find last watched episode
            const history = await prisma.watchHistory.findFirst({
                where: {
                    userId: user.id,
                    episode: {
                        dramaId: drama.id
                    }
                },
                orderBy: {
                    updatedAt: 'desc'
                }
            })

            if (history) {
                continueWatchingEpisodeId = history.episodeId
            }
        }

        // If no history, default to first episode
        if (!continueWatchingEpisodeId && drama.episodes.length > 0) {
            continueWatchingEpisodeId = drama.episodes[0].id
        }

        return NextResponse.json({
            success: true,
            data: { ...drama, isInWatchlist, continueWatchingEpisodeId }
        })
    } catch (error) {
        console.error('Error fetching drama:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch drama' },
            { status: 500 }
        )
    }
}
