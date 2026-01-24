import { useEffect, useRef } from 'react'
import { usePlayerStore } from '@/store/player-store'
import { v4 as uuidv4 } from 'uuid'

// Fake userId for now (in real app would come from auth)
const USER_ID = 'user-123'

export function useVideoProgress() {
    const {
        isPlaying,
        currentTime,
        currentEpisode,
        isBuffering
    } = usePlayerStore()

    const lastSyncTimeRef = useRef<number>(0)
    const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)

    const syncProgress = async (time: number, force = false) => {
        if (!currentEpisode) return

        // Don't sync if time hasn't changed much (unless forced)
        if (!force && Math.abs(time - lastSyncTimeRef.current) < 5) return

        try {
            await fetch('/api/history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: USER_ID,
                    episodeId: currentEpisode.id,
                    lastPosition: Math.floor(time)
                })
            })

            lastSyncTimeRef.current = time
        } catch (error) {
            console.error('Failed to sync progress:', error)
        }
    }

    // Auto-sync every 10 seconds while playing
    useEffect(() => {
        if (isPlaying && !isBuffering) {
            syncIntervalRef.current = setInterval(() => {
                syncProgress(usePlayerStore.getState().currentTime)
            }, 10000)
        } else {
            if (syncIntervalRef.current) {
                clearInterval(syncIntervalRef.current)
            }
        }

        return () => {
            if (syncIntervalRef.current) {
                clearInterval(syncIntervalRef.current)
            }
        }
    }, [isPlaying, isBuffering, currentEpisode])

    // Sync when pausing or unmounting
    useEffect(() => {
        return () => {
            syncProgress(usePlayerStore.getState().currentTime, true)
        }
    }, [currentEpisode])

    return { syncProgress }
}
