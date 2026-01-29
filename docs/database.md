# Database Schema Guide

This guide explains how data is stored in Dracin, what each table does, and how to work with the database.

---

## 📖 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Schema Diagram](#schema-diagram)
- [Tables](#tables)
- [Working with the Database](#working-with-the-database)
- [Common Queries](#common-queries)
- [Migrations](#migrations)
- [Troubleshooting](#troubleshooting)

---

## Overview

### What Database Does Dracin Use?

Dracin uses **Prisma ORM** which supports:
- **SQLite** - Default for development (file-based, no installation needed)
- **PostgreSQL** - Recommended for production
- **MySQL** - Also supported

### What Data is Stored?

**Important:** Dracin follows a BFF architecture. The database stores **ONLY user data**:

| Stored in Database ✅ | NOT Stored in Database ❌ |
|----------------------|---------------------------|
| User accounts | Drama information |
| Watch progress | Episode details |
| Favorites/Watchlist | Video URLs |
| Watch history | Actor/cast info |
| Audit logs | |

Video content comes from an external API (Video Provider).

---

## Quick Start

### Setup Database (Development)

```bash
# 1. Make sure .env has DATABASE_URL
cat .env
# DATABASE_URL="file:./dev.db"

# 2. Push schema to database
npx prisma db push

# 3. Generate Prisma client
npx prisma generate

# 4. (Optional) Open database GUI
npx prisma studio
```

### Setup Database (Production)

```bash
# 1. Set PostgreSQL URL in .env
# DATABASE_URL="postgresql://user:password@host:5432/dracin"

# 2. Run migrations
npx prisma migrate deploy

# 3. Generate client
npx prisma generate
```

---

## Schema Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                            USER                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ id, email, name, password, image, createdAt, updatedAt         │ │
│  └────────────────────────────────────────────────────────────────┘ │
│           │              │              │              │             │
│           │ 1:N          │ 1:N          │ 1:N          │ 1:N        │
│           ▼              ▼              ▼              ▼             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │
│  │  Account    │ │   Session   │ │UserProgress │ │  Favorites  │    │
│  │ (OAuth)     │ │             │ │             │ │ (Watchlist) │    │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘    │
│           │                             │              │             │
│           │                             │ 1:N          │             │
│           │                             ▼              ▼             │
│           │                      ┌─────────────┐                    │
│           │                      │WatchHistory │                    │
│           │                      └─────────────┘                    │
│           │                                                          │
│           └──────────────────────────────────────────────────────┐  │
│                                                                   │  │
│                                                                   ▼  │
│                                                           ┌─────────┐│
│                                                           │AuditLog ││
│                                                           └─────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

---

## Tables

### User

The main user account table.

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?
  password      String?   // Null for OAuth users
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  accounts      Account[]
  sessions      Session[]
  favorites     Favorites[]
  progress      UserProgress[]
  history       WatchHistory[]
  auditLogs     AuditLog[]
}
```

**Field Explanations:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique identifier (CUID format) |
| `email` | String | User's email (unique) |
| `emailVerified` | DateTime? | When email was verified |
| `name` | String? | Display name |
| `password` | String? | Hashed password (bcrypt). Null for OAuth |
| `image` | String? | Profile picture URL |
| `createdAt` | DateTime | When account was created |
| `updatedAt` | DateTime | When account was last modified |

---

### Account

OAuth provider accounts (Google, GitHub, etc.)

```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String  // e.g., "google", "github"
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}
```

**When is this used?**

When a user logs in with Google/GitHub instead of email/password.

---

### Session

Active user sessions.

```prisma
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**How it works:**

1. User logs in → Session created
2. Browser stores session cookie
3. Each request validates session token
4. User logs out → Session deleted

---

### UserProgress

Tracks watch progress per episode.

```prisma
model UserProgress {
  id          String   @id @default(cuid())
  userId      String
  episodeId   String   // ID from Video Provider
  dramaId     String   // ID from Video Provider
  currentTime Int      @default(0) // Seconds
  duration    Int      @default(0) // Seconds
  completed   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, episodeId])
  @@index([userId])
}
```

**Example Data:**

| userId | episodeId | currentTime | duration | completed |
|--------|-----------|-------------|----------|-----------|
| user-1 | ep-001 | 1200 | 2700 | false |
| user-1 | ep-002 | 2700 | 2700 | true |
| user-2 | ep-001 | 500 | 2700 | false |

**How it's used:**

```typescript
// When user loads video player
const progress = await prisma.userProgress.findFirst({
  where: { userId, episodeId }
})

// Start video from saved position
video.currentTime = progress?.currentTime || 0
```

---

### WatchHistory

Immutable log of watched episodes.

```prisma
model WatchHistory {
  id        String   @id @default(cuid())
  userId    String
  episodeId String
  dramaId   String
  watchedAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

**Difference from UserProgress:**

| UserProgress | WatchHistory |
|--------------|--------------|
| Updated when watching | Only created once per episode |
| Stores current position | Stores when episode was watched |
| Used for "Resume" | Used for "History" page |

---

### Favorites

User's watchlist/favorites.

```prisma
model Favorites {
  id        String   @id @default(cuid())
  userId    String
  dramaId   String   // ID from Video Provider
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, dramaId])
  @@index([userId])
}
```

**Usage Example:**

```typescript
// Add to watchlist
await prisma.favorites.create({
  data: { userId, dramaId }
})

// Check if in watchlist
const isInWatchlist = await prisma.favorites.findFirst({
  where: { userId, dramaId }
})

// Remove from watchlist
await prisma.favorites.delete({
  where: { userId_dramaId: { userId, dramaId } }
})
```

---

### AuditLog

Security audit trail for important actions.

```prisma
model AuditLog {
  id         String   @id @default(cuid())
  userId     String?  // Nullable for anonymous actions
  action     String   // e.g., "LOGIN_SUCCESS", "LOGOUT"
  entityType String?  // e.g., "user", "drama"
  entityId   String?
  metadata   Json?    // Additional context
  ipAddress  String?
  userAgent  String?
  timestamp  DateTime @default(now())

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([action])
}
```

**Example Entries:**

```json
// Login success
{
  "action": "LOGIN_SUCCESS",
  "userId": "user-123",
  "metadata": { "method": "credentials" },
  "ipAddress": "192.168.1.1",
  "timestamp": "2024-01-15T10:30:00Z"
}

// Failed login
{
  "action": "LOGIN_FAILURE",
  "userId": null,
  "metadata": { "email": "unknown@example.com" },
  "ipAddress": "192.168.1.1",
  "timestamp": "2024-01-15T10:35:00Z"
}
```

---

### VerificationToken

Email verification tokens.

```prisma
model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

---

## Working with the Database

### Basic Operations

```typescript
import { prisma } from '@/lib/prisma'

// CREATE - Add a new record
const user = await prisma.user.create({
  data: {
    email: 'new@example.com',
    name: 'New User',
    password: hashedPassword
  }
})

// READ - Find a single record
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' }
})

// READ - Find multiple records
const favorites = await prisma.favorites.findMany({
  where: { userId: 'user-123' },
  orderBy: { createdAt: 'desc' },
  take: 10
})

// UPDATE - Modify a record
await prisma.userProgress.update({
  where: { id: 'progress-123' },
  data: { currentTime: 1500 }
})

// UPSERT - Create or Update
await prisma.userProgress.upsert({
  where: { userId_episodeId: { userId, episodeId } },
  create: { userId, episodeId, dramaId, currentTime, duration },
  update: { currentTime, duration }
})

// DELETE - Remove a record
await prisma.favorites.delete({
  where: { id: 'fav-123' }
})
```

### Querying with Relations

```typescript
// Get user with all their favorites
const userWithFavorites = await prisma.user.findUnique({
  where: { id: userId },
  include: { favorites: true }
})

// Get user's continue watching list
const continueWatching = await prisma.userProgress.findMany({
  where: { userId, completed: false },
  orderBy: { updatedAt: 'desc' },
  include: { user: true }
})
```

### Aggregations

```typescript
// Count user's favorites
const favoriteCount = await prisma.favorites.count({
  where: { userId }
})

// Get average watch progress
const avgProgress = await prisma.userProgress.aggregate({
  where: { userId },
  _avg: { currentTime: true }
})
```

---

## Common Queries

### Get User's Watchlist with Drama Details

```typescript
async function getUserWatchlist(userId: string) {
  // 1. Get favorite drama IDs from database
  const favorites = await prisma.favorites.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  })
  
  // 2. Fetch drama details from Video Provider
  const dramas = await Promise.all(
    favorites.map(fav => videoProvider.getDramaById(fav.dramaId))
  )
  
  return dramas.filter(Boolean)
}
```

### Get Continue Watching List

```typescript
async function getContinueWatching(userId: string) {
  const progress = await prisma.userProgress.findMany({
    where: { userId, completed: false },
    orderBy: { updatedAt: 'desc' },
    take: 10
  })
  
  return Promise.all(
    progress.map(async (p) => {
      const drama = await videoProvider.getDramaById(p.dramaId)
      const episode = await videoProvider.getEpisodeById(p.episodeId)
      return {
        ...p,
        drama,
        episode,
        progressPercent: (p.currentTime / p.duration) * 100
      }
    })
  )
}
```

### Check if Drama is in Watchlist

```typescript
async function isInWatchlist(userId: string, dramaId: string) {
  const favorite = await prisma.favorites.findFirst({
    where: { userId, dramaId }
  })
  return !!favorite
}
```

---

## Migrations

### Development (Quick Changes)

```bash
# Push changes directly (no migration file)
npx prisma db push
```

### Production (With Migration History)

```bash
# Create a migration
npx prisma migrate dev --name add_new_field

# View migration status
npx prisma migrate status

# Apply migrations
npx prisma migrate deploy
```

### Resetting Database

```bash
# ⚠️ DELETES ALL DATA
npx prisma migrate reset
```

---

## Prisma Studio

Prisma Studio is a visual database editor.

```bash
npx prisma studio
```

Opens at `http://localhost:5555`

You can:
- Browse all tables
- Add/edit/delete records
- Filter and search
- Export data

---

## Troubleshooting

### "Prisma Client not generated"

```bash
npx prisma generate
```

### "Database does not exist"

```bash
npx prisma db push
```

### "Migration failed"

```bash
# Check migration status
npx prisma migrate status

# Try resetting (⚠️ deletes data)
npx prisma migrate reset
```

### "Unique constraint failed"

The record already exists. Use `upsert` instead:

```typescript
await prisma.favorites.upsert({
  where: { userId_dramaId: { userId, dramaId } },
  create: { userId, dramaId },
  update: {} // No updates needed for favorites
})
```

### Viewing Raw SQL

Enable query logging in `prisma.ts`:

```typescript
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
})
```

---

## Best Practices

### DO ✅

- Use transactions for multiple related operations
- Add indexes for frequently queried fields
- Use `select` to fetch only needed fields
- Handle unique constraint errors gracefully

### DON'T ❌

- Store video content metadata in database
- Expose internal IDs to users
- Skip input validation
- Forget to close connections (Prisma handles this)

---

## Next Steps

- [Architecture](./architecture.md) - Overall system design
- [API Reference](./api.md) - How to use the data
- [Security](./security.md) - Protecting user data
