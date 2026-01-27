import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(request: Request) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const skip = (page - 1) * limit

        // Fetch watchlist with drama details
        const [watchlistItems, total] = await Promise.all([
            prisma.watchlist.findMany({
                where: { userId: session.user.id },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    drama: {
                        include: {
                            _count: {
                                select: { episodes: true }
                            }
                        }
                    }
                }
            }),
            prisma.watchlist.count({
                where: { userId: session.user.id }
            })
        ])

        return NextResponse.json({
            success: true,
            data: watchlistItems.map(item => item.drama),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error('Error fetching watchlist:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch watchlist' },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const { dramaId } = await request.json()

        if (!dramaId) {
            return NextResponse.json(
                { success: false, error: 'Drama ID is required' },
                { status: 400 }
            )
        }

        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const userId = session.user.id

        // Check if already in watchlist
        const existing = await prisma.watchlist.findUnique({
            where: {
                userId_dramaId: {
                    userId,
                    dramaId
                }
            }
        })

        if (existing) {
            // Remove
            await prisma.watchlist.delete({
                where: {
                    id: existing.id
                }
            })
            return NextResponse.json({ success: true, added: false })
        } else {
            // Add
            await prisma.watchlist.create({
                data: {
                    userId,
                    dramaId
                }
            })
            return NextResponse.json({ success: true, added: true })
        }

    } catch (error) {
        console.error('Watchlist toggle error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
