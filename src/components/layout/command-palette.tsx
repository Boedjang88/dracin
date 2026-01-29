'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command'
import {
    Home,
    Compass,
    Bookmark,
    History,
    FolderHeart,
    Play,
    Search,
    Sparkles
} from 'lucide-react'

const navigationItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Browse', href: '/browse', icon: Compass },
    { name: 'Watchlist', href: '/watchlist', icon: Bookmark },
    { name: 'History', href: '/history', icon: History },
    { name: 'Collections', href: '/collections', icon: FolderHeart },
]

const vibeFilters = [
    { name: 'Green Flag Dramas', vibe: 'GreenFlag', icon: Sparkles },
    { name: 'Heart-Wrenching', vibe: 'HeartWrenching', icon: Sparkles },
    { name: 'Wuxia Adventures', vibe: 'Wuxia', icon: Sparkles },
    { name: 'Modern Romance', vibe: 'ModernRomance', icon: Sparkles },
    { name: 'Historical Romance', vibe: 'HistoricalRomance', icon: Sparkles },
]

export function CommandPalette() {
    const [open, setOpen] = useState(false)
    const [dramas, setDramas] = useState<{ id: string, title: string, vibe: string }[]>([])
    const router = useRouter()

    useEffect(() => {
        // Fetch dramas for search
        fetch('/api/dramas')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    // Handle paginated response - dramas are in data.data.data
                    const dramaList = Array.isArray(data.data)
                        ? data.data
                        : (data.data.data || [])
                    setDramas(dramaList)
                }
            })
            .catch(err => console.error('Failed to load dramas for search', err))
    }, [])

    // Handle keyboard shortcut
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    const runCommand = useCallback((command: () => void) => {
        setOpen(false)
        command()
    }, [])

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput
                placeholder="Search dramas, navigate, or filter by vibe..."
                className="border-none focus:ring-0"
            />
            <CommandList className="scrollbar-thin">
                <CommandEmpty>No results found.</CommandEmpty>

                <CommandGroup heading="Dramas">
                    {dramas.map((drama) => (
                        <CommandItem
                            key={drama.id}
                            onSelect={() => runCommand(() => router.push(`/drama/${drama.id}`))}
                            className="gap-2"
                        >
                            <Play size={16} strokeWidth={1.5} className="text-muted-foreground" />
                            <span>{drama.title}</span>
                            <span className="ml-auto text-xs text-muted-foreground">{drama.vibe}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Navigation">
                    {navigationItems.map((item) => (
                        <CommandItem
                            key={item.name}
                            onSelect={() => runCommand(() => router.push(item.href))}
                            className="gap-2"
                        >
                            <item.icon size={16} strokeWidth={1.5} className="text-muted-foreground" />
                            <span>{item.name}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Filter by Vibe">
                    {vibeFilters.map((item) => (
                        <CommandItem
                            key={item.vibe}
                            onSelect={() => runCommand(() => router.push(`/browse?vibe=${item.vibe}`))}
                            className="gap-2"
                        >
                            <item.icon size={16} strokeWidth={1.5} className="text-muted-foreground" />
                            <span>{item.name}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Quick Actions">
                    <CommandItem
                        onSelect={() => runCommand(() => router.push('/browse'))}
                        className="gap-2"
                    >
                        <Search size={16} strokeWidth={1.5} className="text-muted-foreground" />
                        <span>Search all dramas</span>
                    </CommandItem>
                    <CommandItem
                        onSelect={() => runCommand(() => router.push('/history'))}
                        className="gap-2"
                    >
                        <Play size={16} strokeWidth={1.5} className="text-muted-foreground" />
                        <span>Continue watching</span>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}
