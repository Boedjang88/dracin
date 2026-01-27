'use client'

import React, { useEffect, useRef, useCallback, useState } from 'react'
import {
    Play, Pause, Volume2, VolumeX, Maximize, Minimize,
    Settings, Loader2, ListVideo, SkipBack, SkipForward,
    PictureInPicture2, RotateCcw, RotateCw, Subtitles,
    ChevronUp, X, Check
} from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { usePlayerStore } from '@/store/player-store'
import { useVideoProgress } from '@/hooks/use-video-progress'
import { cn } from '@/lib/utils'
import { EpisodeSidebar } from './episode-sidebar'
import { motion, AnimatePresence } from 'framer-motion'

// Settings menu options
const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
const QUALITY_OPTIONS = ['Auto', '1080p', '720p', '480p', '360p']

export function CustomPlayer() {
    const videoRef = useRef<HTMLVideoElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const doubleTapTimerRef = useRef<NodeJS.Timeout | null>(null)
    const lastTapRef = useRef<{ time: number; x: number }>({ time: 0, x: 0 })

    const [showSettings, setShowSettings] = useState(false)
    const [settingsTab, setSettingsTab] = useState<'main' | 'speed' | 'quality'>('main')
    const [selectedQuality, setSelectedQuality] = useState('Auto')
    const [isPiPSupported, setIsPiPSupported] = useState(false)
    const [isPiPActive, setIsPiPActive] = useState(false)
    const [seekIndicator, setSeekIndicator] = useState<{ side: 'left' | 'right'; visible: boolean }>({ side: 'left', visible: false })
    const [showKeyboardHints, setShowKeyboardHints] = useState(false)

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

    // Check PiP support
    useEffect(() => {
        setIsPiPSupported(document.pictureInPictureEnabled ?? false)
    }, [])

    // Format time helper
    const formatTime = (seconds: number) => {
        if (isNaN(seconds)) return '0:00'
        const hrs = Math.floor(seconds / 3600)
        const min = Math.floor((seconds % 3600) / 60)
        const sec = Math.floor(seconds % 60)
        if (hrs > 0) {
            return `${hrs}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
        }
        return `${min}:${sec.toString().padStart(2, '0')}`
    }

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
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
                case 'p':
                    e.preventDefault()
                    togglePiP()
                    break
                case 'escape':
                    if (showSettings) setShowSettings(false)
                    if (showKeyboardHints) setShowKeyboardHints(false)
                    break
                case '?':
                    e.preventDefault()
                    setShowKeyboardHints(prev => !prev)
                    break
                case 'arrowup':
                    e.preventDefault()
                    setVolume(Math.min(1, volume + 0.1))
                    break
                case 'arrowdown':
                    e.preventDefault()
                    setVolume(Math.max(0, volume - 0.1))
                    break
                case ',':
                    e.preventDefault()
                    seekBy(-5)
                    break
                case '.':
                    e.preventDefault()
                    seekBy(5)
                    break
                case '<':
                    e.preventDefault()
                    changeSpeed(-1)
                    break
                case '>':
                    e.preventDefault()
                    changeSpeed(1)
                    break
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isPlaying, isMuted, isFullscreen, volume, showSettings, showKeyboardHints, playbackRate])

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

            // Show seek indicator
            setSeekIndicator({ side: seconds > 0 ? 'right' : 'left', visible: true })
            setTimeout(() => setSeekIndicator(prev => ({ ...prev, visible: false })), 500)
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

        try {
            if (!document.fullscreenElement) {
                await containerRef.current.requestFullscreen()
                setFullscreen(true)
            } else {
                await document.exitFullscreen()
                setFullscreen(false)
            }
        } catch (err) {
            console.error('Fullscreen error:', err)
        }
    }

    const togglePiP = async () => {
        if (!videoRef.current || !isPiPSupported) return

        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture()
                setIsPiPActive(false)
            } else {
                await videoRef.current.requestPictureInPicture()
                setIsPiPActive(true)
            }
        } catch (err) {
            console.error('PiP error:', err)
        }
    }

    const changeSpeed = (direction: number) => {
        const currentIndex = PLAYBACK_SPEEDS.indexOf(playbackRate)
        const newIndex = Math.max(0, Math.min(PLAYBACK_SPEEDS.length - 1, currentIndex + direction))
        setPlaybackRate(PLAYBACK_SPEEDS[newIndex])
    }

    const skipIntro = () => seekBy(90) // Skip 90 seconds for intro

    const playPrevious = () => {
        if (currentEpisode && playlist.length > 0) {
            const currentIndex = playlist.findIndex(ep => ep.id === currentEpisode.id)
            if (currentIndex > 0) {
                setEpisode(playlist[currentIndex - 1])
            }
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

    // Handle touch gestures for mobile
    const handleTouchEnd = (e: React.TouchEvent) => {
        const touch = e.changedTouches[0]
        const containerWidth = containerRef.current?.clientWidth || 0
        const tapX = touch.clientX
        const now = Date.now()

        // Check for double tap
        if (now - lastTapRef.current.time < 300 && Math.abs(tapX - lastTapRef.current.x) < 50) {
            // Double tap detected
            if (tapX < containerWidth / 3) {
                seekBy(-10) // Left third - seek back
            } else if (tapX > (containerWidth * 2) / 3) {
                seekBy(10) // Right third - seek forward
            } else {
                togglePlay() // Middle - play/pause
            }
            lastTapRef.current = { time: 0, x: 0 }
        } else {
            lastTapRef.current = { time: now, x: tapX }
        }
    }

    // Auto-next logic
    const [autoNextTimer, setAutoNextTimer] = useState<number | null>(null)
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

    useEffect(() => {
        return () => cancelAutoNext()
    }, [currentEpisode])

    const handleEnded = () => {
        if (!currentEpisode) return
        setPlaying(false)
        syncProgress(duration, true)
        const currentIndex = playlist.findIndex(ep => ep.id === currentEpisode.id)
        if (currentIndex < playlist.length - 1) {
            startAutoNext()
        }
    }

    // Listen for PiP events
    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        const handlePiPEnter = () => setIsPiPActive(true)
        const handlePiPExit = () => setIsPiPActive(false)

        video.addEventListener('enterpictureinpicture', handlePiPEnter)
        video.addEventListener('leavepictureinpicture', handlePiPExit)

        return () => {
            video.removeEventListener('enterpictureinpicture', handlePiPEnter)
            video.removeEventListener('leavepictureinpicture', handlePiPExit)
        }
    }, [])

    if (!currentEpisode) return null

    const canPlayPrevious = playlist.findIndex(ep => ep.id === currentEpisode.id) > 0
    const canPlayNext = playlist.findIndex(ep => ep.id === currentEpisode.id) < playlist.length - 1

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
            onTouchEnd={handleTouchEnd}
            className="group relative aspect-video w-full overflow-hidden bg-black select-none"
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
                playsInline
                webkit-playsinline="true"
            />

            {/* Double-tap seek indicators */}
            <AnimatePresence>
                {seekIndicator.visible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className={cn(
                            "absolute top-1/2 -translate-y-1/2 flex items-center justify-center",
                            "h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm",
                            seekIndicator.side === 'left' ? 'left-[20%]' : 'right-[20%]'
                        )}
                    >
                        {seekIndicator.side === 'left' ? (
                            <RotateCcw size={32} className="text-white" />
                        ) : (
                            <RotateCw size={32} className="text-white" />
                        )}
                        <span className="absolute -bottom-6 text-xs font-medium text-white">
                            {seekIndicator.side === 'left' ? '-10s' : '+10s'}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

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
                        className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 flex flex-col justify-between p-3 sm:p-4"
                    >
                        {/* Top Bar */}
                        <div className="flex items-center justify-between gap-2">
                            <h2 className="text-sm sm:text-lg font-medium text-white shadow-sm line-clamp-1">
                                Episode {currentEpisode.episodeNumber}: {currentEpisode.title}
                            </h2>
                            <div className="flex items-center gap-1">
                                {isPiPSupported && (
                                    <button
                                        onClick={togglePiP}
                                        className={cn(
                                            "rounded-full p-2 text-white hover:bg-white/20 transition-colors",
                                            isPiPActive && "bg-white/20"
                                        )}
                                        aria-label={isPiPActive ? "Exit Picture-in-Picture" : "Picture-in-Picture"}
                                    >
                                        <PictureInPicture2 size={20} />
                                    </button>
                                )}
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="rounded-full p-2 text-white hover:bg-white/20 transition-colors"
                                    aria-label="Open episode list"
                                >
                                    <ListVideo size={20} />
                                </button>
                            </div>
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
                        <div className="space-y-3">
                            {/* Skip Intro Button (show in first 3 minutes) */}
                            {currentTime < 180 && currentTime > 5 && (
                                <motion.button
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    onClick={skipIntro}
                                    className="absolute right-4 bottom-24 px-4 py-2 rounded-md bg-white/90 text-black text-sm font-medium hover:bg-white transition-colors shadow-lg"
                                >
                                    Skip Intro
                                </motion.button>
                            )}

                            {/* Progress Bar */}
                            <div className="group/slider relative h-1 cursor-pointer">
                                <Slider
                                    value={[currentTime]}
                                    max={duration || 100}
                                    step={1}
                                    onValueChange={handleSeek}
                                    className="cursor-pointer"
                                />
                            </div>

                            {/* Controls */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 sm:gap-4">
                                    {/* Play/Pause */}
                                    <button
                                        onClick={togglePlay}
                                        className="text-white hover:text-white/80 p-1"
                                        aria-label={isPlaying ? "Pause" : "Play"}
                                    >
                                        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                                    </button>

                                    {/* Previous/Next Episode */}
                                    <div className="hidden sm:flex items-center gap-1">
                                        <button
                                            onClick={playPrevious}
                                            disabled={!canPlayPrevious}
                                            className={cn(
                                                "text-white p-1 transition-opacity",
                                                canPlayPrevious ? "hover:text-white/80" : "opacity-40 cursor-not-allowed"
                                            )}
                                            aria-label="Previous episode"
                                        >
                                            <SkipBack size={20} fill="currentColor" />
                                        </button>
                                        <button
                                            onClick={playNext}
                                            disabled={!canPlayNext}
                                            className={cn(
                                                "text-white p-1 transition-opacity",
                                                canPlayNext ? "hover:text-white/80" : "opacity-40 cursor-not-allowed"
                                            )}
                                            aria-label="Next episode"
                                        >
                                            <SkipForward size={20} fill="currentColor" />
                                        </button>
                                    </div>

                                    {/* Seek buttons - mobile */}
                                    <div className="flex sm:hidden items-center gap-1">
                                        <button onClick={() => seekBy(-10)} className="text-white p-1" aria-label="Seek back 10 seconds">
                                            <RotateCcw size={18} />
                                        </button>
                                        <button onClick={() => seekBy(10)} className="text-white p-1" aria-label="Seek forward 10 seconds">
                                            <RotateCw size={18} />
                                        </button>
                                    </div>

                                    {/* Volume - desktop only */}
                                    <div className="hidden sm:flex items-center gap-2">
                                        <button onClick={toggleMute} className="text-white hover:text-white/80" aria-label={isMuted ? "Unmute" : "Mute"}>
                                            {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                        </button>
                                        <div className="w-20">
                                            <Slider
                                                value={[isMuted ? 0 : volume]}
                                                max={1}
                                                step={0.05}
                                                onValueChange={(val) => {
                                                    setVolume(val[0])
                                                    if (isMuted && val[0] > 0) setMuted(false)
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Time */}
                                    <span className="text-xs sm:text-sm font-medium text-white whitespace-nowrap">
                                        {formatTime(currentTime)} / {formatTime(duration)}
                                    </span>
                                </div>

                                <div className="flex items-center gap-1 sm:gap-2">
                                    {/* Settings Button */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowSettings(!showSettings)}
                                            className={cn(
                                                "text-white hover:bg-white/20 p-2 rounded-full transition-colors",
                                                showSettings && "bg-white/20"
                                            )}
                                            aria-label="Settings"
                                        >
                                            <Settings size={20} />
                                        </button>

                                        {/* Settings Menu */}
                                        <AnimatePresence>
                                            {showSettings && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className="absolute bottom-full right-0 mb-2 w-56 rounded-lg bg-zinc-900/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden"
                                                >
                                                    {settingsTab === 'main' ? (
                                                        <div className="py-1">
                                                            <button
                                                                onClick={() => setSettingsTab('speed')}
                                                                className="w-full flex items-center justify-between px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors"
                                                            >
                                                                <span>Playback Speed</span>
                                                                <span className="text-zinc-400">{playbackRate}x</span>
                                                            </button>
                                                            <button
                                                                onClick={() => setSettingsTab('quality')}
                                                                className="w-full flex items-center justify-between px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors"
                                                            >
                                                                <span>Quality</span>
                                                                <span className="text-zinc-400">{selectedQuality}</span>
                                                            </button>
                                                            <button
                                                                className="w-full flex items-center justify-between px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors"
                                                            >
                                                                <span>Subtitles</span>
                                                                <span className="text-zinc-400">Off</span>
                                                            </button>
                                                        </div>
                                                    ) : settingsTab === 'speed' ? (
                                                        <div>
                                                            <button
                                                                onClick={() => setSettingsTab('main')}
                                                                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-white border-b border-white/10 hover:bg-white/10"
                                                            >
                                                                <ChevronUp size={16} className="-rotate-90" />
                                                                <span>Playback Speed</span>
                                                            </button>
                                                            <div className="py-1 max-h-48 overflow-y-auto">
                                                                {PLAYBACK_SPEEDS.map(speed => (
                                                                    <button
                                                                        key={speed}
                                                                        onClick={() => {
                                                                            setPlaybackRate(speed)
                                                                            setSettingsTab('main')
                                                                        }}
                                                                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-white hover:bg-white/10"
                                                                    >
                                                                        <span>{speed === 1 ? 'Normal' : `${speed}x`}</span>
                                                                        {playbackRate === speed && <Check size={16} className="text-white" />}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <button
                                                                onClick={() => setSettingsTab('main')}
                                                                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-white border-b border-white/10 hover:bg-white/10"
                                                            >
                                                                <ChevronUp size={16} className="-rotate-90" />
                                                                <span>Quality</span>
                                                            </button>
                                                            <div className="py-1">
                                                                {QUALITY_OPTIONS.map(quality => (
                                                                    <button
                                                                        key={quality}
                                                                        onClick={() => {
                                                                            setSelectedQuality(quality)
                                                                            setSettingsTab('main')
                                                                        }}
                                                                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-white hover:bg-white/10"
                                                                    >
                                                                        <span>{quality}</span>
                                                                        {selectedQuality === quality && <Check size={16} className="text-white" />}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Fullscreen */}
                                    <button
                                        onClick={toggleFullscreen}
                                        className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
                                        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                                    >
                                        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Keyboard Shortcuts Overlay */}
            <AnimatePresence>
                {showKeyboardHints && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
                        onClick={() => setShowKeyboardHints(false)}
                    >
                        <div className="bg-zinc-900 rounded-xl p-6 max-w-md w-full mx-4 border border-white/10">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-white">Keyboard Shortcuts</h3>
                                <button onClick={() => setShowKeyboardHints(false)} className="text-zinc-400 hover:text-white" aria-label="Close keyboard shortcuts">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                {[
                                    ['Space / K', 'Play/Pause'],
                                    ['← / J', 'Seek -10s'],
                                    ['→ / L', 'Seek +10s'],
                                    [', / .', 'Seek ±5s'],
                                    ['↑ / ↓', 'Volume'],
                                    ['M', 'Mute'],
                                    ['F', 'Fullscreen'],
                                    ['P', 'Picture-in-Picture'],
                                    ['< / >', 'Speed ±'],
                                    ['?', 'Show shortcuts'],
                                ].map(([key, action]) => (
                                    <div key={key} className="flex items-center gap-2">
                                        <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono text-white">{key}</kbd>
                                        <span className="text-zinc-400">{action}</span>
                                    </div>
                                ))}
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
                        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center px-4">
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
