'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Check } from 'lucide-react'
import { usePlayerStore } from '@/store/player-store'
import { cn } from '@/lib/utils'

export function EpisodeSidebar() {
    const {
        isSidebarOpen,
        setSidebarOpen,
        playlist,
        currentEpisode,
        setEpisode
    } = usePlayerStore()

    const sidebarRef = useRef<HTMLDivElement>(null)

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                setSidebarOpen(false)
            }
        }

        if (isSidebarOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isSidebarOpen, setSidebarOpen])

    return (
        <AnimatePresence>
            {isSidebarOpen && (
                <motion.div
                    ref={sidebarRef}
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                    className="absolute right-0 top-0 bottom-0 z-50 w-80 bg-black/95 backdrop-blur-md border-l border-white/10 shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                        <h3 className="font-semibold text-white">Episodes</h3>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="p-1 rounded-full hover:bg-white/10 transition-colors"
                            aria-label="Close sidebar"
                        >
                            <X size={20} className="text-white" />
                        </button>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
                        {playlist.map((episode) => {
                            const isCurrent = currentEpisode?.id === episode.id
                            // Mock watched status - in real app would check user check history
                            const isWatched = false

                            return (
                                <button
                                    key={episode.id}
                                    onClick={() => setEpisode(episode)}
                                    className={cn(
                                        "group relative flex w-full gap-3 overflow-hidden rounded-lg p-2 text-left transition-all",
                                        isCurrent ? "bg-white/10 ring-1 ring-white/20" : "hover:bg-white/5"
                                    )}
                                >
                                    {/* Thumbnail */}
                                    <div className="relative aspect-video w-32 flex-shrink-0 overflow-hidden rounded-md bg-zinc-800">
                                        <Image
                                            src={episode.thumbnail}
                                            alt={episode.title}
                                            fill
                                            className={cn(
                                                "object-cover transition-opacity",
                                                isCurrent ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                                            )}
                                        />

                                        {/* Playing indicator */}
                                        {isCurrent && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                                <Play size={16} className="text-white fill-white" />
                                            </div>
                                        )}

                                        {/* Duration badge */}
                                        <div className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.5 text-[10px] font-medium text-white">
                                            {Math.floor(episode.duration / 60)}:{(episode.duration % 60).toString().padStart(2, '0')}
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="flex flex-1 flex-col justify-center gap-1">
                                        <span className={cn(
                                            "text-sm font-medium line-clamp-2",
                                            isCurrent ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
                                        )}>
                                            {episode.episodeNumber}. {episode.title}
                                        </span>

                                        {isWatched && (
                                            <span className="flex items-center gap-1 text-xs text-emerald-500">
                                                <Check size={12} /> Watched
                                            </span>
                                        )}
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
