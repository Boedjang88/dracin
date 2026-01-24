'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { CustomPlayer } from '@/components/player/custom-player'
import { usePlayerStore } from '@/store/player-store'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface Episode {
    id: string
    title: string
    thumbnail: string
    videoUrl: string
    duration: number
    episodeNumber: number
    dramaId: string
}

interface Drama {
    id: string
    title: string
    episodes: Episode[]
}

export default function WatchPage() {
    const { id } = useParams()
    const [isLoading, setIsLoading] = useState(true)
    const { setDrama, setEpisode, currentDrama, currentEpisode, setCurrentTime } = usePlayerStore()

    useEffect(() => {
        async function fetchEpisode() {
            try {
                const res = await fetch(`/api/episodes/${id}`)
                const data = await res.json()

                if (data.success) {
                    const episode = data.data
                    const drama = episode.drama

                    // Set store data
                    setDrama(drama)
                    setEpisode(episode)

                    // Resume playback
                    if (episode.lastPosition > 0) {
                        setCurrentTime(episode.lastPosition)
                    }
                }
            } catch (error) {
                console.error('Failed to fetch episode:', error)
            } finally {
                setIsLoading(false)
            }
        }

        if (id) {
            fetchEpisode()
        }
    }, [id, setDrama, setEpisode, setCurrentTime])

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-black">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
            </div>
        )
    }

    if (!currentDrama || !currentEpisode) {
        return (
            <div className="flex h-screen items-center justify-center text-white">
                Drama not found
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 px-6 py-4 text-sm text-zinc-400">
                <Link href="/" className="hover:text-white">Home</Link>
                <ChevronRight size={14} />
                <Link href={`/drama/${currentDrama.id}`} className="hover:text-white">{currentDrama.title}</Link>
                <ChevronRight size={14} />
                <span className="text-white">Episode {currentEpisode.episodeNumber}</span>
            </div>

            {/* Player Container */}
            <div className="max-w-7xl mx-auto px-6 pb-12 space-y-6">
                <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-2xl">
                    <CustomPlayer />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold">{currentEpisode.title}</h1>
                    <p className="text-zinc-400">{currentDrama.title} • Episode {currentEpisode.episodeNumber}</p>
                </div>
            </div>
        </div>
    )
}
