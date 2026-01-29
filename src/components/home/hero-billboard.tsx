'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Info, VolumeX, Volume2, ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Drama {
    id: string
    title: string
    description: string
    posterUrl: string
    bannerUrl: string
    tags: string[]
    vibe: string
    releaseYear?: number
    totalEpisodes?: number
    _count?: {
        episodes: number
    }
}

interface HeroBillboardProps {
    dramas: Drama[]
}

export function HeroBillboard({ dramas }: HeroBillboardProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isHovered, setIsHovered] = useState(false)
    const [isMuted, setIsMuted] = useState(true)

    // Ensure we have data
    const featuredDramas = dramas.slice(0, 7)
    const currentDrama = featuredDramas[currentIndex]

    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % featuredDramas.length)
    }, [featuredDramas.length])

    const goToPrev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + featuredDramas.length) % featuredDramas.length)
    }, [featuredDramas.length])

    // Auto-rotate with longer duration
    useEffect(() => {
        if (isHovered) return

        const interval = setInterval(goToNext, 5000)
        return () => clearInterval(interval)
    }, [isHovered, goToNext])

    if (!currentDrama) return null

    return (
        <div
            className="group relative w-full h-[95vh] min-h-[600px] overflow-hidden bg-black"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Background Image with Ken Burns effect */}
            <AnimatePresence mode="popLayout">
                <motion.div
                    key={currentDrama.id}
                    initial={{ opacity: 0, scale: 1.15 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="absolute inset-0"
                >
                    <Image
                        src={currentDrama.bannerUrl}
                        alt={currentDrama.title}
                        fill
                        priority
                        className="object-cover"
                    />
                    {/* Vignette & Gradients */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/40 to-transparent opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#000000]/90 via-[#000000]/30 to-transparent" />
                </motion.div>
            </AnimatePresence>

            {/* Content Content - Bottom Left Alignment for Cinematic Feel */}
            <div className="absolute inset-0 flex items-end pb-20 sm:pb-32">
                <div className="w-full max-w-[90rem] mx-auto px-6 sm:px-12 md:px-16">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentDrama.id}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                            className="max-w-3xl space-y-6"
                        >
                            {/* Meta Badge */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="flex items-center gap-3 text-sm font-medium"
                            >
                                <span className="flex items-center gap-1 text-yellow-400">
                                    <Star size={16} fill="currentColor" />
                                    <span>9.8</span>
                                </span>
                                <span className="w-1 h-1 rounded-full bg-zinc-500" />
                                <span className="text-zinc-200">{currentDrama.releaseYear}</span>
                                <span className="w-1 h-1 rounded-full bg-zinc-500" />
                                <span className="text-zinc-200">{currentDrama._count?.episodes || currentDrama.totalEpisodes} Episodes</span>
                                <span className="px-2 py-0.5 border border-white/20 rounded text-xs text-zinc-300 backdrop-blur-sm">HD</span>
                            </motion.div>

                            {/* Title (Big & Bold) */}
                            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-white/95 drop-shadow-2xl">
                                {currentDrama.title}
                            </h1>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 text-sm font-medium text-zinc-300">
                                {currentDrama.tags.slice(0, 3).map((tag, i) => (
                                    <span key={tag} className="flex items-center">
                                        {i > 0 && <span className="mx-2 text-zinc-600">•</span>}
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* Description */}
                            <p className="text-lg md:text-xl text-zinc-300/90 line-clamp-3 leading-relaxed max-w-2xl text-shadow-sm">
                                {currentDrama.description}
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex items-center gap-4 pt-4">
                                <Link href={`/watch/${currentDrama.id}`}>
                                    <button className="flex items-center gap-3 px-8 py-4 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98]">
                                        <Play size={24} fill="currentColor" />
                                        Play Now
                                    </button>
                                </Link>
                                <Link href={`/drama/${currentDrama.id}`}>
                                    <button className="flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl font-bold text-lg text-white transition-all hover:scale-[1.02] active:scale-[0.98]">
                                        <Info size={24} />
                                        More Info
                                    </button>
                                </Link>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Right Side Navigation (Vertical dots + Next Preview) */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-4 z-20">
                {featuredDramas.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={cn(
                            "w-1.5 transition-all duration-300 rounded-full",
                            index === currentIndex
                                ? "h-12 bg-white"
                                : "h-1.5 bg-white/20 hover:bg-white/40"
                        )}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

            {/* Mute button (Cinematic touch) */}
            <div className="absolute bottom-10 right-10 z-20">
                <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-3 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-black/40 transition-all"
                >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
            </div>

            {/* Linear Gradient at bottom to blend with content */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#000000] to-transparent z-10" />
        </div>
    )
}
