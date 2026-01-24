import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const { dramaId } = await request.json()

        if (!dramaId) {
            return NextResponse.json(
                { success: false, error: 'Drama ID is required' },
                { status: 400 }
            )
        }

        // Get the test user (in a real app, from session)
        const user = await prisma.user.findFirst()

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            )
        }

        // Check if already in watchlist
        const existing = await prisma.watchlist.findUnique({
            where: {
                userId_dramaId: {
                    userId: user.id,
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
                    userId: user.id,
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
