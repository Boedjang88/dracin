'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Play, Plus, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/store/ui-store'
import { useDominantColor } from '@/hooks/use-dominant-color'

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

interface DramaCardProps {
    drama: Drama
    index?: number
}

export function DramaCard({ drama, index = 0 }: DramaCardProps) {
    const { setThemeColor } = useUIStore()
    const accentColor = useDominantColor(drama.posterUrl)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.3,
                delay: index * 0.05,
                ease: 'easeOut'
            }}
            onMouseEnter={() => setThemeColor(accentColor)}
            onMouseLeave={() => setThemeColor(null)}
        >
            <Link href={`/drama/${drama.id}`} className="group block">
                <div className="relative overflow-hidden rounded-lg border border-subtle bg-card transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-white/5">
                    {/* Poster */}
                    <div className="relative aspect-[2/3] w-full overflow-hidden">
                        <Image
                            src={drama.posterUrl}
                            alt={drama.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                        />

                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                        {/* Play button on hover */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                                <Play size={20} strokeWidth={1.5} className="text-white" fill="currentColor" />
                            </div>
                        </div>

                        {/* Vibe badge */}
                        <div className="absolute left-2 top-2">
                            <span className="rounded-md bg-black/50 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
                                {drama.vibe.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-3 space-y-1">
                        <h3 className="text-sm font-medium text-white line-clamp-1 group-hover:text-white/90">
                            {drama.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            {drama.releaseYear} • {drama._count?.episodes || drama.totalEpisodes} episodes
                        </p>
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}

interface DramaGridProps {
    dramas: Drama[]
}

export function DramaGrid({ dramas }: DramaGridProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {dramas.map((drama, index) => (
                <DramaCard key={drama.id} drama={drama} index={index} />
            ))}
        </div>
    )
}

interface FeaturedHeroProps {
    drama: Drama
}

export function FeaturedHero({ drama }: FeaturedHeroProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative h-[400px] w-full overflow-hidden rounded-xl border border-subtle"
        >
            {/* Background image */}
            <Image
                src={drama.bannerUrl}
                alt={drama.title}
                fill
                className="object-cover"
                priority
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="max-w-xl space-y-4"
                >
                    {/* Vibe badge */}
                    <span className="inline-block rounded-md bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                        {drama.vibe.replace(/([A-Z])/g, ' $1').trim()}
                    </span>

                    {/* Title */}
                    <h1 className="text-3xl font-bold text-white">{drama.title}</h1>

                    {/* Meta */}
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Star size={14} strokeWidth={1.5} className="text-yellow-500" fill="currentColor" />
                            4.8
                        </span>
                        <span>{drama.releaseYear}</span>
                        <span>{drama._count?.episodes || drama.totalEpisodes} episodes</span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {drama.description}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <Button className="gap-2 bg-white text-black hover:bg-white/90">
                            <Play size={16} strokeWidth={1.5} fill="currentColor" />
                            Watch Now
                        </Button>
                        <Button variant="outline" className="gap-2 border-white/20 bg-white/5 hover:bg-white/10">
                            <Plus size={16} strokeWidth={1.5} />
                            Watchlist
                        </Button>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    )
}
