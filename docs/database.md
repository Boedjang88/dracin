# Database Schema

Dracin uses Prisma ORM with a focus on storing **user-specific data only**. Video content metadata is fetched from external APIs.

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        User Domain                          │
├─────────────────────────────────────────────────────────────┤
│  User ──┬── Account (OAuth)                                 │
│         ├── Session                                         │
│         ├── UserProgress (watch progress)                   │
│         ├── WatchHistory                                    │
│         ├── Favorites (watchlist)                           │
│         └── AuditLog                                        │
└─────────────────────────────────────────────────────────────┘
```

## Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐
│    User      │───────│   Account    │
│              │  1:N  │   (OAuth)    │
└──────┬───────┘       └──────────────┘
       │
       │ 1:N
       ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│UserProgress  │    │ WatchHistory │    │  Favorites   │
│              │    │              │    │              │
│ - episodeId  │    │ - episodeId  │    │ - dramaId    │
│ - dramaId    │    │ - dramaId    │    │              │
│ - currentTime│    │ - watchedAt  │    │              │
│ - duration   │    │              │    │              │
│ - completed  │    │              │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
```

## Tables

### User

Primary user entity.

| Column | Type | Description |
|--------|------|-------------|
| id | String (cuid) | Primary key |
| email | String | Unique email |
| emailVerified | DateTime? | Verification timestamp |
| name | String? | Display name |
| password | String? | Hashed password (null for OAuth) |
| image | String? | Avatar URL |
| createdAt | DateTime | Account creation |
| updatedAt | DateTime | Last update |

### Account

OAuth provider accounts (Google, GitHub, etc.)

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| userId | String | FK to User |
| type | String | Account type |
| provider | String | OAuth provider name |
| providerAccountId | String | External account ID |
| access_token | String? | OAuth access token |
| refresh_token | String? | OAuth refresh token |
| expires_at | Int? | Token expiry |

### Session

Active user sessions.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| sessionToken | String | Unique token |
| userId | String | FK to User |
| expires | DateTime | Session expiry |

### UserProgress

Tracks watch progress per episode.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| userId | String | FK to User |
| episodeId | String | External episode ID |
| dramaId | String | External drama ID |
| currentTime | Int | Last position (seconds) |
| duration | Int | Total duration (seconds) |
| completed | Boolean | Watch completed flag |
| createdAt | DateTime | First watch |
| updatedAt | DateTime | Last update |

**Unique Constraint:** `(userId, episodeId)`

### WatchHistory

Immutable log of watched episodes.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| userId | String | FK to User |
| episodeId | String | External episode ID |
| dramaId | String | External drama ID |
| watchedAt | DateTime | Timestamp |

### Favorites

User's watchlist/favorites.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| userId | String | FK to User |
| dramaId | String | External drama ID |
| createdAt | DateTime | Added timestamp |

**Unique Constraint:** `(userId, dramaId)`

### AuditLog

Security audit trail.

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| userId | String? | FK to User (nullable for anon) |
| action | String | Action type (LOGIN, LOGOUT, etc.) |
| entityType | String? | Target entity type |
| entityId | String? | Target entity ID |
| metadata | Json? | Additional context |
| ipAddress | String? | Client IP |
| userAgent | String? | Client user agent |
| timestamp | DateTime | Event time |

### VerificationToken

Email verification tokens.

| Column | Type | Description |
|--------|------|-------------|
| identifier | String | Email address |
| token | String | Verification token |
| expires | DateTime | Token expiry |

## Indexes

```sql
-- Performance indexes
CREATE INDEX UserProgress_userId_idx ON UserProgress(userId);
CREATE INDEX WatchHistory_userId_idx ON WatchHistory(userId);
CREATE INDEX Favorites_userId_idx ON Favorites(userId);
CREATE INDEX AuditLog_userId_idx ON AuditLog(userId);
CREATE INDEX AuditLog_action_idx ON AuditLog(action);
```

## Migrations

```bash
# Development: Push schema changes
npx prisma db push

# Production: Create migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Generate client
npx prisma generate
```

## Seeding

```bash
# Run seed script (if configured)
npx prisma db seed
```

## Notes

1. **External IDs:** `episodeId` and `dramaId` reference external API resources, not local entities.
2. **Soft Deletes:** Not implemented. Use audit logs for tracking.
3. **Cascade:** User deletion cascades to all related records.
