/**
 * Video Provider Service
 * 
 * This is the core BFF layer that proxies all video content from external APIs.
 * The client NEVER calls external APIs directly - all requests go through here.
 * 
 * Current implementation: Mock provider for development
 * Production: Swap to real provider (TMDB, custom CDN, etc.)
 */

import { logger } from '@/lib/logger'
import type {
    Drama,
    Episode,
    SearchOptions,
    PaginatedResponse,
    DramaVibe,
} from '@/lib/types/video'

// ============================================
// Video Provider Interface
// ============================================

export interface VideoProvider {
    getDramas(options?: SearchOptions): Promise<PaginatedResponse<Drama>>
    getDramaById(id: string): Promise<Drama | null>
    getEpisodes(dramaId: string): Promise<Episode[]>
    getEpisodeById(id: string): Promise<Episode | null>
    searchDramas(query: string, options?: SearchOptions): Promise<PaginatedResponse<Drama>>
    getFeaturedDramas(): Promise<Drama[]>
    getDramasByGenre(genre: string, limit?: number): Promise<Drama[]>
    getDramasByVibe(vibe: DramaVibe, limit?: number): Promise<Drama[]>
}

// ============================================
// Mock Video Provider (Development)
// ============================================

class MockVideoProvider implements VideoProvider {
    private dramas: Drama[] = MOCK_DRAMAS
    private episodes: Map<string, Episode[]> = new Map()

    constructor() {
        // Generate episodes for each drama
        this.dramas.forEach((drama) => {
            this.episodes.set(drama.id, generateMockEpisodes(drama))
        })
    }

    async getDramas(options?: SearchOptions): Promise<PaginatedResponse<Drama>> {
        const page = options?.page || 1
        const limit = options?.limit || 10

        let filtered = [...this.dramas]

        // Apply filters
        if (options?.genre) {
            filtered = filtered.filter((d) =>
                d.genres.some((g) => g.toLowerCase() === options.genre?.toLowerCase())
            )
        }

        if (options?.vibe) {
            filtered = filtered.filter((d) => d.vibe === options.vibe)
        }

        if (options?.year) {
            filtered = filtered.filter((d) => d.releaseYear === options.year)
        }

        // Sort
        if (options?.sortBy === 'rating') {
            filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        } else if (options?.sortBy === 'popularity') {
            // Mock popularity - just reverse order
            filtered.reverse()
        }

        // Paginate
        const start = (page - 1) * limit
        const paginatedData = filtered.slice(start, start + limit)

        logger.debug({ type: 'video_provider', action: 'getDramas', count: paginatedData.length })

        return {
            data: paginatedData,
            pagination: {
                page,
                limit,
                total: filtered.length,
                totalPages: Math.ceil(filtered.length / limit),
            },
        }
    }

    async getDramaById(id: string): Promise<Drama | null> {
        const drama = this.dramas.find((d) => d.id === id) || null
        logger.debug({ type: 'video_provider', action: 'getDramaById', id, found: !!drama })
        return drama
    }

    async getEpisodes(dramaId: string): Promise<Episode[]> {
        const episodes = this.episodes.get(dramaId) || []
        logger.debug({ type: 'video_provider', action: 'getEpisodes', dramaId, count: episodes.length })
        return episodes
    }

    async getEpisodeById(id: string): Promise<Episode | null> {
        for (const episodes of this.episodes.values()) {
            const episode = episodes.find((e) => e.id === id)
            if (episode) {
                logger.debug({ type: 'video_provider', action: 'getEpisodeById', id, found: true })
                return episode
            }
        }
        logger.debug({ type: 'video_provider', action: 'getEpisodeById', id, found: false })
        return null
    }

