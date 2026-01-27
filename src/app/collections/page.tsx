import { prisma } from '@/lib/prisma'
import { DramaGrid } from '@/components/home/drama-grid'
import { FolderHeart, Sparkles, Swords, Heart, Clock, Laugh, Coffee } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const collections = [
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
        slug: 'HistoricalRomance',
        name: 'Historical Romance',
        icon: Clock,
        color: 'text-amber-500',
        description: 'Love stories set in ancient times'
    },
    {
        slug: 'ModernRomance',
        name: 'Modern Romance',
        icon: Coffee,
        color: 'text-blue-500',
        description: 'Contemporary love stories'
    },
    {
        slug: 'Comedy',
        name: 'Comedy',
        icon: Laugh,
        color: 'text-yellow-500',
        description: 'Light-hearted fun and laughs'
    },
]

export default async function CollectionsPage() {
    // Get drama counts per vibe
    const vibeGroups = await prisma.drama.groupBy({
        by: ['vibe'],
        _count: { id: true }
    })

    const vibeCounts = Object.fromEntries(
        vibeGroups.map(g => [g.vibe, g._count.id])
    )

    return (
        <div className="min-h-screen p-6 space-y-8">
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
                <AllDramasGrid />
            </section>
        </div>
    )
}

async function AllDramasGrid() {
    const dramas = await prisma.drama.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            _count: { select: { episodes: true } }
        }
    })

    const formattedDramas = dramas.map(d => ({
        ...d,
        tags: JSON.parse(d.tags) as string[],
        releaseYear: d.releaseYear ?? undefined,
        totalEpisodes: d.totalEpisodes ?? undefined,
    }))

    return <DramaGrid dramas={formattedDramas} />
}
