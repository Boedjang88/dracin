/**
 * NextAuth Configuration with Audit Logging
 * 
 * Security features:
 * - Audit logging for all auth events (login, logout, failed auth)
 * - JWT strategy for stateless sessions
 * - Secure password hashing with bcrypt
 */

import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { logAuthSuccess, logAuthFailure } from "@/lib/audit"
import { logger } from "@/lib/logger"

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma as any),
    secret: process.env.AUTH_SECRET,
    session: { strategy: "jwt" },
    pages: {
        signIn: "/auth",
    },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        GitHub({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
        }),
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials, request) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials)

                if (!parsedCredentials.success) {
                    logger.warn({ type: 'auth', action: 'invalid_credentials_format' })
                    return null
                }

                const { email, password } = parsedCredentials.data

                try {
                    const user = await prisma.user.findUnique({
                        where: { email },
                    })

                    if (!user || !user.password) {
                        // Log failed auth attempt (user not found)
                        await logAuthFailure(
                            email,
                            getClientIP(request),
                            request?.headers?.get?.('user-agent') || undefined,
                            'user_not_found'
                        )
                        return null
                    }

                    const passwordsMatch = await bcrypt.compare(password, user.password)

                    if (!passwordsMatch) {
                        // Log failed auth attempt (wrong password)
                        await logAuthFailure(
                            email,
                            getClientIP(request),
                            request?.headers?.get?.('user-agent') || undefined,
                            'invalid_password'
                        )
                        return null
                    }

                    // Successful authentication
                    logger.info({ type: 'auth', action: 'credentials_success', userId: user.id })
                    return user
                } catch (error) {
                    logger.error({ type: 'auth', action: 'authorize_error', error })
                    return null
                }
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            // Log successful sign-in for all providers
            if (user.id) {
                try {
                    await logAuthSuccess(user.id)
                    logger.info({
                        type: 'auth',
                        action: 'sign_in',
                        userId: user.id,
                        provider: account?.provider
                    })
                } catch (error) {
                    // Don't block sign-in if audit logging fails
                    logger.error({ type: 'audit', action: 'sign_in_log_failed', error })
                }
            }
            return true
        },
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub
            }
            return session
        },
        async jwt({ token }) {
            return token
        }
    },
    events: {
        async signOut(message) {
            // Log sign-out event - handle both JWT and Database strategies
            const token = 'token' in message ? message.token : null
            if (token?.sub) {
                try {
                    const { logLogout } = await import("@/lib/audit")
                    await logLogout(token.sub)
                    logger.info({ type: 'auth', action: 'sign_out', userId: token.sub })
                } catch (error) {
                    logger.error({ type: 'audit', action: 'sign_out_log_failed', error })
                }
            }
        }
    }
})

/**
 * Extract client IP from request headers
 * Handles proxied requests (x-forwarded-for, x-real-ip)
 */
function getClientIP(request?: Request): string | undefined {
    if (!request?.headers) return undefined

    // Check common proxy headers
    const forwarded = request.headers.get?.('x-forwarded-for')
    if (forwarded) {
        return forwarded.split(',')[0].trim()
    }

    const realIP = request.headers.get?.('x-real-ip')
    if (realIP) {
        return realIP
    }

    return undefined
}