    async searchDramas(query: string, options?: SearchOptions): Promise<PaginatedResponse<Drama>> {
        const page = options?.page || 1
        const limit = options?.limit || 10
        const lowerQuery = query.toLowerCase()

        const filtered = this.dramas.filter((d) =>
            d.title.toLowerCase().includes(lowerQuery) ||
            d.description.toLowerCase().includes(lowerQuery) ||
            d.cast.some((c) => c.name.toLowerCase().includes(lowerQuery)) ||
            d.genres.some((g) => g.toLowerCase().includes(lowerQuery))
        )

        const start = (page - 1) * limit
        const paginatedData = filtered.slice(start, start + limit)

        logger.debug({ type: 'video_provider', action: 'searchDramas', query, count: paginatedData.length })

        return {
            data: paginatedData,
            pagination: {
                page,
                limit,
                total: filtered.length,
                totalPages: Math.ceil(filtered.length / limit),
            },
        }
    }

    async getFeaturedDramas(): Promise<Drama[]> {
        // Return top-rated dramas
        const featured = [...this.dramas]
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 5)

        logger.debug({ type: 'video_provider', action: 'getFeaturedDramas', count: featured.length })
        return featured
    }

    async getDramasByGenre(genre: string, limit = 10): Promise<Drama[]> {
        const filtered = this.dramas
            .filter((d) => d.genres.some((g) => g.toLowerCase() === genre.toLowerCase()))
            .slice(0, limit)

        logger.debug({ type: 'video_provider', action: 'getDramasByGenre', genre, count: filtered.length })
        return filtered
    }

    async getDramasByVibe(vibe: DramaVibe, limit = 10): Promise<Drama[]> {
        const filtered = this.dramas
            .filter((d) => d.vibe === vibe)
            .slice(0, limit)

        logger.debug({ type: 'video_provider', action: 'getDramasByVibe', vibe, count: filtered.length })
        return filtered
    }
}

// ============================================
// Mock Data - Realistic C-Drama Content
// ============================================

