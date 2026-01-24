import { prisma } from '@/lib/prisma'
import { DramaGrid } from '@/components/home/drama-grid'
import { Compass } from 'lucide-react'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function BrowsePage({ searchParams }: PageProps) {
    const params = await searchParams
    const vibe = typeof params.vibe === 'string' ? params.vibe : undefined

    const dramas = await prisma.drama.findMany({
        where: vibe ? { vibe } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { episodes: true }
            }
        }
    })

    const formattedDramas = dramas.map(d => ({
        ...d,
        tags: JSON.parse(d.tags) as string[],
        releaseYear: d.releaseYear ?? undefined,
        totalEpisodes: d.totalEpisodes ?? undefined
    }))

    const vibes = [
        "GreenFlag", "HeartWrenching", "Wuxia", "ModernRomance", "HistoricalRomance", "Thriller", "Comedy", "SliceOfLife"
    ]

    return (
        <div className="min-h-screen p-6 space-y-8">
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
