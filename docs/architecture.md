# Architecture

## Overview

Dracin uses a **Backend-for-Frontend (BFF)** architecture pattern. The Next.js application acts as a secure proxy between the client and external video APIs.

```
┌─────────────┐     ┌─────────────────┐     ┌──────────────────┐
│   Client    │────▶│  Next.js BFF    │────▶│  External APIs   │
│  (Browser)  │     │   API Routes    │     │ (Video Provider) │
└─────────────┘     └─────────────────┘     └──────────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Database   │
                    │ (User Data) │
                    └─────────────┘
```

## Key Principles

### 1. Data Separation

| Data Type | Storage Location |
|-----------|------------------|
| Video content, metadata | External API (proxied) |
| User accounts | Local Database |
| Watch progress | Local Database |
| Favorites/Watchlist | Local Database |
| Audit logs | Local Database |

### 2. API Proxy Pattern

All video content is accessed through internal API routes:

- `/api/dramas` - List all dramas
- `/api/dramas/[id]` - Get drama details
- `/api/episodes/[id]` - Get episode with stream URL
- `/api/search` - Search content

The client **never** directly calls external APIs.

### 3. Video Provider Abstraction

```typescript
// src/lib/services/video-provider/index.ts

interface VideoProvider {
  getDramas(options?: GetDramasOptions): Promise<PaginatedResponse<Drama>>
  getDramaById(id: string): Promise<Drama | null>
  getEpisodes(dramaId: string): Promise<Episode[]>
  getEpisodeById(id: string): Promise<Episode | null>
  search(query: string): Promise<Drama[]>
}
```

Current implementation uses `MockVideoProvider`. To integrate a real API:

1. Create a new provider class implementing `VideoProvider`
2. Update the factory in `video-provider/index.ts`
3. Set environment variables for API credentials

## Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (.)drama/[id]/     # Intercepted modal route
│   ├── api/               # API Routes (BFF layer)
│   │   ├── auth/          # Authentication endpoints
│   │   ├── dramas/        # Drama proxy endpoints
│   │   ├── episodes/      # Episode proxy endpoints
│   │   └── user/          # User data endpoints
│   ├── browse/            # Browse page
│   ├── collections/       # Collections page
│   ├── drama/[id]/        # Drama detail page
│   ├── history/           # Watch history
│   ├── profile/           # User profile
│   ├── watch/[id]/        # Video player page
│   └── watchlist/         # User watchlist
│
├── components/
│   ├── home/              # Homepage components
│   │   ├── drama-row.tsx  # Horizontal drama carousel
│   │   ├── hero-billboard.tsx
│   │   └── drama-grid.tsx
│   ├── layout/            # App shell, navigation
│   │   ├── app-shell.tsx
│   │   ├── top-nav.tsx
│   │   └── mobile-nav.tsx
│   ├── player/            # Video player components
│   └── ui/                # Shadcn/ui components
│
├── lib/
│   ├── services/
│   │   ├── video-provider/  # Video content abstraction
│   │   └── pino-logger.ts   # Structured logging
│   ├── auth.ts              # NextAuth configuration
│   ├── prisma.ts            # Database client
│   └── utils.ts             # Utility functions
│
└── store/                   # Zustand state stores
    ├── player-store.ts      # Video player state
    ├── preview-store.ts     # Hover preview state
    └── ui-store.ts          # UI preferences
```

## Authentication Flow

```
1. User submits credentials
        ↓
2. NextAuth validates against database
        ↓
3. Session created (JWT or Database)
        ↓
4. Protected routes check session
        ↓
5. API routes verify session for user-specific data
```

## Request Flow Example

### Fetching Drama Details

```
1. Client navigates to /drama/[id]
        ↓
2. Page component calls /api/dramas/[id]
        ↓
3. API route calls videoProvider.getDramaById(id)
        ↓
4. Provider fetches from external API (or mock)
        ↓
5. Response transformed and returned to client
        ↓
6. Additional user data (watchlist status) fetched from DB
```

## Caching Strategy

- **Static Pages:** ISR with revalidation
- **API Responses:** SWR on client, server caching via headers
- **Images:** Next.js Image Optimization
- **Video:** External CDN (provider-dependent)

## Error Handling

```typescript
// API routes use standardized error responses
{
  success: false,
  error: {
    code: "NOT_FOUND",
    message: "Drama not found"
  }
}
```

Client errors are generic. Full details logged server-side only.
