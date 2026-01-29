import { create } from 'zustand'

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

interface PreviewState {
    item: Drama | null
    position: {
        top: number
        left: number
        width: number
        height: number
    } | null
    isHovering: boolean
    setPreview: (item: Drama | null, position: { top: number, left: number, width: number, height: number } | null) => void
    setHovering: (hover: boolean) => void
}

export const usePreviewStore = create<PreviewState>((set) => ({
    item: null,
    position: null,
    isHovering: false,
    setPreview: (item, position) => set({ item, position }),
    setHovering: (hover) => set({ isHovering: hover })
}))
