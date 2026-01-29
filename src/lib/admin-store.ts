/**
 * Admin Data Store
 * 
 * Shared in-memory storage for admin-managed content.
 * In production, this would use database or external CMS.
 */

export interface AdminDrama {
    id: string
    title: string
    originalTitle?: string
    description: string
    posterUrl: string
    bannerUrl: string
    genres: string[]
    cast: { name: string; role: string }[]
    releaseYear: number
    totalEpisodes: number
    rating?: number
    vibe?: string
    status: 'ongoing' | 'completed' | 'upcoming'
    country: string
    language: string
    createdAt: Date
    updatedAt: Date
}

export interface AdminEpisode {
    id: string
    dramaId: string
    episodeNumber: number
    title: string
    description?: string
    thumbnail: string
    streamUrl: string
    duration: number // seconds
    releaseDate?: string
    subtitles: { language: string; label: string; url: string }[]
    createdAt: Date
    updatedAt: Date
}

// In-memory storage
let adminDramas: AdminDrama[] = []
let adminEpisodes: AdminEpisode[] = []

// Drama operations
export function getAdminDramas() {
    return adminDramas
}

export function setAdminDramas(dramas: AdminDrama[]) {
    adminDramas = dramas
}

export function addAdminDrama(drama: AdminDrama) {
    adminDramas.push(drama)
}

export function findDramaById(id: string) {
    return adminDramas.find(d => d.id === id)
}

export function findDramaIndex(id: string) {
    return adminDramas.findIndex(d => d.id === id)
}

export function updateDramaAt(index: number, drama: AdminDrama) {
    adminDramas[index] = drama
}

export function removeDramaAt(index: number) {
    return adminDramas.splice(index, 1)[0]
}

// Episode operations
export function getAdminEpisodes() {
    return adminEpisodes
}

export function setAdminEpisodes(episodes: AdminEpisode[]) {
    adminEpisodes = episodes
}

export function addAdminEpisode(episode: AdminEpisode) {
    adminEpisodes.push(episode)
}

export function findEpisodeById(id: string) {
    return adminEpisodes.find(ep => ep.id === id)
}

export function findEpisodeIndex(id: string) {
    return adminEpisodes.findIndex(ep => ep.id === id)
}

export function updateEpisodeAt(index: number, episode: AdminEpisode) {
    adminEpisodes[index] = episode
}

export function removeEpisodeAt(index: number) {
    return adminEpisodes.splice(index, 1)[0]
}

export function getEpisodesByDramaId(dramaId: string) {
    return adminEpisodes.filter(ep => ep.dramaId === dramaId)
}

export function findDuplicateEpisode(dramaId: string, episodeNumber: number) {
    return adminEpisodes.find(
        ep => ep.dramaId === dramaId && ep.episodeNumber === episodeNumber
    )
}
