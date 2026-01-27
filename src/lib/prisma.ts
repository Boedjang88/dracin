import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '@/generated/prisma'
import path from 'path'

declare global {
    var prisma: PrismaClient | undefined
}

const dbPath = path.join(process.cwd(), 'prisma/dev.db')
const adapter = new PrismaBetterSqlite3({
    url: dbPath
})

export const prisma = globalThis.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = prisma
}
