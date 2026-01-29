/**
 * Legacy History API Route
 * 
 * Redirects to new /api/user/progress endpoint for backward compatibility
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const baseUrl = new URL(request.url).origin
    return NextResponse.redirect(`${baseUrl}/api/user/progress`)
}

export async function POST(request: NextRequest) {
    // Proxy to new endpoint
    const baseUrl = new URL(request.url).origin
    const body = await request.json()

    const res = await fetch(`${baseUrl}/api/user/progress`, {
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
