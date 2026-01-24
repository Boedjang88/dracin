import { prisma } from '@/lib/prisma'
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
    return dramas
  } catch (error) {
    console.error('Failed to fetch dramas:', error)
    return []
  }
}

export default async function HomePage() {
  const dramas = await getDramas()

  return <HomeClient initialDramas={dramas} />
}
