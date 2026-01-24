import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const { episodeId, lastPosition } = await request.json()

        if (!episodeId) {
            return NextResponse.json(
                { success: false, error: 'Episode ID is required' },
                { status: 400 }
            )
        }

        // Mock User for Dev
        const user = await prisma.user.findFirst()
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            )
        }

        // Update or create history
        const history = await prisma.watchHistory.upsert({
            where: {
                userId_episodeId: {
                    userId: user.id,
                    episodeId
                }
            },
            update: {
                lastPosition,
                updatedAt: new Date()
            },
            create: {
                userId: user.id,
                episodeId,
                lastPosition,
                isCompleted: false // Logic for completed could be added here
            }
        })

        return NextResponse.json({ success: true, data: history })

    } catch (error) {
        console.error('History sync error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
