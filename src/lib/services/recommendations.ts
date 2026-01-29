/**
 * Rule-Based Recommendation Engine
 * 
 * Provides personalized drama recommendations based on:
 * - Genre frequency from watch history
 * - Actor/cast similarity
 * - Vibe preferences
 * - Recently watched patterns
 * 
 * Design: "Feels intelligent, but simple" - no ML required
 */

import { prisma } from '@/lib/prisma'
import { videoProvider } from './video-provider'
import { logger } from '@/lib/logger'
import type { Drama, DramaVibe } from '@/lib/types/video'

// ============================================
// Types
// ============================================

interface UserPreferences {
    favoriteGenres: Map<string, number>
    favoriteVibes: Map<DramaVibe, number>
    watchedDramaIds: Set<string>
    recentActors: string[]
}

interface ScoredDrama extends Drama {
    score: number
    matchReasons: string[]
}

// ============================================
// Recommendation Service
// ============================================

/**
 * Get personalized recommendations for a user
 */
export async function getRecommendations(
    userId: string,
    limit = 10
): Promise<Drama[]> {
    try {
        // Get user's preferences from watch history
        const preferences = await analyzeUserPreferences(userId)

        // If new user with no history, return featured/popular
        if (preferences.watchedDramaIds.size === 0) {
            logger.info({ type: 'recommendations', userId, status: 'new_user' })
            return videoProvider.getFeaturedDramas()
        }

        // Get all available dramas
        const { data: allDramas } = await videoProvider.getDramas({ limit: 100 })

        // Score each drama based on user preferences
        const scoredDramas: ScoredDrama[] = allDramas
            .filter((drama) => !preferences.watchedDramaIds.has(drama.id))
            .map((drama) => scoreAndExplain(drama, preferences))
            .sort((a, b) => b.score - a.score)

        // Return top recommendations
        const recommendations = scoredDramas.slice(0, limit)

        logger.info({
            type: 'recommendations',
            userId,
            count: recommendations.length,
            topGenres: Array.from(preferences.favoriteGenres.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([g]) => g),
        })

        return recommendations
    } catch (error) {
        logger.error({ type: 'recommendations', userId, error })
        // Fallback to featured dramas
        return videoProvider.getFeaturedDramas()
    }
}

/**
 * Get "Because you watched X" recommendations
 */
export async function getSimilarDramas(
    dramaId: string,
    limit = 6
): Promise<Drama[]> {
    try {
        const sourceDrama = await videoProvider.getDramaById(dramaId)
        if (!sourceDrama) return []

        const { data: allDramas } = await videoProvider.getDramas({ limit: 50 })

        // Score by similarity to source drama
        const scored = allDramas
            .filter((d) => d.id !== dramaId)
            .map((drama) => {
                let score = 0

                // Genre overlap
                const genreOverlap = drama.genres.filter((g) =>
                    sourceDrama.genres.includes(g)
                ).length
                score += genreOverlap * 30

                // Same vibe
                if (drama.vibe === sourceDrama.vibe) {
                    score += 25
                }

                // Cast overlap
                const castOverlap = drama.cast.filter((c) =>
                    sourceDrama.cast.some((sc) => sc.name === c.name)
                ).length
                score += castOverlap * 20

                // Similar year
                const yearDiff = Math.abs(drama.releaseYear - sourceDrama.releaseYear)
                if (yearDiff <= 2) score += 10

                return { ...drama, score }
            })
            .sort((a, b) => b.score - a.score)

        return scored.slice(0, limit)
    } catch (error) {
        logger.error({ type: 'similar_dramas', dramaId, error })
        return []
    }
}

/**
 * Get "Continue Watching" dramas with progress
 */
