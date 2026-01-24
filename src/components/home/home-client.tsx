'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DramaGrid, FeaturedHero } from '@/components/home/drama-grid'
import { DramaGridSkeleton, HeroSkeleton } from '@/components/home/skeleton-loading'
import { Sparkles, TrendingUp, Clock, Heart } from 'lucide-react'

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

interface HomeClientProps {
    initialDramas: Drama[]
}

export default function HomeClient({ initialDramas }: HomeClientProps) {
    const [dramas] = useState<Drama[]>(initialDramas)
    const [isLoading, setIsLoading] = useState(false)

    // In a real app we might fetch more data here or validte initial data
    // But for now since we pass data from RSC, loading is instant

    const featuredDrama = dramas[0]
    const trendingDramas = dramas.slice(0, 6)
    const recentDramas = dramas.slice(0, 6)

    return (
        <div className="min-h-screen p-6 space-y-8">
            {/* Hero Section */}
            <section>
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <HeroSkeleton key="hero-skeleton" />
                    ) : featuredDrama ? (
                        <FeaturedHero key="hero" drama={featuredDrama} />
                    ) : null}
                </AnimatePresence>
            </section>

            {/* Trending Now */}
            <section className="space-y-4">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-2"
                >
                    <TrendingUp size={20} strokeWidth={1.5} className="text-rose-500" />
                    <h2 className="text-lg font-semibold text-white">Trending Now</h2>
                </motion.div>

                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <DramaGridSkeleton key="trending-skeleton" count={6} />
                    ) : (
                        <DramaGrid key="trending" dramas={trendingDramas} />
                    )}
                </AnimatePresence>
            </section>

            {/* Green Flag Picks */}
            <section className="space-y-4">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-2"
                >
                    <Sparkles size={20} strokeWidth={1.5} className="text-emerald-500" />
                    <h2 className="text-lg font-semibold text-white">Green Flag Picks</h2>
                </motion.div>

                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <DramaGridSkeleton key="greenflag-skeleton" count={6} />
                    ) : (
                        <DramaGrid
                            key="greenflag"
                            dramas={dramas.filter(d => d.vibe === 'GreenFlag').slice(0, 6)}
                        />
                    )}
                </AnimatePresence>
            </section>

            {/* Recently Added */}
            <section className="space-y-4">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-2"
                >
                    <Clock size={20} strokeWidth={1.5} className="text-blue-500" />
                    <h2 className="text-lg font-semibold text-white">Recently Added</h2>
                </motion.div>

                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <DramaGridSkeleton key="recent-skeleton" count={6} />
                    ) : (
                        <DramaGrid key="recent" dramas={recentDramas} />
                    )}
                </AnimatePresence>
            </section>

            {/* Heart-Wrenching */}
            <section className="space-y-4 pb-8">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-2"
                >
                    <Heart size={20} strokeWidth={1.5} className="text-pink-500" />
                    <h2 className="text-lg font-semibold text-white">Heart-Wrenching Romances</h2>
                </motion.div>

                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <DramaGridSkeleton key="romance-skeleton" count={6} />
                    ) : (
                        <DramaGrid
                            key="romance"
                            dramas={dramas.filter(d => d.vibe === 'HeartWrenching' || d.vibe === 'ModernRomance').slice(0, 6)}
                        />
                    )}
                </AnimatePresence>
            </section>
        </div>
    )
}
