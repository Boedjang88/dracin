'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { CustomPlayer } from '@/components/player/custom-player'
import { usePlayerStore } from '@/store/player-store'
import { ChevronLeft, ChevronRight, ThumbsUp, Share2, Plus, Check } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Episode {
    id: string
    title: string
    thumbnail: string
    videoUrl: string
    duration: number
    episodeNumber: number
    dramaId: string
}

interface Drama {
    id: string
    title: string
    description: string
    posterUrl: string
    episodes: Episode[]
}

export default function WatchPage() {
    const { id } = useParams()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [showInfo, setShowInfo] = useState(false)
    const { setDrama, setEpisode, currentDrama, currentEpisode, setCurrentTime, showControls } = usePlayerStore()

    const { data: session, status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push(`/auth?callbackUrl=/watch/${id}`)
        }
    }, [status, router, id])

    useEffect(() => {
        if (status !== 'authenticated') return

        async function fetchEpisode() {
            try {
                const res = await fetch(`/api/episodes/${id}`)
                const data = await res.json()

                if (data.success) {
                    const episode = data.data
                    const drama = episode.drama

                    setDrama(drama)
                    setEpisode(episode)

                    if (episode.lastPosition > 0) {
                        setCurrentTime(episode.lastPosition)
                    }
                }
            } catch (error) {
                console.error('Failed to fetch episode:', error)
            } finally {
                setIsLoading(false)
            }
        }

        if (id) {
            fetchEpisode()
        }
    }, [id, setDrama, setEpisode, setCurrentTime, status])

    if (status === 'loading' || (status === 'authenticated' && isLoading)) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black z-50">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-white border-t-transparent" />
            </div>
        )
    }

    if (!currentDrama || !currentEpisode) {
        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-black text-white gap-4">
                <p className="text-xl">Episode not found</p>
                <button
                    onClick={() => router.back()}
                    className="px-6 py-2 bg-white text-black rounded-full font-medium hover:bg-white/90"
                >
                    Go Back
                </button>
            </div>
        )
    }

    const currentIndex = currentDrama.episodes.findIndex(ep => ep.id === currentEpisode.id)
    const prevEpisode = currentIndex > 0 ? currentDrama.episodes[currentIndex - 1] : null
    const nextEpisode = currentIndex < currentDrama.episodes.length - 1 ? currentDrama.episodes[currentIndex + 1] : null

    return (
        <div className="fixed inset-0 bg-black text-white overflow-hidden">
            {/* Full-screen video player */}
            <div className="absolute inset-0">
                <CustomPlayer />
            </div>

            {/* Back button overlay - always visible but subtle */}
            <AnimatePresence>
                {showControls && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-4 left-4 z-50"
                    >
                        <button
                            onClick={() => router.push(`/drama/${currentDrama.id}`)}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-md hover:bg-black/70 transition-colors"
                        >
                            <ChevronLeft size={20} />
                            <span className="hidden sm:inline text-sm font-medium">{currentDrama.title}</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Episode info panel - slides up from bottom */}
            <AnimatePresence>
                {showInfo && (
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black via-black/95 to-transparent pt-20 pb-safe"
                    >
                        <div className="max-w-4xl mx-auto px-6 pb-6 space-y-6">
                            {/* Current episode info */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <span className="px-2 py-0.5 bg-white/20 rounded text-xs font-medium">
                                        S1:E{currentEpisode.episodeNumber}
                                    </span>
                                    <span className="text-zinc-400 text-sm">
                                        {Math.floor(currentEpisode.duration / 60)}min
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold">{currentEpisode.title}</h2>
                                <p className="text-zinc-400 text-sm line-clamp-2">
                                    {currentDrama.description}
                                </p>
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-4">
                                <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                                    <ThumbsUp size={18} />
                                    <span className="text-sm">Rate</span>
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                                    <Plus size={18} />
                                    <span className="text-sm">My List</span>
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                                    <Share2 size={18} />
                                    <span className="text-sm">Share</span>
                                </button>
                            </div>

                            {/* Episodes row */}
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold">Episodes</h3>
                                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-none">
                                    {currentDrama.episodes.map((episode) => (
                                        <Link
                                            key={episode.id}
                                            href={`/watch/${episode.id}`}
                                            className={cn(
                                                "flex-shrink-0 w-40 group",
                                                episode.id === currentEpisode.id && "ring-2 ring-white rounded-lg"
                                            )}
                                        >
                                            <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-800">
                                                <Image
                                                    src={episode.thumbnail}
                                                    alt={episode.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform"
                                                />
                                                {episode.id === currentEpisode.id && (
                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                        <div className="w-8 h-8 border-2 border-white rounded-full flex items-center justify-center">
                                                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="mt-2 text-xs text-zinc-400">Episode {episode.episodeNumber}</p>
                                            <p className="text-sm font-medium truncate">{episode.title}</p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle info button */}
            <button
                onClick={() => setShowInfo(!showInfo)}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-colors"
            >
                <span className="text-sm font-medium">
                    {showInfo ? 'Hide Info' : 'Show Episodes'}
                </span>
            </button>

            {/* Next/Prev episode overlays - visible on hover */}
            <AnimatePresence>
                {showControls && prevEpisode && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-30"
                    >
                        <Link
                            href={`/watch/${prevEpisode.id}`}
                            className="flex items-center gap-2 px-4 py-3 bg-black/50 backdrop-blur-md rounded-full hover:bg-black/70 transition-colors"
                        >
                            <ChevronLeft size={24} />
                            <span className="hidden md:inline text-sm">Prev</span>
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showControls && nextEpisode && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-30"
                    >
                        <Link
                            href={`/watch/${nextEpisode.id}`}
                            className="flex items-center gap-2 px-4 py-3 bg-black/50 backdrop-blur-md rounded-full hover:bg-black/70 transition-colors"
                        >
                            <span className="hidden md:inline text-sm">Next</span>
                            <ChevronRight size={24} />
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
