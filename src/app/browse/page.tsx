/**
 * Browse Page - Uses Video Provider API
 */

import { videoProvider } from '@/lib/services/video-provider'
import { DramaGrid } from '@/components/home/drama-grid'
import { Compass } from 'lucide-react'
import type { DramaVibe } from '@/lib/types/video'

export const dynamic = 'force-dynamic'

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function BrowsePage({ searchParams }: PageProps) {
    const params = await searchParams
    const vibe = typeof params.vibe === 'string' ? params.vibe as DramaVibe : undefined

    // Fetch from video provider (external API proxy)
    const { data: dramas } = vibe
        ? { data: await videoProvider.getDramasByVibe(vibe, 50) }
        : await videoProvider.getDramas({ limit: 50 })

    // Format for DramaGrid component
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

    const vibes = [
        'GreenFlag', 'HeartWrenching', 'Wuxia', 'RomCom', 'Historical', 'Fantasy', 'Thriller', 'SliceOfLife'
    ]

    return (
        <div className="min-h-screen p-6 pt-24 space-y-8">
            <div className="flex items-center gap-2">
                <Compass size={24} className="text-white" />
                <h1 className="text-2xl font-bold text-white">Browse Dramas</h1>
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap gap-2">
                <a
                    href="/browse"
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${!vibe
                        ? 'bg-white text-black'
                        : 'bg-white/10 text-zinc-300 hover:bg-white/20'
                        }`}
                >
                    All
                </a>
                {vibes.map((v) => (
                    <a
                        key={v}
                        href={`/browse?vibe=${v}`}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${vibe === v
                            ? 'bg-white text-black'
                            : 'bg-white/10 text-zinc-300 hover:bg-white/20'
                            }`}
                    >
                        {v}
                    </a>
                ))}
            </div>

            <DramaGrid dramas={formattedDramas} />
        </div>
    )
}
