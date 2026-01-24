import { create } from 'zustand'

interface Episode {
    id: string
    title: string
    thumbnail: string
    videoUrl: string
    duration: number
    episodeNumber: number
}

interface Drama {
    id: string
    title: string
    episodes: Episode[]
}

interface PlayerState {
    // Playback State
    isPlaying: boolean
    isMuted: boolean
    volume: number
    playbackRate: number
    currentTime: number
    duration: number
    isFullscreen: boolean
    isBuffering: boolean

    // Content State
    currentDrama: Drama | null
    currentEpisode: Episode | null
    playlist: Episode[]

    // UI State
    isSidebarOpen: boolean
    showControls: boolean

    // Actions
    setPlaying: (isPlaying: boolean) => void
    setMuted: (isMuted: boolean) => void
    setVolume: (volume: number) => void
    setPlaybackRate: (rate: number) => void
    setCurrentTime: (time: number) => void
    setDuration: (duration: number) => void
    setFullscreen: (isFullscreen: boolean) => void
    setBuffering: (isBuffering: boolean) => void
    setDrama: (drama: Drama) => void
    setEpisode: (episode: Episode) => void
    setSidebarOpen: (isOpen: boolean) => void
    setShowControls: (show: boolean) => void
    reset: () => void
}

export const usePlayerStore = create<PlayerState>((set) => ({
    // Initial State
    isPlaying: false,
    isMuted: false,
    volume: 1,
    playbackRate: 1,
    currentTime: 0,
    duration: 0,
    isFullscreen: false,
    isBuffering: false,
    currentDrama: null,
    currentEpisode: null,
    playlist: [],
    isSidebarOpen: false,
    showControls: true,

    // Actions
    setPlaying: (isPlaying) => set({ isPlaying }),
    setMuted: (isMuted) => set({ isMuted }),
    setVolume: (volume) => set({ volume }),
    setPlaybackRate: (playbackRate) => set({ playbackRate }),
    setCurrentTime: (currentTime) => set({ currentTime }),
    setDuration: (duration) => set({ duration }),
    setFullscreen: (isFullscreen) => set({ isFullscreen }),
    setBuffering: (isBuffering) => set({ isBuffering }),

    setDrama: (drama) => set({
        currentDrama: drama,
        playlist: drama.episodes.sort((a, b) => a.episodeNumber - b.episodeNumber)
    }),

    setEpisode: (episode) => set((state) => ({
        currentEpisode: episode,
        currentTime: 0, // Reset time on new episode
        isPlaying: true // Auto-play new episode
    })),

    setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
    setShowControls: (showControls) => set({ showControls }),

    reset: () => set({
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        isBuffering: false
    })
}))
