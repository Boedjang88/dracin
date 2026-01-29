/**
 * Home Page - Server Component
 * 
 * Fetches drama data via API proxy (BFF pattern).
 * Does NOT directly query Prisma for video data.
 */

import { auth } from '@/lib/auth'
import HomeClient from '@/components/home/home-client'
import { videoProvider } from '@/lib/services/video-provider'
import { getContinueWatching } from '@/lib/services/recommendations'
import type { Drama } from '@/lib/types/video'

// Force dynamic since we have user-specific content
export const dynamic = 'force-dynamic'

/**
 * Fetch dramas from video provider (external API proxy)
 */
async function getDramas(): Promise<Drama[]> {
  try {
    const result = await videoProvider.getDramas({ limit: 20 })
    return result.data
  } catch (error) {
    console.error('Failed to fetch dramas:', error)
    return []
  }
}

/**
 * Fetch user's continue watching list
 */
async function getUserContinueWatching(userId: string) {
  try {
    const continueWatching = await getContinueWatching(userId, 10)
    return continueWatching.map((item) => ({
      id: item.id,
      episodeId: item.progress.episodeId,
      title: item.title,
      description: item.description,
      posterUrl: item.posterUrl,
      bannerUrl: item.bannerUrl,
      tags: item.genres,
      vibe: item.vibe || 'Modern',
      progress: item.progress.percentage,
      episodeTitle: `Episode ${item.progress.episodeNumber}`,
      episodeNumber: item.progress.episodeNumber,
    }))
  } catch (error) {
    console.error('Failed to fetch continue watching:', error)
    return []
  }
}

export default async function HomePage() {
  // Fetch dramas from video provider
  const dramas = await getDramas()

  // Get user session
  const session = await auth()
  let continueWatching: Awaited<ReturnType<typeof getUserContinueWatching>> = []

  if (session?.user?.id) {
    continueWatching = await getUserContinueWatching(session.user.id)
  }

  // Map to client-expected format
  const clientDramas = dramas.map((drama) => ({
    id: drama.id,
    title: drama.title,
    description: drama.description,
    posterUrl: drama.posterUrl,
    bannerUrl: drama.bannerUrl,
    tags: drama.genres,
    vibe: drama.vibe || 'Modern',
    releaseYear: drama.releaseYear,
    totalEpisodes: drama.totalEpisodes,
    rating: drama.rating,
  }))

  return <HomeClient initialDramas={clientDramas} history={continueWatching} />
}
