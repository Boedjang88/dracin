/**
 * Profile Page
 * 
 * Aggregates user information, watch history, and favorites.
 * Protected route - requires authentication.
 */

import { auth, signOut } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { videoProvider } from '@/lib/services/video-provider'
import Image from 'next/image'
import Link from 'next/link'
import { LogOut, User, History, Bookmark, ChevronRight, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DramaGrid } from '@/components/home/drama-grid'
import { ContinueWatchingRow } from '@/components/home/continue-watching-row'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
    const session = await auth()

    if (!session?.user?.id) {
        redirect('/auth')
    }

    const user = session.user

    // Fetch user data in parallel
    const [favorites, history, progress] = await Promise.all([
        // Favorites (Limit 6)
        prisma.favorites.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 6,
        }),
        // Watch History (Limit 6)
        prisma.watchHistory.findMany({
            where: { userId: user.id },
            orderBy: { watchedAt: 'desc' },
            take: 6,
        }),
        // Continue Watching
        prisma.userProgress.findMany({
            where: { userId: user.id, completed: false },
            orderBy: { updatedAt: 'desc' },
            take: 10,
        }),
    ])

    // Fetch drama details for Favorites
    const favoriteDramas = await Promise.all(
        favorites.map(async (fav) => {
            const drama = await videoProvider.getDramaById(fav.dramaId)
            if (!drama) return null
            return {
                ...drama,
                tags: drama.genres,
                vibe: drama.vibe || 'Modern',
                releaseYear: drama.releaseYear,
                totalEpisodes: drama.totalEpisodes,
                // Adapt to DramaGrid format
            }
        })
    )

    // Fetch details for Continue Watching
    const continueWatchingItems = await Promise.all(
        progress.map(async (p) => {
            const drama = await videoProvider.getDramaById(p.dramaId)
            if (!drama) return null
            const episodes = await videoProvider.getEpisodes(p.dramaId)
            const episode = episodes.find(e => e.id === p.episodeId)

            return {
                id: drama.id,
                episodeId: p.episodeId,
                title: drama.title,
                description: drama.description,
                posterUrl: drama.posterUrl,
                bannerUrl: drama.bannerUrl,
                tags: drama.genres,
                vibe: drama.vibe || 'Modern',
                progress: p.duration > 0 ? Math.round((p.currentTime / p.duration) * 100) : 0,
                episodeTitle: episode?.title || `Episode`,
                episodeNumber: episode?.episodeNumber || 1,
                lastPosition: p.currentTime,
                duration: p.duration
            }
        })
    )

    const validFavorites = favoriteDramas.filter((d): d is NonNullable<typeof d> => d !== null)
    const validContinueWatching = continueWatchingItems.filter((i): i is NonNullable<typeof i> => i !== null)

    return (
        <div className="min-h-screen pb-20">
            {/* Header Profile Section */}
            <div className="relative pt-24 pb-12 px-6 sm:px-12 bg-zinc-900/50 border-b border-white/5">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden bg-zinc-800 ring-4 ring-white/10">
                        {user.image ? (
                            <Image src={user.image} alt={user.name || 'User'} fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-500">
                                <User size={40} />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 text-center sm:text-left space-y-2">
                        <h1 className="text-3xl font-bold text-white">{user.name}</h1>
                        <p className="text-zinc-400">{user.email}</p>
                        <div className="flex gap-3 justify-center sm:justify-start pt-2">
                            <form action={async () => {
                                'use server'
                                await signOut()
                            }}>
                                <Button variant="outline" className="gap-2 border-white/10 hover:bg-white/10">
                                    <LogOut size={16} />
                                    Sign Out
                                </Button>
                            </form>
                            <Button variant="ghost" className="gap-2 text-zinc-400 hover:text-white">
                                <Settings size={16} />
                                Settings
                            </Button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="flex gap-4 sm:ml-auto mt-6 sm:mt-0">
                        <div className="px-6 py-4 rounded-xl bg-white/5 border border-white/5 text-center min-w-[100px]">
                            <div className="text-2xl font-bold text-white">{history.length}</div>
                            <div className="text-xs text-zinc-400 uppercase tracking-wider">Watched</div>
                        </div>
                        <div className="px-6 py-4 rounded-xl bg-white/5 border border-white/5 text-center min-w-[100px]">
                            <div className="text-2xl font-bold text-white">{favorites.length}</div>
                            <div className="text-xs text-zinc-400 uppercase tracking-wider">List</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 sm:px-12 space-y-12 mt-12">
                {/* Continue Watching */}
                {validContinueWatching.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-xl font-semibold text-white">Continue Watching</h2>
                        </div>
                        <div className="-mx-6 sm:-mx-12">
                            <ContinueWatchingRow items={validContinueWatching} />
                        </div>
                    </section>
                )}

                {/* Favorites Preview */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Bookmark className="text-emerald-500" size={24} />
                            <h2 className="text-xl font-semibold text-white">My List</h2>
                        </div>
                        <Link href="/watchlist" className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white transition-colors">
                            View All <ChevronRight size={16} />
                        </Link>
                    </div>
                    {validFavorites.length > 0 ? (
                        <DramaGrid dramas={validFavorites} />
                    ) : (
                        <div className="py-12 text-center text-zinc-500 border border-dashed border-white/10 rounded-xl">
                            Your list is empty
                        </div>
                    )}
                </section>

                {/* History Preview Button */}
                <section>
                    <Link
                        href="/history"
                        className="flex items-center justify-between p-6 rounded-xl bg-zinc-900/50 border border-white/5 hover:bg-zinc-900 transition-colors group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/10 rounded-full text-zinc-300 group-hover:text-white group-hover:bg-primary transition-colors">
                                <History size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">Watch History</h3>
                                <p className="text-sm text-zinc-400">View all {history.length} watched episodes</p>
                            </div>
                        </div>
                        <ChevronRight size={24} className="text-zinc-500 group-hover:text-white" />
                    </Link>
                </section>
            </div>
        </div>
    )
}
