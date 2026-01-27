import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters').optional()
})

export async function POST(request: Request) {
    try {
        const body = await request.json()

        // Validate input
        const validatedData = registerSchema.safeParse(body)

        if (!validatedData.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Validation failed',
                    details: validatedData.error.issues
                },
                { status: 400 }
            )
        }

        const { email, password, name } = validatedData.data

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json(
                { success: false, error: 'User with this email already exists' },
                { status: 409 }
            )
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: name || email.split('@')[0]
            },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true
            }
        })

        return NextResponse.json({
            success: true,
            message: 'User registered successfully',
            data: user
        }, { status: 201 })

    } catch (error) {
        console.error('Registration error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to register user' },
            { status: 500 }
        )
    }
}
