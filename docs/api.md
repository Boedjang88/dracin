# API Reference

This document covers all available API endpoints in Dracin. Each endpoint includes examples showing how to call it and what responses to expect.

---

## 📖 Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Response Format](#response-format)
- [Drama Endpoints](#drama-endpoints)
- [Episode Endpoints](#episode-endpoints)
- [Search Endpoints](#search-endpoints)
- [User Endpoints](#user-endpoints)
- [Error Handling](#error-handling)

---

## Overview

### Base URL

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:3000/api` |
| Production | `https://your-domain.com/api` |

### Common Headers

```http
Content-Type: application/json
```

For authenticated endpoints, session cookies are automatically sent by the browser.

---

## Authentication

Dracin uses **session-based authentication** via NextAuth.js. After logging in, a session cookie is set automatically.

### Check Current Session

```http
GET /api/auth/session
```

**Response (Logged In):**
```json
{
  "user": {
    "id": "user-123",
    "name": "John Doe",
    "email": "john@example.com",
    "image": "https://..."
  },
  "expires": "2024-02-01T00:00:00.000Z"
}
```

**Response (Not Logged In):**
```json
{}
```

### Register New User

```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "User created successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "USER_EXISTS",
    "message": "A user with this email already exists"
  }
}
```

### Login

```http
POST /api/auth/callback/credentials
```

This is handled by NextAuth. Use the `signIn` function from NextAuth client:

```javascript
import { signIn } from 'next-auth/react'

await signIn('credentials', {
  email: 'john@example.com',
  password: 'securepassword123',
  redirect: false
})
```

### Logout

```http
POST /api/auth/signout
```

Or use the NextAuth client:

```javascript
import { signOut } from 'next-auth/react'

await signOut()
```

---

## Response Format

All API responses follow a consistent structure:

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data here
  }
}
```

### Success with Pagination

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "limit": 20,
    "offset": 0
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable description"
  }
}
```

---

## Drama Endpoints

### List All Dramas

Get a paginated list of all available dramas.

```http
GET /api/dramas
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 20 | Max results to return |
| `offset` | number | 0 | Skip this many results |
| `vibe` | string | - | Filter by mood/category |

**Example Request:**

```bash
# Get first 10 dramas
curl http://localhost:3000/api/dramas?limit=10

# Get romantic comedies
curl http://localhost:3000/api/dramas?vibe=RomCom
```

**Example Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "drama-001",
      "title": "Love in the Moonlight",
      "description": "A heartwarming tale of love...",
      "posterUrl": "https://images.example.com/poster1.jpg",
      "bannerUrl": "https://images.example.com/banner1.jpg",
      "genres": ["Romance", "Historical", "Drama"],
      "vibe": "HeartWrenching",
      "releaseYear": 2024,
      "totalEpisodes": 40
    },
    {
      "id": "drama-002",
      "title": "Hidden Love",
      "description": "A secret love story...",
      "posterUrl": "https://images.example.com/poster2.jpg",
      "bannerUrl": "https://images.example.com/banner2.jpg",
      "genres": ["Romance", "Youth", "School"],
      "vibe": "GreenFlag",
      "releaseYear": 2023,
      "totalEpisodes": 25
    }
  ],
  "pagination": {
    "total": 50,
    "limit": 20,
    "offset": 0
  }
}
```

**JavaScript Example:**

```javascript
async function getDramas() {
  const response = await fetch('/api/dramas?limit=10')
  const result = await response.json()
  
  if (result.success) {
    console.log('Found dramas:', result.data)
    console.log('Total available:', result.pagination.total)
  } else {
    console.error('Error:', result.error.message)
  }
}
```

---

### Get Drama Details

Get detailed information about a specific drama including episodes.

```http
GET /api/dramas/:id
```

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Drama ID |

**Example Request:**

```bash
curl http://localhost:3000/api/dramas/drama-001
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "id": "drama-001",
    "title": "Love in the Moonlight",
    "description": "A heartwarming tale of love spanning decades...",
    "posterUrl": "https://images.example.com/poster1.jpg",
    "bannerUrl": "https://images.example.com/banner1.jpg",
    "genres": ["Romance", "Historical", "Drama"],
    "vibe": "HeartWrenching",
    "releaseYear": 2024,
    "totalEpisodes": 40,
    "episodes": [
      {
        "id": "ep-001",
        "title": "First Meeting",
        "episodeNumber": 1,
        "thumbnail": "https://images.example.com/ep1.jpg",
        "duration": 2700
      },
      {
        "id": "ep-002",
        "title": "Growing Feelings",
        "episodeNumber": 2,
        "thumbnail": "https://images.example.com/ep2.jpg",
        "duration": 2640
      }
    ],
    "cast": [
      { "name": "Actor Name", "role": "Lead Character", "image": "https://..." },
      { "name": "Actress Name", "role": "Female Lead", "image": "https://..." }
    ],
    "isInWatchlist": false,
    "continueWatchingEpisodeId": "ep-003"
  }
}
```

**React Component Example:**

```jsx
function DramaPage({ dramaId }) {
  const [drama, setDrama] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetch(`/api/dramas/${dramaId}`)
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setDrama(result.data)
        }
        setLoading(false)
      })
  }, [dramaId])
  
  if (loading) return <Spinner />
  if (!drama) return <NotFound />
  
  return (
    <div>
      <h1>{drama.title}</h1>
      <p>{drama.description}</p>
      <EpisodeList episodes={drama.episodes} />
    </div>
  )
}
```

---

## Episode Endpoints

### Get Episode Details

Get episode information including the streaming URL.

```http
GET /api/episodes/:id
```

⚠️ **Authentication Required** - User must be logged in.

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Episode ID |

**Example Request:**

```bash
curl http://localhost:3000/api/episodes/ep-001 \
  --cookie "session=..."
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "id": "ep-001",
    "title": "First Meeting",
    "episodeNumber": 1,
    "videoUrl": "https://stream.example.com/videos/ep001.m3u8",
    "thumbnail": "https://images.example.com/ep1.jpg",
    "duration": 2700,
    "dramaId": "drama-001",
    "lastPosition": 1200,
    "drama": {
      "id": "drama-001",
      "title": "Love in the Moonlight",
      "posterUrl": "https://...",
      "episodes": [...]
    }
  }
}
```

**Note:** The `lastPosition` field shows where the user left off (in seconds).

**Video Player Example:**

```jsx
function VideoPlayer({ episodeId }) {
  const [episode, setEpisode] = useState(null)
  
  useEffect(() => {
    fetch(`/api/episodes/${episodeId}`)
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setEpisode(result.data)
        }
      })
  }, [episodeId])
  
  if (!episode) return <Spinner />
  
  return (
    <video
      src={episode.videoUrl}
      // Start from where user left off
      onLoadedMetadata={(e) => {
        e.target.currentTime = episode.lastPosition
      }}
    />
  )
}
```

---

## Search Endpoints

### Search Dramas

Search for dramas by title or keyword.

```http
GET /api/search?q=:query
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Search query (required) |

**Example Request:**

```bash
curl "http://localhost:3000/api/search?q=love"
```

**Example Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "drama-001",
      "title": "Love in the Moonlight",
      "description": "A heartwarming tale...",
      "posterUrl": "https://...",
      "vibe": "HeartWrenching"
    },
    {
      "id": "drama-005",
      "title": "Hidden Love",
      "description": "A secret love story...",
      "posterUrl": "https://...",
      "vibe": "GreenFlag"
    }
  ]
}
```

**Search Component Example:**

```jsx
function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  
  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }
    
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            setResults(result.data)
          }
        })
    }, 300) // Debounce 300ms
    
    return () => clearTimeout(timer)
  }, [query])
  
  return (
    <div>
      <input 
        value={query} 
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search dramas..."
      />
      <ul>
        {results.map(drama => (
          <li key={drama.id}>{drama.title}</li>
        ))}
      </ul>
    </div>
  )
}
```

---

## User Endpoints

These endpoints manage user-specific data like favorites and watch progress.

### Get Favorites

Get user's watchlist/favorites.

```http
GET /api/user/favorites
```

⚠️ **Authentication Required**

**Example Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "fav-001",
      "dramaId": "drama-001",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Add to Favorites

Add a drama to user's watchlist.

```http
POST /api/user/favorites
```

⚠️ **Authentication Required**

**Request Body:**

```json
{
  "dramaId": "drama-001"
}
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "id": "fav-002",
    "dramaId": "drama-001",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Remove from Favorites

Remove a drama from user's watchlist.

```http
DELETE /api/user/favorites?dramaId=:id
```

⚠️ **Authentication Required**

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `dramaId` | string | Drama to remove |

**Example Response:**

```json
{
  "success": true,
  "message": "Removed from favorites"
}
```

---

### Save Watch Progress

Save current playback position.

```http
POST /api/user/progress
```

⚠️ **Authentication Required**

**Request Body:**

```json
{
  "episodeId": "ep-001",
  "dramaId": "drama-001",
  "currentTime": 1200,
  "duration": 2700
}
```

| Field | Type | Description |
|-------|------|-------------|
| `episodeId` | string | Episode being watched |
| `dramaId` | string | Drama it belongs to |
| `currentTime` | number | Current position (seconds) |
| `duration` | number | Total duration (seconds) |

**Example Response:**

```json
{
  "success": true,
  "data": {
    "id": "progress-001",
    "currentTime": 1200,
    "duration": 2700,
    "completed": false,
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Auto-Save Example:**

```javascript
// Save progress every 30 seconds while playing
function useProgressSync(episodeId, dramaId, videoRef) {
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current) {
        const currentTime = Math.floor(videoRef.current.currentTime)
        const duration = Math.floor(videoRef.current.duration)
        
        fetch('/api/user/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            episodeId,
            dramaId,
            currentTime,
            duration
          })
        })
      }
    }, 30000) // Every 30 seconds
    
    return () => clearInterval(interval)
  }, [episodeId, dramaId])
}
```

---

### Get Recommendations

Get personalized drama recommendations.

```http
GET /api/recommendations
```

⚠️ **Authentication Required**

**Example Response:**

```json
{
  "success": true,
  "data": {
    "forYou": [
      { "id": "drama-003", "title": "...", ... },
      { "id": "drama-007", "title": "...", ... }
    ],
    "becauseYouWatched": {
      "basedOn": "Love in the Moonlight",
      "recommendations": [
        { "id": "drama-010", "title": "...", ... }
      ]
    },
    "trending": [
      { "id": "drama-001", "title": "...", ... }
    ]
  }
}
```

---

### Get Watch History

Get user's recently watched episodes.

```http
GET /api/history
```

⚠️ **Authentication Required**

**Example Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "history-001",
      "episodeId": "ep-005",
      "dramaId": "drama-001",
      "watchedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## Error Handling

### Error Codes

| Code | Status | Description | What to Do |
|------|--------|-------------|------------|
| `UNAUTHORIZED` | 401 | Not logged in | Redirect to login page |
| `FORBIDDEN` | 403 | No permission | Show access denied |
| `NOT_FOUND` | 404 | Resource missing | Show 404 page |
| `VALIDATION_ERROR` | 400 | Bad input | Show form errors |
| `INTERNAL_ERROR` | 500 | Server error | Show generic error, retry |

### Handling Errors in Code

```javascript
async function fetchWithErrorHandling(url, options = {}) {
  try {
    const response = await fetch(url, options)
    const result = await response.json()
    
    if (!result.success) {
      // Handle specific error codes
      switch (result.error.code) {
        case 'UNAUTHORIZED':
          window.location.href = '/auth'
          break
        case 'NOT_FOUND':
          // Show not found UI
          break
        default:
          // Show generic error message
          toast.error(result.error.message)
      }
      return null
    }
    
    return result.data
    
  } catch (error) {
    // Network error
    toast.error('Network error. Please check your connection.')
    return null
  }
}
```

---

## Rate Limiting

Currently, there is no rate limiting implemented. For production, consider:

| Endpoint | Recommended Limit |
|----------|-------------------|
| `/api/auth/*` | 5 req/min per IP |
| `/api/search` | 30 req/min per user |
| Other endpoints | 100 req/min per user |

---

## Testing the API

### Using cURL

```bash
# Get dramas
curl http://localhost:3000/api/dramas

# Search
curl "http://localhost:3000/api/search?q=love"

# Get drama details
curl http://localhost:3000/api/dramas/drama-001
```

### Using Browser Console

```javascript
// Open browser console (F12) and run:
fetch('/api/dramas')
  .then(r => r.json())
  .then(console.log)
```

### Using Postman

1. Import the API endpoints
2. Set base URL to `http://localhost:3000`
3. For authenticated endpoints, first login via browser to get session cookie

---

## Next Steps

- [Architecture](./architecture.md) - How the system works
- [Database Schema](./database.md) - Data structures
- [Security](./security.md) - Security practices
