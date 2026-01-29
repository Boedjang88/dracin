'use client'

import { useEffect, useState, use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Play, Plus, Share2, Star, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDominantColor } from '@/hooks/use-dominant-color'
import { cn } from '@/lib/utils'

interface Episode {
    id: string
    title: string
    thumbnail: string
    duration: number
    episodeNumber: number
}

interface Drama {
    id: string
    title: string
    description: string
    posterUrl: string
    bannerUrl: string
    tags: string[]
    vibe: string
    releaseYear: number
    totalEpisodes: number
    episodes: Episode[]
    cast: { name: string, role: string, image?: string }[]
    isInWatchlist: boolean
    continueWatchingEpisodeId?: string | null
}

interface DramaPageProps {
    params: Promise<{ id: string }>
    isModal?: boolean
}

export default function DramaPage({ params, isModal = false }: DramaPageProps) {
    const { id } = use(params)
    const [drama, setDrama] = useState<Drama | null>(null)
    const [loading, setLoading] = useState(true)

    // Use dynamic accent color from poster (defaults to white if loading)
    const accentColor = useDominantColor(drama?.posterUrl || '')

    // Set CSS variable for accent color
    useEffect(() => {
        if (accentColor) {
            document.documentElement.style.setProperty('--drama-accent', accentColor)
        }
        return () => {
            document.documentElement.style.removeProperty('--drama-accent')
        }
    }, [accentColor])

    useEffect(() => {
        async function fetchDrama() {
            try {
                const res = await fetch(`/api/dramas/${id}`)
                const data = await res.json()
                if (data.success) {
                    setDrama(data.data)
                }
            } catch (error) {
                console.error('Failed to fetch drama', error)
            } finally {
                setLoading(false)
            }
        }
        fetchDrama()
    }, [id])

    if (loading) {
        return (
            <div className={cn("flex items-center justify-center p-12 text-white", isModal && "h-[80vh]")}>
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
            </div>
        )
    }

    if (!drama) return null

    const buttonBgColor = accentColor !== '#ffffff' ? accentColor : 'white'

    return (
        <div className={cn(
            "relative overflow-hidden bg-black text-white",
            isModal ? "h-[85vh] w-full overflow-y-auto rounded-xl" : "min-h-screen"
        )}>
            {/* Banner Background */}
            <div className="relative h-[400px] w-full">
                <Image
                    src={drama.bannerUrl}
                    alt={drama.title}
                    fill
                    className="object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            </div>

            <div className="relative -mt-32 px-6 pb-12 sm:px-12">
                <div className={cn("flex flex-col gap-8", !isModal && "md:flex-row")}>
                    {/* Poster - Hide in Modal */}
                    {!isModal && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex-shrink-0"
                        >
                            <div className="relative aspect-[2/3] w-48 overflow-hidden rounded-lg shadow-2xl sm:w-64">
                                <Image
                                    src={drama.posterUrl}
                                    alt={drama.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* Details */}
                    <div className={cn("flex-1 space-y-6 pt-8", !isModal && "md:pt-32", isModal && "mt-16")}>
                        <div className="space-y-2">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="flex flex-wrap gap-2"
                            >
                                <span className="rounded bg-white/20 px-2 py-0.5 text-xs font-semibold backdrop-blur-sm text-drama-accent">
                                    {drama.vibe}
                                </span>
                                <span className="rounded bg-white/10 px-2 py-0.5 text-xs text-zinc-300">
                                    {drama.releaseYear}
                                </span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-4xl font-bold tracking-tight sm:text-5xl"
                            >
                                {drama.title}
                            </motion.h1>

                            <div className="flex items-center gap-4 text-sm text-zinc-400">
                                <span className="flex items-center gap-1">
                                    <Star size={14} className="text-yellow-500" fill="currentColor" /> 4.9
                                </span>
                                <span>•</span>
                                <span>{drama.episodes.length} Episodes</span>
                            </div>
                        </div>

                        <p className="max-w-2xl text-lg leading-relaxed text-zinc-300">
                            {drama.description}
                        </p>

                        <div className="flex flex-wrap gap-3">
                            <Link href={drama.continueWatchingEpisodeId ? `/watch/${drama.continueWatchingEpisodeId}` : '#'}>
                                <Button
                                    size="lg"
                                    className="gap-2 text-black hover:opacity-90 transition-opacity"
                                    style={{ backgroundColor: buttonBgColor }}
                                    disabled={!drama.continueWatchingEpisodeId}
                                >
                                    <Play size={20} fill="currentColor" />
                                    {drama.continueWatchingEpisodeId && drama.episodes.find(e => e.id === drama.continueWatchingEpisodeId)?.episodeNumber === 1 ? 'Start Watching' : 'Resume Playing'}
                                </Button>
                            </Link>
                            <WatchlistButton dramaId={drama.id} initialInWatchlist={drama.isInWatchlist} />
                            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                                <Share2 size={20} />
                            </Button>
                        </div>

                        {/* Episodes List */}
                        <div className="pt-8">
                            <h3 className="mb-4 text-xl font-semibold">Episodes</h3>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {drama.episodes.map((episode) => (
                                    <Link
                                        key={episode.id}
                                        href={`/watch/${episode.id}`}
                                        className="group flex gap-3 rounded-lg border border-white/5 bg-white/5 p-2 transition-colors hover:border-white/10 hover:bg-white/10"
                                    >
                                        <div className="relative aspect-video w-32 flex-shrink-0 overflow-hidden rounded-md bg-black">
                                            <Image
                                                src={episode.thumbnail}
                                                alt={episode.title}
                                                fill
                                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 bg-black/40">
                                                <Play size={20} fill="white" className="text-white" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <span className="text-sm font-medium text-white group-hover:text-primary">
                                                Episode {episode.episodeNumber}
                                            </span>
                                            <span className="text-xs text-zinc-400">
                                                {Math.floor(episode.duration / 60)}m
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="h-10" /> {/* Spacer */}
                    </div>
                </div>
            </div>
        </div>
    )
}

function WatchlistButton({ dramaId, initialInWatchlist }: { dramaId: string, initialInWatchlist: boolean }) {
    const [isInWatchlist, setIsInWatchlist] = useState(initialInWatchlist)
    const [isLoading, setIsLoading] = useState(false)

    async function toggleWatchlist() {
        if (isLoading) return

        // Optimistic update
        const newState = !isInWatchlist
        setIsInWatchlist(newState)
        setIsLoading(true)

        try {
            if (newState) {
                // Add to favorites
                const res = await fetch('/api/user/favorites', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ dramaId })
                })
                if (!res.ok) {
                    setIsInWatchlist(!newState)
                }
            } else {
                // Remove from favorites
                const res = await fetch(`/api/user/favorites?dramaId=${dramaId}`, {
                    method: 'DELETE'
                })
                if (!res.ok) {
                    setIsInWatchlist(!newState)
                }
            }
        } catch (error) {
            setIsInWatchlist(!newState)
            console.error('Error toggling watchlist:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            variant="outline"
            size="lg"
            className={cn(
                "gap-2 border-white/20 bg-white/5 hover:bg-white/10 transition-all",
                isInWatchlist && "bg-white/20 border-white/40 text-white"
            )}
            onClick={toggleWatchlist}
            disabled={isLoading}
        >
            {isInWatchlist ? <Check size={20} /> : <Plus size={20} />}
            {isInWatchlist ? 'In Watchlist' : 'Watchlist'}
        </Button>
    )
}