export async function getContinueWatching(
    userId: string,
    limit = 10
): Promise<Array<Drama & { progress: { episodeId: string; episodeNumber: number; percentage: number } }>> {
    try {
        // Get user's incomplete progress
        const progressRecords = await prisma.userProgress.findMany({
            where: {
                userId,
                completed: false,
            },
            orderBy: { updatedAt: 'desc' },
            take: limit,
        })

        if (progressRecords.length === 0) return []

        // Fetch drama details for each progress record
        const results = await Promise.all(
            progressRecords.map(async (progress) => {
                const drama = await videoProvider.getDramaById(progress.dramaId)
                if (!drama) return null

                const episodes = await videoProvider.getEpisodes(progress.dramaId)
                const episode = episodes.find((e) => e.id === progress.episodeId)

                return {
                    ...drama,
                    progress: {
                        episodeId: progress.episodeId,
                        episodeNumber: episode?.episodeNumber || 1,
                        percentage: progress.duration > 0
                            ? Math.round((progress.currentTime / progress.duration) * 100)
                            : 0,
                    },
                }
            })
        )

        return results.filter((r): r is NonNullable<typeof r> => r !== null)
    } catch (error) {
        logger.error({ type: 'continue_watching', userId, error })
        return []
    }
}

/**
 * Get trending dramas for a specific vibe
 */
export async function getTrendingByVibe(
    vibe: DramaVibe,
    limit = 10
): Promise<Drama[]> {
    return videoProvider.getDramasByVibe(vibe, limit)
}

// ============================================
// Internal Functions
// ============================================

/**
 * Analyze user's watch history to extract preferences
 */
async function analyzeUserPreferences(userId: string): Promise<UserPreferences> {
    const preferences: UserPreferences = {
        favoriteGenres: new Map(),
        favoriteVibes: new Map(),
        watchedDramaIds: new Set(),
        recentActors: [],
    }

    // Get watch history
    const history = await prisma.watchHistory.findMany({
        where: { userId },
        orderBy: { watchedAt: 'desc' },
        take: 50, // Analyze last 50 entries
    })

    // Get favorites
    const favorites = await prisma.favorites.findMany({
        where: { userId },
    })

    // Combine drama IDs
    const dramaIds = new Set([
        ...history.map((h) => h.dramaId),
        ...favorites.map((f) => f.dramaId),
    ])

    // Fetch drama details and analyze
    for (const dramaId of dramaIds) {
        preferences.watchedDramaIds.add(dramaId)

        const drama = await videoProvider.getDramaById(dramaId)
        if (!drama) continue

        // Count genre occurrences
        for (const genre of drama.genres) {
            preferences.favoriteGenres.set(
                genre,
                (preferences.favoriteGenres.get(genre) || 0) + 1
            )
        }

        // Count vibe occurrences
        if (drama.vibe) {
            preferences.favoriteVibes.set(
                drama.vibe,
                (preferences.favoriteVibes.get(drama.vibe) || 0) + 1
            )
        }

        // Collect actor names
        for (const cast of drama.cast) {
            if (!preferences.recentActors.includes(cast.name)) {
                preferences.recentActors.push(cast.name)
            }
        }
    }

    // Limit actor list to recent 20
    preferences.recentActors = preferences.recentActors.slice(0, 20)

    return preferences
}

/**
 * Score a drama based on user preferences and explain why
 */
function scoreAndExplain(drama: Drama, prefs: UserPreferences): ScoredDrama {
    let score = 0
    const matchReasons: string[] = []

    // Genre matching (weighted by frequency)
    for (const genre of drama.genres) {
        const genreScore = prefs.favoriteGenres.get(genre) || 0
        if (genreScore > 0) {
            score += genreScore * 15
            matchReasons.push(`${genre} lover`)
        }
    }

    // Vibe matching
    if (drama.vibe && prefs.favoriteVibes.has(drama.vibe)) {
        const vibeScore = prefs.favoriteVibes.get(drama.vibe) || 0
        score += vibeScore * 20
        matchReasons.push(`${drama.vibe} mood`)
    }

    // Cast matching
    for (const cast of drama.cast) {
        if (prefs.recentActors.includes(cast.name)) {
            score += 25
            matchReasons.push(`Stars ${cast.name}`)
            break // Only count first matching actor
        }
    }

    // High rating bonus
    if (drama.rating && drama.rating >= 8.5) {
        score += 10
        matchReasons.push('Highly rated')
    }

    // Recent release bonus
    const currentYear = new Date().getFullYear()
    if (drama.releaseYear >= currentYear - 1) {
        score += 5
        matchReasons.push('New release')
    }

    return {
        ...drama,
        score,
        matchReasons: matchReasons.slice(0, 3), // Keep top 3 reasons
    }
}
