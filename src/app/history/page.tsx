import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { History, Play, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

function formatDuration(seconds: number) {
    const min = Math.floor(seconds / 60)
    const sec = seconds % 60
    return `${min}:${sec.toString().padStart(2, '0')}`
}

function getProgressPercentage(current: number, total: number) {
    if (total === 0) return 0
    return Math.min(100, (current / total) * 100)
}

export default async function HistoryPage() {
    const user = await prisma.user.findFirst()

    if (!user) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
                <h2 className="text-xl font-semibold text-zinc-400">Please sign in to view history</h2>
            </div>
        )
    }

    const history = await prisma.watchHistory.findMany({
        where: { userId: user.id },
        include: {
            episode: {
                include: {
                    drama: true
                }
            }
        },
        orderBy: { updatedAt: 'desc' }
    })

    // Group by Drama? Or just list episodes. Let's list episodes like YouTube history.

    return (
        <div className="min-h-screen p-6 space-y-8">
            <div className="flex items-center gap-2">
                <History size={24} className="text-white" />
                <h1 className="text-2xl font-bold text-white">Watch History</h1>
            </div>

            {history.length === 0 ? (
                <div className="flex h-[40vh] flex-col items-center justify-center gap-2 text-zinc-500">
                    <History size={48} strokeWidth={1} />
                    <p>No watch history yet</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {history.map((item) => {
                        const progress = getProgressPercentage(item.lastPosition, item.episode.duration)
                        return (
                            <Link
                                key={item.id}
                                href={`/watch/${item.episodeId}`}
                                className="group relative flex flex-col gap-2 rounded-lg bg-white/5 p-3 transition-colors hover:bg-white/10"
                            >
                                {/* Thumbnail */}
                                <div className="relative aspect-video w-full overflow-hidden rounded-md bg-zinc-900">
                                    <Image
                                        src={item.episode.thumbnail}
                                        alt={item.episode.title}
                                        fill
                                        className="object-cover transition-transform group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                                        <Play size={32} className="fill-white text-white drop-shadow-lg" />
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
                                        <div
                                            // eslint-disable-next-line react-dom/no-unsafe-read-inline-style
                                            style={{ width: `${progress}%` }}
                                            className="h-full bg-red-600"
                                        />
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex flex-col gap-1">
                                    <h3 className="font-medium text-white line-clamp-1 group-hover:text-primary">
                                        {item.episode.drama.title}
                                    </h3>
                                    <p className="text-sm text-zinc-400 line-clamp-1">
                                        Ep {item.episode.episodeNumber}: {item.episode.title}
                                    </p>
                                    <span className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                                        <Clock size={12} />
                                        {formatDuration(item.lastPosition)} / {formatDuration(item.episode.duration)}
                                    </span>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
