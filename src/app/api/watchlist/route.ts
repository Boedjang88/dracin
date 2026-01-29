/**
 * Legacy Watchlist API Route
 * 
 * Redirects to new /api/user/favorites endpoint for backward compatibility
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const baseUrl = new URL(request.url).origin
    return NextResponse.redirect(`${baseUrl}/api/user/favorites`)
}

export async function POST(request: NextRequest) {
    // Proxy to new endpoint
    const baseUrl = new URL(request.url).origin
    const body = await request.json()

    const res = await fetch(`${baseUrl}/api/user/favorites`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': request.headers.get('cookie') || '',
        },
        body: JSON.stringify(body),
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
}

export async function DELETE(request: NextRequest) {
    const baseUrl = new URL(request.url).origin
    const { searchParams } = new URL(request.url)
    const dramaId = searchParams.get('dramaId')

    const res = await fetch(`${baseUrl}/api/user/favorites?dramaId=${dramaId}`, {
        method: 'DELETE',
        headers: {
            'Cookie': request.headers.get('cookie') || '',
        },
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
}
