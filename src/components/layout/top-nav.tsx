'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Search, Bell, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/ui-store'
import Image from 'next/image'

const NAV_ITEMS = [
    { label: 'Home', href: '/' },
    { label: 'Browse', href: '/browse' },
    { label: 'Collections', href: '/collections' },
    { label: 'My List', href: '/watchlist' },
    { label: 'History', href: '/history' },
]

export function TopNav() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const router = useRouter()
    const pathname = usePathname()
    const { toggleSidebar } = useUIStore()

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            router.push(`/browse?q=${encodeURIComponent(searchQuery)}`)
            setIsSearchOpen(false)
        }
    }

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-12 py-4",
                isScrolled
                    ? "bg-black/95 backdrop-blur-xl border-b border-white/5"
                    : "bg-gradient-to-b from-black via-black/60 to-transparent pb-12"
            )}
        >
            <div className="flex items-center justify-between gap-4">
                {/* Left Section: Logo & Links */}
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleSidebar}
                            className="md:hidden text-white"
                            aria-label="Toggle Menu"
                        >
                            <Menu />
                        </button>
                        <Link href="/" className="text-2xl font-black text-red-600 tracking-tighter hover:scale-105 transition-transform">
                            DRACIN
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <ul className="hidden md:flex items-center gap-6">
                        {NAV_ITEMS.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "text-sm font-medium transition-colors hover:text-white",
                                        pathname === item.href ? "text-white" : "text-zinc-300"
                                    )}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Right Section: Search & Profile */}
                <div className="flex items-center gap-4">
                    {/* Search Bar */}
                    <div className={cn(
                        "flex items-center bg-black/50 border border-white/10 rounded-full transition-all duration-300 overflow-hidden",
                        isSearchOpen ? "w-64 px-4 py-2 bg-black/80" : "w-10 h-10 border-0 bg-transparent justify-center cursor-pointer hover:bg-white/10"
                    )}>
                        <form onSubmit={handleSearch} className="flex items-center w-full">
                            <button
                                type="button"
                                onClick={() => {
                                    if (!isSearchOpen) {
                                        setIsSearchOpen(true)
                                    } else {
                                        handleSearch({ preventDefault: () => { } } as React.FormEvent)
                                    }
                                }}
                                aria-label="Search"
                            >
                                <Search size={20} className="text-white flex-shrink-0" />
                            </button>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Titles, people, genres"
                                className={cn(
                                    "bg-transparent border-none outline-none text-white text-sm ml-2 w-full placeholder:text-zinc-500",
                                    !isSearchOpen && "hidden"
                                )}
                                onBlur={() => !searchQuery && setIsSearchOpen(false)}
                                autoFocus={isSearchOpen}
                            />
                            {isSearchOpen && searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="ml-2 text-zinc-500 hover:text-white"
                                    aria-label="Clear search"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </form>
                    </div>

                    {/* Notifications */}
                    <button className="text-zinc-300 hover:text-white transition-colors" aria-label="Notifications">
                        <Bell size={20} />
                    </button>

                    {/* Profile */}
                    <Link href="/profile" className="w-8 h-8 rounded-full overflow-hidden border border-white/20 hover:border-white transition-colors">
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-xs font-bold">
                            U
                        </div>
                    </Link>
                </div>
            </div>
        </nav>
    )
}
