import { prisma } from '@/lib/prisma'
import { DramaGrid } from '@/components/home/drama-grid'
import { Bookmark } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function WatchlistPage() {
    const user = await prisma.user.findFirst()

    if (!user) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
                <h2 className="text-xl font-semibold text-zinc-400">Please sign in to view your watchlist</h2>
            </div>
        )
    }

    const watchlist = await prisma.watchlist.findMany({
        where: { userId: user.id },
        include: {
            drama: {
                include: {
                    _count: {
                        select: { episodes: true }
                    }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    const dramas = watchlist.map(item => ({
        ...item.drama,
        tags: JSON.parse(item.drama.tags) as string[],
        releaseYear: item.drama.releaseYear ?? undefined,
        totalEpisodes: item.drama.totalEpisodes ?? undefined
    }))

    return (
        <div className="min-h-screen p-6 space-y-8">
            <div className="flex items-center gap-2">
                <Bookmark size={24} className="text-white" />
                <h1 className="text-2xl font-bold text-white">Your Watchlist</h1>
            </div>

            {dramas.length === 0 ? (
                <div className="flex h-[40vh] flex-col items-center justify-center gap-2 text-zinc-500">
                    <Bookmark size={48} strokeWidth={1} />
                    <p>Your watchlist is empty</p>
                </div>
            ) : (
                <DramaGrid dramas={dramas} />
            )}
        </div>
    )
}
