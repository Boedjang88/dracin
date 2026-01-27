import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { DramaGrid } from '@/components/home/drama-grid'
import { Bookmark } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function WatchlistPage() {
    const session = await auth()
    const user = session?.user

    if (!user?.id) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center gap-6 text-center">
                <div className="p-4 bg-zinc-900 rounded-full">
                    <Bookmark size={48} className="text-zinc-500" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Sign in to view your watchlist</h2>
                    <p className="text-zinc-400">Keep track of shows you want to watch</p>
                </div>
                <Link href="/auth">
                    <Button size="lg" className="font-semibold">
                        Sign In
                    </Button>
                </Link>
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
