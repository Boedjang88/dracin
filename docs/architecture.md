# Architecture Guide

This document explains how Dracin is built, why certain decisions were made, and how all the pieces fit together.

---

## 📖 Table of Contents

- [Overview](#overview)
- [What is BFF?](#what-is-bff-backend-for-frontend)
- [System Architecture](#system-architecture)
- [Directory Structure](#directory-structure)
- [Data Flow](#data-flow)
- [Key Components](#key-components)
- [Video Provider System](#video-provider-system)
- [Authentication](#authentication)
- [State Management](#state-management)
- [Caching Strategy](#caching-strategy)
- [Error Handling](#error-handling)

---

## Overview

Dracin is built using **Next.js 15** with the App Router. If you're new to Next.js, here's a quick primer:

### What is Next.js?

Next.js is a React framework that gives you:
- **Server-Side Rendering** - Pages load faster
- **API Routes** - Backend code in the same project
- **File-based Routing** - Create a file, get a route
- **Built-in Optimization** - Images, fonts, scripts

### Why Next.js for Dracin?

| Requirement | How Next.js Helps |
|-------------|-------------------|
| Fast loading | Server rendering |
| SEO friendly | Pre-rendered pages |
| API endpoints | Built-in API routes |
| Real-time updates | React components |
| Mobile support | Responsive by default |

---

## What is BFF (Backend-for-Frontend)?

### The Problem

Imagine you have a video API that returns data like this:

```json
{
  "video_id": "abc123",
  "video_name": "Love Story",
  "video_thumb": "https://...",
  "video_stream_url": "https://secret-cdn.com/...",
  "api_internal_code": "X7829"
}
```

If the browser directly called this API:
1. ❌ API key would be exposed in browser
2. ❌ Too much data sent (internal codes)
3. ❌ Can't easily cache or modify
4. ❌ Different APIs = nightmare for frontend

### The Solution: BFF

Add a "middleman" server that:
1. ✅ Hides API keys on the server
2. ✅ Transforms data to what frontend needs
3. ✅ Caches responses for speed
4. ✅ Provides consistent API to frontend

```
BEFORE (Direct API calls):
┌────────┐    direct    ┌─────────────┐
│Browser │ ──────────── │ External API│
└────────┘              └─────────────┘
                ↑
        API key exposed! ❌

AFTER (BFF pattern):
┌────────┐           ┌──────────┐           ┌─────────────┐
│Browser │ ───────── │ Your BFF │ ───────── │ External API│
└────────┘           └──────────┘           └─────────────┘
            own API      ↑         API key hidden ✅
                    Your Server
```

### In Dracin

```
Client (Browser)
     │
     ▼
/api/dramas ──────────────────┐
/api/episodes                 │
/api/search                   ├──▶ Video Provider ──▶ External API
/api/recommendations          │
                              │
/api/user/favorites ──────────┼──▶ Database (user data only)
/api/user/progress            │
/api/auth/*                   │
```

---

## System Architecture

### High-Level Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │
│  │   Pages     │  │ Components  │  │   Stores    │                  │
│  │ (App Router)│  │   (React)   │  │  (Zustand)  │                  │
│  └─────────────┘  └─────────────┘  └─────────────┘                  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP Requests
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API ROUTES (BFF)                             │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ /api/dramas     │ /api/episodes  │ /api/search   │ /api/user/* │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│    VIDEO PROVIDER       │     │       PRISMA ORM        │
│  ┌───────────────────┐  │     │  ┌───────────────────┐  │
│  │  MockProvider     │  │     │  │  User             │  │
│  │  (Development)    │  │     │  │  UserProgress     │  │
│  ├───────────────────┤  │     │  │  Favorites        │  │
│  │  TMDBProvider     │  │     │  │  WatchHistory     │  │
│  │  (Production)     │  │     │  │  AuditLog         │  │
│  └───────────────────┘  │     │  └───────────────────┘  │
└─────────────────────────┘     └─────────────────────────┘
         │                                  │
         ▼                                  ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│   External Video API    │     │   SQLite / PostgreSQL   │
│   (Content Source)      │     │   (User Data)           │
└─────────────────────────┘     └─────────────────────────┘
```

---

## Directory Structure

```
src/
├── app/                          # 📁 PAGES & API ROUTES
│   │
│   ├── (.)drama/[id]/            # Intercepted route (modal)
│   │   └── page.tsx              # Shows drama as modal overlay
│   │
│   ├── api/                      # API endpoints
│   │   ├── auth/                 # NextAuth endpoints
│   │   │   ├── [...nextauth]/    # Main auth handler
│   │   │   └── register/         # User registration
│   │   ├── dramas/               # Drama content
│   │   │   ├── route.ts          # GET /api/dramas
│   │   │   └── [id]/route.ts     # GET /api/dramas/:id
│   │   ├── episodes/[id]/        # Episode streaming
│   │   ├── search/               # Search functionality
│   │   ├── recommendations/      # Personalized recommendations
│   │   ├── user/                 # User-specific data
│   │   │   ├── favorites/        # Watchlist management
│   │   │   └── progress/         # Watch progress tracking
│   │   ├── history/              # Watch history
│   │   └── watchlist/            # Watchlist API
│   │
│   ├── browse/page.tsx           # Browse all dramas
│   ├── collections/page.tsx      # Curated collections
│   ├── drama/[id]/page.tsx       # Drama detail page
│   ├── history/page.tsx          # Watch history
│   ├── profile/page.tsx          # User profile
│   ├── watch/[id]/page.tsx       # Video player
│   ├── watchlist/page.tsx        # User's watchlist
│   ├── auth/page.tsx             # Login/Register
│   │
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Homepage
│   └── globals.css               # Global styles
│
├── components/                   # 📁 REACT COMPONENTS
│   │
│   ├── home/                     # Homepage-specific
│   │   ├── drama-row.tsx         # Horizontal carousel
│   │   ├── drama-grid.tsx        # Grid layout
│   │   ├── hero-billboard.tsx    # Featured drama banner
│   │   ├── home-client.tsx       # Client-side home logic
│   │   └── continue-watching-row.tsx
│   │
│   ├── layout/                   # App-wide layout
│   │   ├── app-shell.tsx         # Main wrapper
│   │   ├── top-nav.tsx           # Top navigation
│   │   ├── mobile-nav.tsx        # Mobile bottom nav
│   │   └── command-palette.tsx   # Search modal (Cmd+K)
│   │
│   ├── player/                   # Video player
│   │   ├── custom-player.tsx     # Main player component
│   │   └── episode-sidebar.tsx   # Episode list drawer
│   │
│   └── ui/                       # Base UI components
│       ├── button.tsx            # Button component
│       ├── dialog.tsx            # Modal dialogs
│       ├── preview-card/         # Hover preview system
│       └── ...                   # Other shadcn/ui components
│
├── lib/                          # 📁 UTILITIES & SERVICES
│   │
│   ├── services/
│   │   ├── video-provider/       # Video content abstraction
│   │   │   ├── index.ts          # Provider factory
│   │   │   ├── types.ts          # TypeScript interfaces
│   │   │   └── mock-provider.ts  # Development mock data
│   │   └── pino-logger.ts        # Structured logging
│   │
│   ├── auth.ts                   # NextAuth configuration
│   ├── prisma.ts                 # Prisma client singleton
│   ├── utils.ts                  # Utility functions
│   ├── api-error.ts              # API error handling
│   ├── audit.ts                  # Audit logging helper
│   └── logger.ts                 # Client-safe logging
│
├── store/                        # 📁 STATE MANAGEMENT
│   ├── player-store.ts           # Video player state
│   ├── preview-store.ts          # Hover preview state
│   └── ui-store.ts               # UI preferences
│
└── hooks/                        # 📁 CUSTOM HOOKS
    └── use-dominant-color.ts     # Extract color from image
```

---

## Data Flow

### Example: User Watches an Episode

Let's trace what happens when a user clicks "Play":

```
Step 1: User clicks play button
        ↓
Step 2: Browser navigates to /watch/episode-123
        ↓
Step 3: WatchPage component mounts
        ↓
Step 4: useEffect calls fetch('/api/episodes/episode-123')
        ↓
Step 5: API route handler executes:
        - Checks user authentication
        - Calls videoProvider.getEpisodeById('episode-123')
        - Fetches user's last position from database
        - Returns combined data
        ↓
Step 6: CustomPlayer component receives data
        ↓
Step 7: Video starts playing from lastPosition
        ↓
Step 8: Every 30 seconds, progress saved via POST /api/user/progress
```

### Code Trace

```typescript
// 1. WatchPage fetches episode data
useEffect(() => {
  fetch(`/api/episodes/${id}`)
    .then(res => res.json())
    .then(data => setEpisode(data))
}, [id])

// 2. API route processes request
// src/app/api/episodes/[id]/route.ts
export async function GET(request, { params }) {
  const session = await auth()
  
  // Get episode from video provider
  const episode = await videoProvider.getEpisodeById(params.id)
  
  // Get user progress from database
  const progress = await prisma.userProgress.findFirst({
    where: { episodeId: params.id, userId: session.user.id }
  })
  
  return Response.json({
    success: true,
    data: {
      ...episode,
      lastPosition: progress?.currentTime || 0
    }
  })
}

// 3. Player saves progress periodically
useEffect(() => {
  const interval = setInterval(() => {
    fetch('/api/user/progress', {
      method: 'POST',
      body: JSON.stringify({
        episodeId,
        currentTime,
        duration
      })
    })
  }, 30000)
  return () => clearInterval(interval)
}, [])
```

---

## Key Components

### Video Provider

The Video Provider is an **abstraction layer** that separates "where videos come from" from "how we display them".

```typescript
// src/lib/services/video-provider/types.ts
interface VideoProvider {
  // Fetch list of dramas
  getDramas(options?: GetDramasOptions): Promise<PaginatedResponse<Drama>>
  
  // Fetch single drama with details
  getDramaById(id: string): Promise<Drama | null>
  
  // Fetch episodes for a drama
  getEpisodes(dramaId: string): Promise<Episode[]>
  
  // Fetch single episode with stream URL
  getEpisodeById(id: string): Promise<Episode | null>
  
  // Search dramas
  search(query: string): Promise<Drama[]>
}
```

**Why abstraction?** 
- Swap video sources without changing UI code
- Test with mock data
- Add caching layer easily

### State Management (Zustand)

We use **Zustand** for state that needs to persist across components:

```typescript
// src/store/player-store.ts
export const usePlayerStore = create((set) => ({
  // Current playing content
  currentDrama: null,
  currentEpisode: null,
  
  // Player state
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  
  // Actions
  setDrama: (drama) => set({ currentDrama: drama }),
  setPlaying: (playing) => set({ isPlaying: playing }),
  // ...
}))
```

### Authentication

Using NextAuth.js v5 with credentials provider:

```typescript
// src/lib/auth.ts
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {}
      },
      authorize: async (credentials) => {
        // Verify credentials against database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })
        
        if (!user) return null
        
        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        )
        
        return isValid ? user : null
      }
    })
  ]
})
```

---

## Video Provider System

### How It Works

```
┌──────────────────────────────────────────────────────────────────┐
│                     VIDEO PROVIDER FACTORY                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  if (process.env.VIDEO_PROVIDER === 'tmdb') {                    │
│    return new TMDBProvider()                                      │
│  } else {                                                         │
│    return new MockVideoProvider()  ← Default for development     │
│  }                                                                │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Adding a New Provider

1. Create provider file:
```typescript
// src/lib/services/video-provider/my-provider.ts
import { VideoProvider, Drama } from './types'

export class MyVideoProvider implements VideoProvider {
  async getDramas() {
    const response = await fetch('https://my-api.com/dramas')
    return response.json()
  }
  
  // Implement other methods...
}
```

2. Update factory:
```typescript
// src/lib/services/video-provider/index.ts
import { MyVideoProvider } from './my-provider'

export const videoProvider = 
  process.env.VIDEO_PROVIDER === 'my-api'
    ? new MyVideoProvider()
    : new MockVideoProvider()
```

---

## Caching Strategy

### Client-Side

Using SWR pattern with native fetch:

```typescript
// Components fetch data with useSWR or React Query
const { data } = useSWR('/api/dramas', fetcher, {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 60000 // 1 minute
})
```

### Server-Side

Next.js cache headers:

```typescript
// API routes can specify cache behavior
return new Response(JSON.stringify(data), {
  headers: {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate'
  }
})
```

---

## Error Handling

### API Error Format

All API errors follow this structure:

```typescript
{
  success: false,
  error: {
    code: 'NOT_FOUND',        // Machine-readable code
    message: 'Drama not found' // Human-readable message
  }
}
```

### Error Codes

| Code | HTTP Status | Meaning |
|------|-------------|---------|
| `UNAUTHORIZED` | 401 | Not logged in |
| `FORBIDDEN` | 403 | Not allowed |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `VALIDATION_ERROR` | 400 | Bad input |
| `INTERNAL_ERROR` | 500 | Server problem |

### Client Error Handling

```typescript
async function fetchDrama(id) {
  const res = await fetch(`/api/dramas/${id}`)
  const data = await res.json()
  
  if (!data.success) {
    // Show user-friendly message
    toast.error(data.error.message)
    return null
  }
  
  return data.data
}
```

---

## Best Practices

### DO ✅

- Use Video Provider abstraction for all content
- Store only user data in database
- Handle errors gracefully
- Log important events (but redact PII)
- Type everything with TypeScript

### DON'T ❌

- Call external APIs directly from client
- Store API keys in code
- Log passwords or tokens
- Expose internal error details to users
- Skip authentication checks

---

## Next Steps

- [API Reference](./api.md) - All available endpoints
- [Database Schema](./database.md) - Data structures
- [Security](./security.md) - Security practices
- [UI Guidelines](./ui.md) - Design system
