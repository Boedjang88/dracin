/* hint-disable no-inline-styles */
'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Plus, ChevronLeft, ChevronRight, ThumbsUp, ChevronDown, ArrowRight } from 'lucide-react'
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

interface DramaRowProps {
    title: string
    dramas: Drama[]
    icon?: React.ReactNode
    variant?: 'standard' | 'banner'
    bannerImage?: string
    bannerColor?: string
}

export function DramaRow({ title, dramas, icon, variant = 'standard', bannerImage, bannerColor }: DramaRowProps) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [showLeftArrow, setShowLeftArrow] = useState(false)
    const [showRightArrow, setShowRightArrow] = useState(true)

    const handleScroll = () => {
        if (!scrollRef.current) return
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
        setShowLeftArrow(scrollLeft > 20)
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20)
    }

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return
        const scrollAmount = scrollRef.current.clientWidth * 0.8
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        })
    }

    if (dramas.length === 0) return null

    if (variant === 'banner') {
        return (
            <section className="relative group/row my-12 overflow-hidden">
                {/* Banner Background */}
                <div className="absolute inset-0 z-0">
                    {bannerImage && (
                        <Image
                            src={bannerImage}
                            alt={title}
                            fill
                            className="object-cover opacity-60 blur-3xl scale-125"
                        />
                    )}
                    <div
                        className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"
                        // eslint-disable-next-line react-dom/no-unsafe-read-inline-style
                        style={bannerColor ? { background: `linear-gradient(to right, #0a0a0a 20%, ${bannerColor} 100%)`, opacity: 0.3 } : undefined}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row gap-8 px-6 sm:px-12 py-12 items-center md:items-start">
                    {/* Header Left Area */}
                    <div className="w-full md:w-64 flex-shrink-0 space-y-4 pt-4">
                        {/* eslint-disable-next-line react-dom/no-unsafe-read-inline-style */}
                        <div className="h-1 w-12 bg-white rounded-full mb-4" style={{ backgroundColor: bannerColor }} />
                        <h2 className="text-4xl font-bold text-white leading-tight tracking-tight">
                            {title}
                        </h2>
                        <p className="text-zinc-300 text-sm">
                            Explore our curated collection of {title.toLowerCase()}.
                        </p>
                        {/* eslint-disable-next-line react-dom/no-unsafe-read-inline-style */}
                        <Link href="/browse" className="inline-flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all" style={{ color: bannerColor || 'white' }}>
                            View All <ArrowRight size={16} />
                        </Link>
                    </div>

                    {/* Scrollable Container */}
                    <div className="flex-1 min-w-0 w-full relative group/scroll">
                        <button
                            onClick={() => scroll('left')}
                            aria-label="Scroll left"
                            className={cn(
                                "absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center -ml-6 border border-white/10",
                                "opacity-0 group-hover/scroll:opacity-100 transition-opacity duration-300 hover:bg-black/70",
                                !showLeftArrow && "hidden"
                            )}
                        >
                            <ChevronLeft size={24} className="text-white" />
                        </button>

                        <div
                            ref={scrollRef}
                            onScroll={handleScroll}
                            className="flex gap-4 overflow-x-auto scrollbar-none pb-12 pt-4 px-4 -mx-4"
                        >
                            {dramas.map((drama, index) => (
                                <DramaCard key={drama.id} drama={drama} index={index} />
                            ))}
                        </div>

                        <button
                            onClick={() => scroll('right')}
                            aria-label="Scroll right"
                            className={cn(
                                "absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center -mr-6 border border-white/10",
                                "opacity-0 group-hover/scroll:opacity-100 transition-opacity duration-300 hover:bg-black/70",
                                !showRightArrow && "hidden"
                            )}
                        >
                            <ChevronRight size={24} className="text-white" />
                        </button>
                    </div>
                </div>
            </section>
        )
    }

    // Standard Variant (Original)
    return (
        <section className="relative group/row my-8">
            {/* Section Header */}
            <div className="flex items-center gap-3 px-6 sm:px-12 mb-4">
                {icon}
                <h2 className="text-xl font-semibold text-white group-hover/row:text-zinc-100 transition-colors">{title}</h2>
                <Link
                    href="/browse"
                    className="ml-auto text-xs font-semibold text-zinc-400 opacity-0 group-hover/row:opacity-100 -translate-x-4 group-hover/row:translate-x-0 transition-all duration-300 hover:text-white"
                >
                    Explore All
                </Link>
            </div>

            {/* Scroll Container */}
            <div className="relative">
                {/* Left Arrow */}
                <button
                    onClick={() => scroll('left')}
                    className={cn(
                        "absolute left-0 top-0 bottom-0 z-20 w-12 bg-black/50 flex items-center justify-center",
                        "opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 hover:bg-black/70",
                        !showLeftArrow && "hidden"
                    )}
                    aria-label="Scroll left"
                >
                    <ChevronLeft size={32} className="text-white" />
                </button>

                {/* Drama Cards Container */}
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex gap-2 overflow-x-auto scrollbar-none px-6 sm:px-12 py-8 -my-8"
                >
                    {dramas.map((drama, index) => (
                        <DramaCard key={drama.id} drama={drama} index={index} />
                    ))}
                </div>

                {/* Right Arrow */}
                <button
                    onClick={() => scroll('right')}
                    className={cn(
                        "absolute right-0 top-0 bottom-0 z-20 w-12 bg-black/50 flex items-center justify-center",
                        "opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 hover:bg-black/70",
                        !showRightArrow && "hidden"
                    )}
                    aria-label="Scroll right"
                >
                    <ChevronRight size={32} className="text-white" />
                </button>
            </div>
        </section>
    )
}

