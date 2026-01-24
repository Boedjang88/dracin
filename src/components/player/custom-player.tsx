'use client'

import React, { useEffect, useRef, useCallback } from 'react'
import {
    Play, Pause, Volume2, VolumeX, Maximize, Minimize,
    Settings, Loader2, ListVideo, SkipBack, SkipForward
} from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { usePlayerStore } from '@/store/player-store'
import { useVideoProgress } from '@/hooks/use-video-progress'
import { cn } from '@/lib/utils'
import { EpisodeSidebar } from './episode-sidebar'
import { motion, AnimatePresence } from 'framer-motion'

export function CustomPlayer() {
    const videoRef = useRef<HTMLVideoElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const {
        isPlaying,
        isMuted,
        volume,
        playbackRate,
        currentTime,
        duration,
        isFullscreen,
        isBuffering,
        currentEpisode,
        showControls,
        setPlaying,
        setMuted,
        setVolume,
        setPlaybackRate,
        setCurrentTime,
        setDuration,
        setFullscreen,
        setBuffering,
        setShowControls,
        setSidebarOpen,
        setEpisode,
        playlist
    } = usePlayerStore()

    const { syncProgress } = useVideoProgress()

    // Format time helper
    const formatTime = (seconds: number) => {
        const min = Math.floor(seconds / 60)
        const sec = Math.floor(seconds % 60)
        return `${min}:${sec.toString().padStart(2, '0')}`
    }

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger if typing in an input
            if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return

            switch (e.key.toLowerCase()) {
                case ' ':
                case 'k':
                    e.preventDefault()
                    togglePlay()
                    break
                case 'arrowleft':
                case 'j':
                    e.preventDefault()
                    seekBy(-10)
                    break
                case 'arrowright':
                case 'l':
                    e.preventDefault()
                    seekBy(10)
                    break
                case 'm':
                    e.preventDefault()
                    toggleMute()
                    break
                case 'f':
                    e.preventDefault()
                    toggleFullscreen()
                    break
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isPlaying, isMuted, isFullscreen])

    // Sync state with video element
    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        if (isPlaying) video.play().catch(() => setPlaying(false))
        else video.pause()
    }, [isPlaying])

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.volume = isMuted ? 0 : volume
        }
    }, [volume, isMuted])

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = playbackRate
        }
    }, [playbackRate])

    // Handle controls visibility
    const handleMouseMove = useCallback(() => {
        setShowControls(true)
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
        if (isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000)
        }
    }, [isPlaying, setShowControls])

    const togglePlay = () => setPlaying(!usePlayerStore.getState().isPlaying)
    const toggleMute = () => setMuted(!usePlayerStore.getState().isMuted)

    const seekBy = (seconds: number) => {
        if (videoRef.current) {
            const newTime = Math.min(Math.max(videoRef.current.currentTime + seconds, 0), duration)
            videoRef.current.currentTime = newTime
            setCurrentTime(newTime)
        }
    }

    const handleSeek = (value: number[]) => {
        if (videoRef.current) {
            videoRef.current.currentTime = value[0]
            setCurrentTime(value[0])
        }
    }

    const toggleFullscreen = async () => {
        if (!containerRef.current) return

        if (!document.fullscreenElement) {
            await containerRef.current.requestFullscreen()
            setFullscreen(true)
        } else {
            await document.exitFullscreen()
            setFullscreen(false)
        }
    }

    const playNext = () => {
        if (currentEpisode && playlist.length > 0) {
            const currentIndex = playlist.findIndex(ep => ep.id === currentEpisode.id)
            if (currentIndex < playlist.length - 1) {
                setEpisode(playlist[currentIndex + 1])
            }
        }
    }

    // Auto-next logic
    const [autoNextTimer, setAutoNextTimer] = React.useState<number | null>(null)
    const autoNextIntervalRef = useRef<NodeJS.Timeout | null>(null)

    const cancelAutoNext = () => {
        if (autoNextIntervalRef.current) {
            clearInterval(autoNextIntervalRef.current)
            autoNextIntervalRef.current = null
        }
        setAutoNextTimer(null)
    }

    const startAutoNext = () => {
        let timeLeft = 5
        setAutoNextTimer(timeLeft)

        autoNextIntervalRef.current = setInterval(() => {
            timeLeft -= 1
            setAutoNextTimer(timeLeft)

            if (timeLeft <= 0) {
                cancelAutoNext()
                playNext()
            }
        }, 1000)
    }

    // Clear timer on cleanup or manual navigation
    useEffect(() => {
        return () => cancelAutoNext()
    }, [currentEpisode])

    // Update onEnded to start timer
    const handleEnded = () => {
        if (!currentEpisode) return
        setPlaying(false)
        const currentIndex = playlist.findIndex(ep => ep.id === currentEpisode.id)
        if (currentIndex < playlist.length - 1) {
            startAutoNext()
        }
    }

    if (!currentEpisode) return null

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
            className="group relative aspect-video w-full overflow-hidden bg-black"
        >
            <video
                ref={videoRef}
                src={currentEpisode.videoUrl}
                className="h-full w-full object-contain"
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                onDurationChange={(e) => setDuration(e.currentTarget.duration)}
                onWaiting={() => setBuffering(true)}
                onPlaying={() => {
                    setBuffering(false)
                    cancelAutoNext()
                }}
                onEnded={handleEnded}
                onClick={togglePlay}
                poster={currentEpisode.thumbnail}
            />

            {/* Buffering Indicator */}
            {isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2 className="h-12 w-12 animate-spin text-white" />
                </div>
            )}

            {/* Controls Overlay */}
            <AnimatePresence>
                {showControls && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 flex flex-col justify-between p-4"
                    >
                        {/* Top Bar */}
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-medium text-white shadow-sm">
                                Episode {currentEpisode.episodeNumber}: {currentEpisode.title}
                            </h2>
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="rounded-full p-2 text-white hover:bg-white/20 transition-colors"
                                aria-label="Open episode list"
                            >
                                <ListVideo size={24} />
                            </button>
                        </div>

                        {/* Center Play Button (only when paused) */}
                        {!isPlaying && !isBuffering && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="rounded-full bg-white/20 p-4 backdrop-blur-md">
                                    <Play size={48} className="ml-1 text-white fill-white" />
                                </div>
                            </div>
                        )}

                        {/* Bottom Bar */}
                        <div className="space-y-4">
                            {/* Progress Bar */}
                            <div className="group/slider relative h-1 cursor-pointer">
                                <Slider
                                    value={[currentTime]}
                                    max={duration}
                                    step={1}
                                    onValueChange={handleSeek}
                                    className="cursor-pointer"
                                />
                            </div>

                            {/* Controls */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button onClick={togglePlay} className="text-white hover:text-white/80" aria-label={isPlaying ? "Pause" : "Play"}>
                                        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                                    </button>

                                    <div className="flex items-center gap-2">
                                        <button onClick={playNext} className="text-white hover:text-white/80" aria-label="Play next episode">
                                            <SkipForward size={20} fill="currentColor" />
                                        </button>
                                    </div>

                                    <div className="hidden items-center gap-2 sm:flex">
                                        <button onClick={toggleMute} className="text-white hover:text-white/80" aria-label={isMuted ? "Unmute" : "Mute"}>
                                            {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                        </button>
                                        <div className="w-24">
                                            <Slider
                                                value={[isMuted ? 0 : volume]}
                                                max={1}
                                                step={0.1}
                                                onValueChange={(val) => {
                                                    setVolume(val[0])
                                                    if (isMuted && val[0] > 0) setMuted(false)
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <span className="text-sm font-medium text-white">
                                        {formatTime(currentTime)} / {formatTime(duration)}
                                    </span>
                                </div>

                                <div className="flex items-center gap-4">
                                    {/* Speed Selector */}
                                    <div className="relative group/speed">
                                        <button className="text-sm font-medium text-white hover:bg-white/20 px-2 py-1 rounded" aria-label="Playback speed">
                                            {playbackRate}x
                                        </button>
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden flex-col gap-1 rounded bg-black/90 p-1 group-hover/speed:flex">
                                            {[0.5, 1, 1.5, 2].map(rate => (
                                                <button
                                                    key={rate}
                                                    onClick={() => setPlaybackRate(rate)}
                                                    className={cn(
                                                        "px-3 py-1 text-sm hover:bg-white/20 rounded",
                                                        playbackRate === rate ? "text-primary" : "text-white"
                                                    )}
                                                >
                                                    {rate}x
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button onClick={toggleFullscreen} className="text-white hover:text-white/80" aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
                                        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Auto Next Overlay */}
            <AnimatePresence>
                {autoNextTimer !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
                    >
                        <p className="text-zinc-400 mb-2">Up Next</p>
                        <h2 className="text-2xl font-bold mb-6 text-center px-4">
                            {playlist[playlist.findIndex(ep => ep.id === currentEpisode.id) + 1]?.title}
                        </h2>

                        <div className="relative h-16 w-16 mb-6">
                            <svg className="h-full w-full -rotate-90">
                                <circle
                                    className="text-zinc-700"
                                    strokeWidth="4"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="30"
                                    cx="32"
                                    cy="32"
                                />
                                <circle
                                    className="text-white transition-all duration-1000 ease-linear"
                                    strokeWidth="4"
                                    strokeDasharray={188.5}
                                    strokeDashoffset={188.5 - (188.5 * autoNextTimer) / 5}
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="30"
                                    cx="32"
                                    cy="32"
                                />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-xl font-bold">
                                {autoNextTimer}
                            </span>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={cancelAutoNext}
                                className="px-6 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    cancelAutoNext()
                                    playNext()
                                }}
                                className="px-6 py-2 rounded-full bg-white text-black hover:bg-white/90 transition-colors font-medium"
                            >
                                Play Now
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <EpisodeSidebar />
        </div>
    )
}