const MOCK_DRAMAS: Drama[] = [
    {
        id: 'drama-001',
        title: 'Love Like the Galaxy',
        originalTitle: '星汉灿烂',
        description: 'A historical romance following Cheng Shaoshang, a young woman who was neglected by her parents, as she navigates court politics and finds unexpected love with the general Ling Buyi.',
        posterUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop',
        bannerUrl: 'https://images.unsplash.com/photo-1518756131217-31eb79b20e8f?w=1920&h=600&fit=crop',
        genres: ['Romance', 'Historical', 'Drama'],
        cast: [
            { id: 'cast-001', name: 'Zhao Lusi', role: 'Cheng Shaoshang', imageUrl: '' },
            { id: 'cast-002', name: 'Wu Lei', role: 'Ling Buyi', imageUrl: '' },
        ],
        releaseYear: 2022,
        totalEpisodes: 56,
        rating: 8.9,
        vibe: 'GreenFlag',
        status: 'completed',
        country: 'China',
        language: 'Mandarin',
    },
    {
        id: 'drama-002',
        title: 'The Untamed',
        originalTitle: '陈情令',
        description: 'Two cultivators from opposing clans form a bond through their adventures in a world of martial arts and supernatural mysteries.',
        posterUrl: 'https://images.unsplash.com/photo-1533035353720-f1c6a75cd8ab?w=400&h=600&fit=crop',
        bannerUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&h=600&fit=crop',
        genres: ['Fantasy', 'Action', 'Mystery'],
        cast: [
            { id: 'cast-003', name: 'Xiao Zhan', role: 'Wei Wuxian', imageUrl: '' },
            { id: 'cast-004', name: 'Wang Yibo', role: 'Lan Wangji', imageUrl: '' },
        ],
        releaseYear: 2019,
        totalEpisodes: 50,
        rating: 9.0,
        vibe: 'Wuxia',
        status: 'completed',
        country: 'China',
        language: 'Mandarin',
    },
    {
        id: 'drama-003',
        title: 'Hidden Love',
        originalTitle: '偷偷藏不住',
        description: 'A sweet romance about Sang Zhi who has had a secret crush on her older brother\'s best friend for years.',
        posterUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=600&fit=crop',
        bannerUrl: 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=1920&h=600&fit=crop',
        genres: ['Romance', 'Youth', 'Comedy'],
        cast: [
            { id: 'cast-005', name: 'Zhao Lusi', role: 'Sang Zhi', imageUrl: '' },
            { id: 'cast-006', name: 'Chen Zheyuan', role: 'Duan Jiaxu', imageUrl: '' },
        ],
        releaseYear: 2023,
        totalEpisodes: 25,
        rating: 8.7,
        vibe: 'RomCom',
        status: 'completed',
        country: 'China',
        language: 'Mandarin',
    },
    {
        id: 'drama-004',
        title: 'Nirvana in Fire',
        originalTitle: '琅琊榜',
        description: 'A tale of revenge and political intrigue as Mei Changsu, a strategist, seeks to clear his father\'s name and restore justice.',
        posterUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400&h=600&fit=crop',
        bannerUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&h=600&fit=crop',
        genres: ['Historical', 'Political', 'Drama'],
        cast: [
            { id: 'cast-007', name: 'Hu Ge', role: 'Mei Changsu', imageUrl: '' },
            { id: 'cast-008', name: 'Wang Kai', role: 'Prince Jing', imageUrl: '' },
        ],
        releaseYear: 2015,
        totalEpisodes: 54,
        rating: 9.4,
        vibe: 'HeartWrenching',
        status: 'completed',
        country: 'China',
        language: 'Mandarin',
    },
    {
        id: 'drama-005',
        title: 'Story of Yanxi Palace',
        originalTitle: '延禧攻略',
        description: 'Wei Yingluo enters the Forbidden City as a seamstress to investigate her sister\'s death and rises through the ranks.',
        posterUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=600&fit=crop',
        bannerUrl: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=1920&h=600&fit=crop',
        genres: ['Historical', 'Romance', 'Drama'],
        cast: [
            { id: 'cast-009', name: 'Wu Jinyan', role: 'Wei Yingluo', imageUrl: '' },
            { id: 'cast-010', name: 'Nie Yuan', role: 'Emperor Qianlong', imageUrl: '' },
        ],
        releaseYear: 2018,
        totalEpisodes: 70,
        rating: 8.5,
        vibe: 'Historical',
        status: 'completed',
        country: 'China',
        language: 'Mandarin',
    },
    {
        id: 'drama-006',
        title: 'Word of Honor',
        originalTitle: '山河令',
        description: 'Two martial arts masters from different worlds form an unlikely friendship while uncovering a conspiracy.',
        posterUrl: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=600&fit=crop',
        bannerUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&h=600&fit=crop',
        genres: ['Wuxia', 'Action', 'Mystery'],
        cast: [
            { id: 'cast-011', name: 'Zhang Zhehan', role: 'Zhou Zishu', imageUrl: '' },
            { id: 'cast-012', name: 'Gong Jun', role: 'Wen Kexing', imageUrl: '' },
        ],
        releaseYear: 2021,
        totalEpisodes: 36,
        rating: 8.8,
        vibe: 'Wuxia',
        status: 'completed',
        country: 'China',
        language: 'Mandarin',
    },
    {
        id: 'drama-007',
        title: 'Go Ahead',
        originalTitle: '以家人之名',
        description: 'Three children from broken families become siblings by choice and navigate life\'s challenges together.',
        posterUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=600&fit=crop',
        bannerUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1920&h=600&fit=crop',
        genres: ['Family', 'Romance', 'Drama'],
        cast: [
            { id: 'cast-013', name: 'Tan Songyun', role: 'Li Jianjian', imageUrl: '' },
            { id: 'cast-014', name: 'Song Weilong', role: 'Ling Xiao', imageUrl: '' },
        ],
        releaseYear: 2020,
        totalEpisodes: 46,
        rating: 8.6,
        vibe: 'HeartWrenching',
        status: 'completed',
        country: 'China',
        language: 'Mandarin',
    },
    {
        id: 'drama-008',
        title: 'Ashes of Love',
        originalTitle: '香蜜沉沉烬如霜',
        description: 'A flower deity and a fire immortal\'s love story that spans three lifetimes and transcends the heavenly realms.',
        posterUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&h=600&fit=crop',
        bannerUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1920&h=600&fit=crop',
        genres: ['Fantasy', 'Romance', 'Xianxia'],
        cast: [
            { id: 'cast-015', name: 'Yang Zi', role: 'Jin Mi', imageUrl: '' },
            { id: 'cast-016', name: 'Deng Lun', role: 'Xu Feng', imageUrl: '' },
        ],
        releaseYear: 2018,
        totalEpisodes: 63,
        rating: 8.4,
        vibe: 'Fantasy',
        status: 'completed',
        country: 'China',
        language: 'Mandarin',
    },
    {
        id: 'drama-009',
        title: 'Love O2O',
        originalTitle: '微微一笑很倾城',
        description: 'A computer science major meets her perfect match both in an online game and in real life.',
        posterUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop',
        bannerUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1920&h=600&fit=crop',
        genres: ['Romance', 'Comedy', 'Gaming'],
        cast: [
            { id: 'cast-017', name: 'Zheng Shuang', role: 'Bei Weiwei', imageUrl: '' },
            { id: 'cast-018', name: 'Yang Yang', role: 'Xiao Nai', imageUrl: '' },
        ],
        releaseYear: 2016,
        totalEpisodes: 30,
        rating: 8.2,
        vibe: 'RomCom',
        status: 'completed',
        country: 'China',
        language: 'Mandarin',
    },
    {
        id: 'drama-010',
        title: 'Till the End of the Moon',
        originalTitle: '长月烬明',
        description: 'A cultivator travels back in time to prevent the demon god from destroying the world, but finds herself falling for him.',
        posterUrl: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=400&h=600&fit=crop',
        bannerUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1920&h=600&fit=crop',
        genres: ['Fantasy', 'Romance', 'Xianxia'],
        cast: [
            { id: 'cast-019', name: 'Bai Lu', role: 'Li Susu', imageUrl: '' },
            { id: 'cast-020', name: 'Luo Yunxi', role: 'Tantai Jin', imageUrl: '' },
        ],
        releaseYear: 2023,
        totalEpisodes: 40,
        rating: 8.6,
        vibe: 'HeartWrenching',
        status: 'completed',
        country: 'China',
        language: 'Mandarin',
    },
]

