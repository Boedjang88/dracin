/**
 * Video Provider Types
 * 
 * These types represent data from the external video API.
 * The internal database NEVER stores this data - it's fetched at runtime.
 */

// ============================================
// External API Response Types
// ============================================

export interface Drama {
    id: string
    title: string
    originalTitle?: string
    description: string
    posterUrl: string
    bannerUrl: string
    genres: string[]
    cast: CastMember[]
    releaseYear: number
    totalEpisodes: number
    rating?: number
    vibe?: DramaVibe
    status: 'ongoing' | 'completed' | 'upcoming'
    country: string
    language: string
}

export interface CastMember {
    id: string
    name: string
    role: string
    imageUrl?: string
}

export interface Episode {
    id: string
    dramaId: string
    episodeNumber: number
    title: string
    description?: string
    thumbnail: string
    streamUrl: string
    duration: number // seconds
    releaseDate?: string
    subtitles: Subtitle[]
}

export interface Subtitle {
    language: string
    label: string
    url: string
}

// ============================================
// Drama Categories / Vibes
// ============================================

export type DramaVibe =
    | 'GreenFlag'
    | 'HeartWrenching'
    | 'Wuxia'
    | 'RomCom'
    | 'Historical'
    | 'Modern'
    | 'Fantasy'
    | 'Thriller'
    | 'SliceOfLife'

// ============================================
// API Request/Response Types
// ============================================

export interface SearchOptions {
    query?: string
    genre?: string
    vibe?: DramaVibe
    year?: number
    page?: number
    limit?: number
    sortBy?: 'latest' | 'rating' | 'popularity'
}

export interface PaginatedResponse<T> {
    data: T[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

export interface DramaWithProgress extends Drama {
    progress?: {
        episodeId: string
        episodeNumber: number
        currentTime: number
        duration: number
        completed: boolean
    }
}

// ============================================
// User Feature Types (stored in DB)
// ============================================

export interface UserProgressData {
    id: string
    userId: string
    episodeId: string
    dramaId: string
    currentTime: number
    duration: number
    completed: boolean
    updatedAt: Date
}

export interface FavoriteData {
    id: string
    userId: string
    dramaId: string
    createdAt: Date
}

export interface WatchHistoryData {
    id: string
    userId: string
    episodeId: string
    dramaId: string
    watchedAt: Date
    watchTime: number
}

// ============================================
// Audit Log Types
// ============================================

export type AuditAction =
    | 'login'
    | 'logout'
    | 'register'
    | 'password_change'
    | 'failed_auth'
    | 'sensitive_operation'
    | 'favorites_add'
    | 'favorites_remove'

export interface AuditLogEntry {
    userId?: string
    action: AuditAction
    ip?: string
    userAgent?: string
    metadata?: Record<string, unknown>
}

// ============================================
// API Error Types
// ============================================

export interface ApiError {
    code: string
    message: string
    details?: unknown
}

export interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: string
}
