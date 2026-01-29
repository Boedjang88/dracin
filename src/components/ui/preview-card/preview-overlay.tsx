'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePreviewStore } from '@/store/preview-store'
import Image from 'next/image'
import { Play, Plus, ThumbsUp, ChevronDown, Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export function PreviewOverlay() {
    const { item, position, isHovering, setHovering, setPreview } = usePreviewStore()
    const [videoReady, setVideoReady] = useState(false)
    const [muted, setMuted] = useState(true)
    const timeoutRef = useRef<NodeJS.Timeout>(null)

    // Clear preview when mouse leaves the overlay
    const handleMouseLeave = () => {
        setHovering(false)
        setPreview(null, null)
    }

    if (!item || !position || !isHovering) return null

    // Calculate expanded size (1.5x)
    const expandedWidth = position.width * 1.5
    const expandedHeight = (expandedWidth / 2) * 3 // Keep 2:3 aspect check? No, usually landscape for video.
    // Netflix style: Portrait card -> Landscape video preview? Or keep portrait?
    // User asked for "video yang jalan". Video is usually landscape.
    // But content is portrait posters.
    // Let's transform to a larger card. If we do landscape video, we crop the poster or overlay.
    // Let's stick to expanded portrait for now to match the "scale up" feel, but crop video to cover.

    // Adjust position to keep centered relative to original, but ensure on screen
    const top = position.top - 20 // Move up a bit
    const left = position.left - (expandedWidth - position.width) / 2

    return (
        <div
            className="fixed inset-0 z-50 pointer-events-none"
            style={{ zIndex: 100 }}
        >
            <motion.div
                layoutId={`preview-${item.id}`} // Optional layout transition
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="absolute bg-zinc-900 rounded-lg shadow-2xl overflow-hidden pointer-events-auto ring-1 ring-white/10"
                style={{
                    top: top,
                    left: left,
                    width: expandedWidth,
                    height: expandedHeight,
                    transformOrigin: 'center center'
                }}
                onMouseLeave={handleMouseLeave}
            >
                {/* Video / Image Area */}
                <div className="relative w-full h-full">
                    <Image
                        src={item.posterUrl}
                        alt={item.title}
                        fill
                        className={cn("object-cover transition-opacity duration-500", videoReady ? "opacity-0" : "opacity-100")}
                    />

                    <video
                        src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
                        className={cn(
                            "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
                            videoReady ? "opacity-100" : "opacity-0"
                        )}
                        autoPlay
                        muted={muted}
                        loop
                        playsInline
                        onPlay={() => setVideoReady(true)}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                    {/* Mute Toggle */}
                    <button
                        onClick={() => setMuted(!muted)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white/70 hover:text-white hover:bg-black/70 transition-colors z-20"
                        aria-label={muted ? "Unmute" : "Mute"}
                    >
                        {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    </button>

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            <Link href={`/watch/${item.id}`} className="h-8 w-8 rounded-full bg-white flex items-center justify-center hover:bg-white/90 transition-colors shadow-lg">
                                <Play size={16} fill="black" className="text-black ml-0.5" />
                            </Link>
                            <button className="h-8 w-8 rounded-full border-2 border-zinc-500 flex items-center justify-center hover:border-white hover:bg-white/10 transition-colors text-zinc-300 hover:text-white" aria-label="Add to My List">
                                <Plus size={16} />
                            </button>
                            <button className="h-8 w-8 rounded-full border-2 border-zinc-500 flex items-center justify-center hover:border-white hover:bg-white/10 transition-colors text-zinc-300 hover:text-white" aria-label="Like">
                                <ThumbsUp size={14} />
                            </button>
                            <div className="flex-1" />
                            <Link href={`/drama/${item.id}`} className="h-8 w-8 rounded-full border-2 border-zinc-500 flex items-center justify-center hover:border-white hover:bg-white/10 transition-colors text-zinc-300 hover:text-white">
                                <ChevronDown size={16} />
                            </Link>
                        </div>

                        {/* Metadata */}
                        <div>
                            <h3 className="font-bold text-white leading-tight drop-shadow-md line-clamp-1">{item.title}</h3>
                            <div className="flex items-center gap-2 text-[10px] font-semibold mt-1">
                                <span className="text-green-400">98% Match</span>
                                <span className="text-zinc-400 border border-zinc-600 px-1 rounded-sm">13+</span>
                                <span className="text-zinc-400">{item.totalEpisodes || '?'} Eps</span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {item.tags.slice(0, 2).map((tag, i) => (
                                    <span key={i} className="text-[10px] text-zinc-300">
                                        {tag}
                                        {i < 1 && <span className="text-zinc-600 mx-1">•</span>}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