/**
 * Generate mock episodes for a drama
 */
function generateMockEpisodes(drama: Drama): Episode[] {
    const episodes: Episode[] = []

    for (let i = 1; i <= drama.totalEpisodes; i++) {
        episodes.push({
            id: `${drama.id}-ep-${String(i).padStart(2, '0')}`,
            dramaId: drama.id,
            episodeNumber: i,
            title: `Episode ${i}`,
            description: `Episode ${i} of ${drama.title}`,
            thumbnail: `https://images.unsplash.com/photo-${1500000000000 + i}?w=320&h=180&fit=crop`,
            streamUrl: `https://example.com/stream/${drama.id}/episode-${i}.m3u8`,
            duration: 2400 + Math.floor(Math.random() * 600), // 40-50 minutes
            releaseDate: new Date(drama.releaseYear, 0, i).toISOString(),
            subtitles: [
                { language: 'en', label: 'English', url: `/subtitles/${drama.id}/ep${i}/en.vtt` },
                { language: 'zh', label: '中文', url: `/subtitles/${drama.id}/ep${i}/zh.vtt` },
            ],
        })
    }

    return episodes
}

// ============================================
// Export Singleton Instance
// ============================================

// Use mock provider for now - can be swapped via environment variable
const providerType = process.env.VIDEO_PROVIDER || 'mock'

let videoProvider: VideoProvider

if (providerType === 'mock') {
    videoProvider = new MockVideoProvider()
} else {
    // Future: Add real provider implementations
    // case 'tmdb': videoProvider = new TMDBProvider()
    // case 'custom': videoProvider = new CustomCDNProvider()
    logger.warn({ type: 'video_provider', message: `Unknown provider type: ${providerType}, using mock` })
    videoProvider = new MockVideoProvider()
}

export { videoProvider }