function DramaCard({ drama, index }: { drama: Drama; index: number }) {
    const [isHovered, setIsHovered] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout>(null)

    const handleMouseEnter = () => {
        timeoutRef.current = setTimeout(() => {
            setIsHovered(true)
        }, 500) // 500ms delay before expanding
    }

    const handleMouseLeave = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        setIsHovered(false)
    }

    return (
        <div
            className="relative flex-shrink-0 w-[160px] sm:w-[200px] aspect-[2/3] transition-all duration-300 z-0 hover:z-30"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <motion.div
                layout
                initial={false}
                animate={{
                    scale: isHovered ? 1.4 : 1,
                    y: isHovered ? -50 : 0,
                    boxShadow: isHovered ? "0 25px 50px -12px rgba(0, 0, 0, 0.75)" : "none"
                }}
                transition={{ duration: 0.3, type: "tween", ease: "easeInOut" }}
                className={cn(
                    "absolute top-0 left-0 w-full h-full rounded-md overflow-hidden bg-zinc-900 origin-center",
                    isHovered ? "rounded-lg ring-1 ring-white/20" : ""
                )}
            >
                <Link href={`/drama/${drama.id}`} className="block h-full w-full relative">
                    <Image
                        src={drama.posterUrl}
                        alt={drama.title}
                        fill
                        className="object-cover"
                    />

                    {/* Dark Overlay on Hover */}
                    <div className={cn(
                        "absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent transition-opacity duration-300",
                        isHovered ? "opacity-100" : "opacity-0"
                    )} />

                    {/* Content visible only on hover */}
                    <AnimatePresence>
                        {isHovered && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col justify-end p-4 space-y-3"
                            >
                                {/* Action Buttons */}
                                <div className="flex items-center gap-2">
                                    <button className="h-8 w-8 rounded-full bg-white flex items-center justify-center hover:bg-white/90 transition-colors shadow-lg" aria-label="Play">
                                        <Play size={16} fill="black" className="text-black ml-0.5" />
                                    </button>
                                    <button className="h-8 w-8 rounded-full border-2 border-zinc-400 flex items-center justify-center hover:border-white hover:bg-white/10 transition-colors" aria-label="Add">
                                        <Plus size={16} className="text-white" />
                                    </button>
                                    <button className="h-8 w-8 rounded-full border-2 border-zinc-400 flex items-center justify-center hover:border-white hover:bg-white/10 transition-colors" aria-label="Like">
                                        <ThumbsUp size={14} className="text-white" />
                                    </button>
                                    <div className="flex-1" />
                                    <button className="h-8 w-8 rounded-full border-2 border-zinc-400 flex items-center justify-center hover:border-white hover:bg-white/10 transition-colors" aria-label="More Info">
                                        <ChevronDown size={16} className="text-white" />
                                    </button>
                                </div>

                                {/* Metadata */}
                                <div className="space-y-1">
                                    <h3 className="font-bold text-white leading-tight drop-shadow-md">{drama.title}</h3>

                                    <div className="flex items-center gap-2 text-[10px] font-semibold">
                                        <span className="text-green-400">98% Match</span>
                                        <span className="text-zinc-400 border border-zinc-600 px-1 rounded-sm">13+</span>
                                        <span className="text-zinc-400">{drama._count?.episodes || drama.totalEpisodes} Eps</span>
                                    </div>

                                    {/* Genres */}
                                    <div className="flex flex-wrap gap-1 pt-1">
                                        {drama.tags.slice(0, 3).map((tag, i) => (
                                            <span key={tag} className="text-[10px] text-zinc-300">
                                                {tag}{i < 2 && <span className="text-zinc-600 mx-1">•</span>}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Link>
            </motion.div>
        </div>
    )
}

// Top 10 Row with numbers
interface Top10RowProps {
    title: string
    dramas: Drama[]
}

export function Top10Row({ title, dramas }: Top10RowProps) {
    const scrollRef = useRef<HTMLDivElement>(null)

    return (
        <section className="relative my-10">
            <div className="flex items-center gap-3 px-6 sm:px-12 mb-4">
                <h2 className="text-xl font-semibold text-white">{title}</h2>
            </div>

            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto scrollbar-none px-6 sm:px-12 pb-8 -my-4"
            >
                {dramas.slice(0, 10).map((drama, index) => (
                    <div key={drama.id} className="flex-shrink-0 flex items-end group">
                        {/* Large Number */}
                        <span className="text-[140px] font-black leading-none text-transparent top10-number group-hover:scale-105 transition-transform duration-300 origin-bottom-right z-0">
                            {index + 1}
                        </span>

                        {/* Poster */}
                        <div className="z-10 -ml-4 mb-2">
                            <DramaCard drama={drama} index={index} />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
