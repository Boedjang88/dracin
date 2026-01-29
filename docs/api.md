# API Reference

All API endpoints are located under `/api/`. They follow REST conventions and return JSON responses.

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

---

## Drama Endpoints

### GET /api/dramas

Fetch paginated list of dramas.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `limit` | number | Max results (default: 20) |
| `offset` | number | Pagination offset |
| `vibe` | string | Filter by vibe category |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "drama-001",
      "title": "Love in the Moonlight",
      "description": "A tale of...",
      "posterUrl": "https://...",
      "bannerUrl": "https://...",
      "genres": ["Romance", "Historical"],
      "vibe": "HeartWrenching",
      "releaseYear": 2024,
      "totalEpisodes": 40
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 20,
    "offset": 0
  }
}
```

---

### GET /api/dramas/[id]

Fetch single drama with episodes.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "drama-001",
    "title": "Love in the Moonlight",
    "description": "...",
    "posterUrl": "https://...",
    "bannerUrl": "https://...",
    "genres": ["Romance"],
    "vibe": "HeartWrenching",
    "releaseYear": 2024,
    "totalEpisodes": 40,
    "episodes": [
      {
        "id": "ep-001",
        "title": "Episode 1",
        "episodeNumber": 1,
        "thumbnail": "https://...",
        "duration": 2700
      }
    ],
    "cast": [
      { "name": "Actor Name", "role": "Character" }
    ],
    "isInWatchlist": false,
    "continueWatchingEpisodeId": "ep-003"
  }
}
```

---

## Episode Endpoints

### GET /api/episodes/[id]

Fetch episode details with streaming URL.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ep-001",
    "title": "Episode 1",
    "episodeNumber": 1,
    "videoUrl": "https://stream.example.com/...",
    "thumbnail": "https://...",
    "duration": 2700,
    "dramaId": "drama-001",
    "lastPosition": 1200,
    "drama": {
      "id": "drama-001",
      "title": "Love in the Moonlight",
      "episodes": [...]
    }
  }
}
```

---

## Search Endpoints

### GET /api/search

Search dramas by title or keyword.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Search query (required) |

**Response:**
```json
{
  "success": true,
  "data": [
    { "id": "drama-001", "title": "...", ... }
  ]
}
```

---

## User Endpoints

### GET /api/user/favorites

Get user's favorite dramas.

**Authentication:** Required

### POST /api/user/favorites

Add drama to favorites.

**Body:**
```json
{ "dramaId": "drama-001" }
```

### DELETE /api/user/favorites

Remove from favorites.

**Query:** `?dramaId=drama-001`

---

### POST /api/user/progress

Save watch progress.

**Authentication:** Required

**Body:**
```json
{
  "episodeId": "ep-001",
  "dramaId": "drama-001",
  "currentTime": 1200,
  "duration": 2700
}
```

---

### GET /api/history

Get user's watch history.

**Authentication:** Required

---

### GET /api/recommendations

Get personalized recommendations.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "forYou": [...],
    "becauseYouWatched": {
      "basedOn": "Drama Title",
      "recommendations": [...]
    },
    "trending": [...]
  }
}
```

---

## Authentication Endpoints

### POST /api/auth/register

Register new user.

**Body:**
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Authentication

All other auth endpoints are handled by NextAuth.js:
- `GET/POST /api/auth/signin`
- `GET/POST /api/auth/signout`
- `GET /api/auth/session`
- `GET /api/auth/providers`
