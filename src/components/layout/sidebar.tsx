'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/store/ui-store'
import {
    Home,
    Search,
    Compass,
    Bookmark,
    History,
    FolderHeart,
    ChevronLeft,
    ChevronRight,
    PlayCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface NavItem {
    name: string
    href: string
    icon: React.ReactNode
}

const navItems: NavItem[] = [
    { name: 'Home', href: '/', icon: <Home size={20} /> },
    { name: 'Browse', href: '/browse', icon: <Compass size={20} /> },
    { name: 'Watchlist', href: '/watchlist', icon: <Bookmark size={20} /> },
    { name: 'History', href: '/history', icon: <History size={20} /> },
    { name: 'Collections', href: '/collections', icon: <FolderHeart size={20} /> },
]

export function Sidebar() {
    const { isSidebarCollapsed, toggleSidebar } = useUIStore()
    const pathname = usePathname()
    const [isMounted, setIsMounted] = useState(false)

    // Handle hydration mismatch for persisted state
    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return null

    return (
        <TooltipProvider delayDuration={0}>
            <motion.aside
                initial={false}
                animate={{ width: isSidebarCollapsed ? 80 : 260 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                    "fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-white/5 md:flex",
                    "glass-heavy backdrop-blur-3xl"
                )}
            >
                {/* Logo */}
                <div className="flex h-20 items-center px-6 mb-2">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-900 shadow-lg shadow-red-900/20 group-hover:scale-105 transition-transform duration-300">
                            <PlayCircle size={20} className="text-white fill-white/20" />
                        </div>
                        <AnimatePresence mode="wait">
                            {!isSidebarCollapsed && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="text-xl font-bold tracking-tight text-white overflow-hidden whitespace-nowrap"
                                >
                                    DRACIN
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-2 p-4 overflow-y-auto scrollbar-none">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href

                        return (
                            <Tooltip key={item.name}>
                                <TooltipTrigger asChild>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "group flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-200 relative overflow-hidden",
                                            isActive
                                                ? "text-white shadow-lg shadow-black/20"
                                                : "text-zinc-400 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="sidebar-active"
                                                className="absolute inset-0 bg-white/10 border border-white/5 rounded-xl"
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}

                                        <span className="relative z-10 flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                                            {item.icon}
                                        </span>

                                        <AnimatePresence mode="wait">
                                            {!isSidebarCollapsed && (
                                                <motion.span
                                                    initial={{ opacity: 0, width: 0 }}
                                                    animate={{ opacity: 1, width: 'auto' }}
                                                    exit={{ opacity: 0, width: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="relative z-10 overflow-hidden whitespace-nowrap"
                                                >
                                                    {item.name}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>

                                        {isActive && !isSidebarCollapsed && (
                                            <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                                        )}
                                    </Link>
                                </TooltipTrigger>
                                {isSidebarCollapsed && (
                                    <TooltipContent side="right" className="glass border-white/10 text-white ml-2">
                                        {item.name}
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        )
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 space-y-2">
                    {/* Search */}
                    <AnimatePresence mode="wait">
                        {!isSidebarCollapsed ? (
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-black/20 hover:bg-black/40 border border-white/5 text-zinc-400 group transition-all"
                                onClick={() => {
                                    const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true })
                                    document.dispatchEvent(event)
                                }}
                            >
                                <Search size={20} />
                                <span className="text-sm font-medium group-hover:text-white transition-colors">Search</span>
                                <kbd className="ml-auto text-[10px] font-mono bg-white/5 px-1.5 py-0.5 rounded border border-white/5 text-zinc-500">⌘K</kbd>
                            </motion.button>
                        ) : (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => {
                                            const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true })
                                            document.dispatchEvent(event)
                                        }}
                                        className="w-full flex justify-center p-3 rounded-xl bg-black/20 hover:bg-black/40 text-zinc-400 hover:text-white transition-colors"
                                        aria-label="Search"
                                    >
                                        <Search size={20} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="glass border-white/10 text-white ml-2">Search ⌘K</TooltipContent>
                            </Tooltip>
                        )}
                    </AnimatePresence>

                    {/* Collapse Toggle */}
                    <button
                        onClick={toggleSidebar}
                        className="w-full h-8 flex items-center justify-center text-zinc-500 hover:text-white transition-colors mt-2"
                        aria-label="Toggle sidebar"
                    >
                        {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>
                </div>
            </motion.aside>
        </TooltipProvider>
    )
}
