/* hint-disable no-inline-styles */
'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Play } from 'lucide-react'
import { cn } from '@/lib/utils'

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
    lastPosition: number
    duration: number
}

interface ContinueWatchingRowProps {
    items: ContinueWatchingItem[]
}

export function ContinueWatchingRow({ items }: ContinueWatchingRowProps) {
    if (!items || items.length === 0) return null

    return (
        <section className="relative my-8">
            <div className="flex items-center gap-3 px-6 sm:px-12 mb-4">
                <h2 className="text-xl font-semibold text-white">Continue Watching</h2>
            </div>

            <div className="flex gap-4 overflow-x-auto scrollbar-none px-6 sm:px-12 pb-4">
                {items.map((item) => (
                    <Link
                        key={item.episodeId}
                        href={`/watch/${item.episodeId}`}
                        className="flex-shrink-0 w-[240px] group relative"
                    >
                        {/* Thumbnail with Progress */}
                        <div className="relative aspect-video rounded-md overflow-hidden bg-zinc-800 mb-2 group-hover:ring-2 ring-white/50 transition-all">
                            <Image
                                src={item.bannerUrl || item.posterUrl}
                                alt={item.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />

                            {/* Play overlay */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="p-3 bg-white/20 backdrop-blur-md rounded-full">
                                    <Play size={20} fill="white" className="text-white" />
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
                                <div
                                    className="h-full bg-red-600"
                                    // eslint-disable-next-line react-dom/no-unsafe-read-inline-style
                                    style={{ width: `${item.progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Metadata */}
                        <div>
                            <h3 className="text-sm font-medium text-white truncate">{item.title}</h3>
                            <p className="text-xs text-zinc-400 truncate">
                                S1:E{item.episodeNumber} • {item.episodeTitle}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    )
}
