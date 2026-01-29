import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma'
import { Pool } from 'pg'

declare global {
    var prisma: PrismaClient | undefined
}

// Create PostgreSQL connection pool for Supabase
const connectionString = process.env.DATABASE_URL!

const pool = new Pool({
    connectionString,
    max: 10, // Maximum number of connections in the pool
})

const adapter = new PrismaPg(pool)

export const prisma = globalThis.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = prisma
}
