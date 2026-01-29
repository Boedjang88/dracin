'use client'

import { useState } from 'react'
import { Sparkles, TrendingUp, Clock, Flame } from 'lucide-react'
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
    rating?: number
    _count?: {
        episodes: number
    }
}

interface ContinueWatchingItem {
    id: string
    episodeId: string
    title: string
    description: string
    posterUrl: string
    bannerUrl: string
    tags: string[]
    vibe: string
    progress: number
    episodeTitle: string
    episodeNumber: number
    lastPosition?: number
    duration?: number
}

interface HomeClientProps {
    initialDramas: Drama[]
    history?: ContinueWatchingItem[]
}

export default function HomeClient({ initialDramas, history = [] }: HomeClientProps) {
    const [dramas] = useState<Drama[]>(initialDramas)

    // Filter dramas by vibe
    const greenFlagDramas = dramas.filter(d => d.vibe === 'GreenFlag')
    const heartWrenchingDramas = dramas.filter(d => d.vibe === 'HeartWrenching')
    const wuxiaDramas = dramas.filter(d => d.vibe === 'Wuxia')
    const historicalDramas = dramas.filter(d => d.vibe === 'Historical')
    const romComDramas = dramas.filter(d => d.vibe === 'RomCom')
    const fantasyDramas = dramas.filter(d => d.vibe === 'Fantasy')

    return (
        <div className="min-h-screen bg-[#0a0a0a] pb-20">
            {/* Netflix-style Hero Billboard */}
            <HeroBillboard dramas={dramas} />

            {/* Content Rows */}
            <div className="relative z-10 -mt-32 space-y-10 pb-20">
                {/* Continue Watching */}
                {history.length > 0 && (
                    <ContinueWatchingRow items={history} />
                )}

                {/* Top 10 */}
                <Top10Row
                    title="Top 10 Drama Minggu Ini"
                    dramas={dramas.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 10)}
                />

                {/* Trending Now */}
                <DramaRow
                    title="Trending Now"
                    dramas={dramas}
                    icon={<TrendingUp size={20} className="text-rose-500" />}
                />

                {/* Fantasy & Xianxia */}
                {fantasyDramas.length > 0 && (
                    <DramaRow
                        title="Fantasy & Xianxia"
                        dramas={fantasyDramas}
                        variant="banner"
                        bannerColor="#8b5cf6"
                        bannerImage="https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=2000&q=80"
                    />
                )}

                {/* Wuxia & Martial Arts */}
                {wuxiaDramas.length > 0 && (
                    <DramaRow
                        title="Epic Wuxia Adventures"
                        dramas={wuxiaDramas}
                        variant="banner"
                        bannerColor="#f97316"
                        bannerImage="https://images.unsplash.com/photo-1515548777977-1c390545f94a?w=2000&q=80"
                    />
                )}

                {/* Heart-Wrenching */}
                {heartWrenchingDramas.length > 0 && (
                    <DramaRow
                        title="Heart-Wrenching Romances"
                        dramas={heartWrenchingDramas}
                        variant="banner"
                        bannerColor="#ec4899"
                        bannerImage="https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=2000&q=80"
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

                {/* Rom-Com */}
                {romComDramas.length > 0 && (
                    <DramaRow
                        title="Light-Hearted Rom-Coms"
                        dramas={romComDramas}
                        icon={<Sparkles size={20} className="text-pink-400" />}
                    />
                )}

                {/* Historical */}
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
