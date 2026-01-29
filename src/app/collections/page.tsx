/**
 * Collections Page - Uses Video Provider API
 */

import { videoProvider } from '@/lib/services/video-provider'
import { DramaGrid } from '@/components/home/drama-grid'
import { FolderHeart, Sparkles, Swords, Heart, Clock, Laugh, Coffee, Wand2 } from 'lucide-react'
import Link from 'next/link'
import type { DramaVibe } from '@/lib/types/video'

export const dynamic = 'force-dynamic'

const collections: Array<{
    slug: DramaVibe
    name: string
    icon: typeof Sparkles
    color: string
    description: string
}> = [
        {
            slug: 'GreenFlag',
            name: 'Green Flag Picks',
            icon: Sparkles,
            color: 'text-emerald-500',
            description: 'Sweet romances with respectful leads'
        },
        {
            slug: 'Wuxia',
            name: 'Wuxia & Martial Arts',
            icon: Swords,
            color: 'text-orange-500',
            description: 'Epic martial arts adventures'
        },
        {
            slug: 'HeartWrenching',
            name: 'Heart-Wrenching',
            icon: Heart,
            color: 'text-pink-500',
            description: 'Emotional stories that tug at your heart'
        },
        {
            slug: 'Historical',
            name: 'Historical Romance',
            icon: Clock,
            color: 'text-amber-500',
            description: 'Love stories set in ancient times'
        },
        {
            slug: 'RomCom',
            name: 'Rom-Com',
            icon: Coffee,
            color: 'text-blue-500',
            description: 'Light-hearted romantic comedies'
        },
        {
            slug: 'Fantasy',
            name: 'Fantasy & Xianxia',
            icon: Wand2,
            color: 'text-purple-500',
            description: 'Supernatural worlds and immortal love'
        },
        {
            slug: 'SliceOfLife',
            name: 'Slice of Life',
            icon: Laugh,
            color: 'text-yellow-500',
            description: 'Everyday stories with heart'
        },
    ]

export default async function CollectionsPage() {
    // Get all dramas to count by vibe
    const { data: allDramas } = await videoProvider.getDramas({ limit: 100 })

    // Count dramas per vibe
    const vibeCounts: Record<string, number> = {}
    allDramas.forEach((drama) => {
        if (drama.vibe) {
            vibeCounts[drama.vibe] = (vibeCounts[drama.vibe] || 0) + 1
        }
    })

    return (
        <div className="min-h-screen p-6 pt-24 space-y-8">
            <div className="flex items-center gap-3">
                <FolderHeart size={28} className="text-white" />
                <div>
                    <h1 className="text-2xl font-bold text-white">Collections</h1>
                    <p className="text-sm text-zinc-400">Curated drama collections by mood</p>
                </div>
            </div>

            {/* Collection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {collections.map((collection) => {
                    const Icon = collection.icon
                    const count = vibeCounts[collection.slug] || 0

                    return (
                        <Link
                            key={collection.slug}
                            href={`/browse?vibe=${collection.slug}`}
                            className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 transition-all hover:border-white/20 hover:bg-white/10"
                        >
                            {/* Background gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                            <div className="relative flex items-start gap-4">
                                <div className={`p-3 rounded-xl bg-white/10 ${collection.color}`}>
                                    <Icon size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-white group-hover:text-white/90">
                                        {collection.name}
                                    </h3>
                                    <p className="text-sm text-zinc-400 mt-1">
                                        {collection.description}
                                    </p>
                                    <p className="text-xs text-zinc-500 mt-2">
                                        {count} {count === 1 ? 'drama' : 'dramas'}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>

            {/* All Dramas Section */}
            <section className="space-y-4 pt-8">
                <h2 className="text-xl font-semibold text-white">All Dramas</h2>
                <AllDramasGrid dramas={allDramas} />
            </section>
        </div>
    )
}

function AllDramasGrid({ dramas }: { dramas: Awaited<ReturnType<typeof videoProvider.getDramas>>['data'] }) {
    const formattedDramas = dramas.map(d => ({
        id: d.id,
        title: d.title,
        description: d.description,
        posterUrl: d.posterUrl,
        bannerUrl: d.bannerUrl,
        tags: d.genres,
        vibe: d.vibe || 'Modern',
        releaseYear: d.releaseYear,
        totalEpisodes: d.totalEpisodes,
    }))

    return <DramaGrid dramas={formattedDramas} />
}
