'use client'

import { useState } from 'react'
import { Sparkles, TrendingUp, Clock, Heart, Swords, Flame } from 'lucide-react'
import { HeroBillboard } from '@/components/home/hero-billboard'
import { DramaRow, Top10Row } from '@/components/home/drama-row'
import { ContinueWatchingRow } from '@/components/home/continue-watching-row'

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
    history?: any[]
}

export default function HomeClient({ initialDramas, history = [] }: HomeClientProps) {
    const [dramas] = useState<Drama[]>(initialDramas)

    // Filter dramas by vibe
    const greenFlagDramas = dramas.filter(d => d.vibe === 'GreenFlag')
    const heartWrenchingDramas = dramas.filter(d => d.vibe === 'HeartWrenching' || d.vibe === 'ModernRomance')
    const wuxiaDramas = dramas.filter(d => d.vibe === 'Wuxia')
    const historicalDramas = dramas.filter(d => d.vibe === 'HistoricalRomance')

    return (
        <div className="min-h-screen bg-[#0a0a0a] -m-6">
            {/* Netflix-style Hero Billboard */}
            <HeroBillboard dramas={dramas} />

            {/* Content Rows */}
            <div className="relative z-10 -mt-32 space-y-10 pb-20">
                {/* Continue Watching */}
                {history.length > 0 && (
                    <ContinueWatchingRow items={history} />
                )}

                {/* Top 10 in Indonesia */}
                <Top10Row
                    title="Top 10 Drama Minggu Ini"
                    dramas={dramas}
                />

                {/* Trending Now */}
                <DramaRow
                    title="Trending Now"
                    dramas={dramas}
                    icon={<TrendingUp size={20} className="text-rose-500" />}
                />

                {/* Wuxia & Martial Arts - Banner Style */}
                {wuxiaDramas.length > 0 && (
                    <DramaRow
                        title="Epic Wuxia Adventures"
                        dramas={wuxiaDramas}
                        variant="banner"
                        bannerColor="#f97316" // Orange
                        bannerImage="https://images.unsplash.com/photo-1515548777977-1c390545f94a?q=80&w=2000" // Foggy mountains
                    />
                )}

                {/* Heart-Wrenching - Banner Style */}
                {heartWrenchingDramas.length > 0 && (
                    <DramaRow
                        title="Heart-Wrenching Romances"
                        dramas={heartWrenchingDramas}
                        variant="banner"
                        bannerColor="#ec4899" // Pink
                        bannerImage="https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?q=80&w=2000" // Cherry blossoms/flowers
                    />
                )}

                {/* Green Flag Picks */}
                {greenFlagDramas.length > 0 && (
                    <DramaRow
                        title="Green Flag Picks"
                        dramas={greenFlagDramas}
                        icon={<Sparkles size={20} className="text-emerald-500" />}
                    />
                )}

                {/* Historical Romance */}
                {historicalDramas.length > 0 && (
                    <DramaRow
                        title="Historical Romance"
                        dramas={historicalDramas}
                        icon={<Clock size={20} className="text-amber-500" />}
                    />
                )}

                {/* New Releases */}
                <DramaRow
                    title="New Releases"
                    dramas={dramas.slice().reverse()}
                    icon={<Flame size={20} className="text-red-500" />}
                />
            </div>
        </div>
    )
}
