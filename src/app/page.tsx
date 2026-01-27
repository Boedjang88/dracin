import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import HomeClient from '@/components/home/home-client'

// Force dynamic since we might have random featured dramas or want fresh data
export const dynamic = 'force-dynamic'

async function getDramas() {
  try {
    const dramas = await prisma.drama.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        _count: {
          select: { episodes: true }
        }
      }
    })

    // Parse JSON fields for client component
    return dramas.map(drama => ({
      ...drama,
      tags: JSON.parse(drama.tags) as string[],
      releaseYear: drama.releaseYear ?? undefined,
      totalEpisodes: drama.totalEpisodes ?? undefined,
    }))
  } catch (error) {
    console.error('Failed to fetch dramas:', error)
    return []
  }
}

export default async function HomePage() {
  const dramas = await getDramas()

  // Get history
  const session = await auth()
  let history: any[] = []

  if (session?.user?.id) {
    const rawHistory = await prisma.watchHistory.findMany({
      where: { userId: session.user.id },
      take: 10,
      orderBy: { updatedAt: 'desc' },
      include: {
        episode: {
          include: {
            drama: true
          }
        }
      }
    })

    // Format for client
    history = rawHistory.map(item => ({
      id: item.episode.drama.id, // Use drama ID for card
      episodeId: item.episode.id, // Keep episode ID for link
      title: item.episode.drama.title,
      description: item.episode.drama.description,
      posterUrl: item.episode.drama.posterUrl,
      bannerUrl: item.episode.drama.bannerUrl,
      tags: JSON.parse(item.episode.drama.tags),
      vibe: item.episode.drama.vibe,
      progress: (item.lastPosition / item.episode.duration) * 100,
      episodeTitle: item.episode.title,
      episodeNumber: item.episode.episodeNumber,
      lastPosition: item.lastPosition,
      duration: item.episode.duration
    }))
  }

  return <HomeClient initialDramas={dramas} history={history} />
}
