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
    Play
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'

interface NavItem {
    name: string
    href: string
    icon: React.ReactNode
}

const navItems: NavItem[] = [
    { name: 'Home', href: '/', icon: <Home size={20} strokeWidth={1.5} /> },
    { name: 'Browse', href: '/browse', icon: <Compass size={20} strokeWidth={1.5} /> },
    { name: 'Watchlist', href: '/watchlist', icon: <Bookmark size={20} strokeWidth={1.5} /> },
    { name: 'History', href: '/history', icon: <History size={20} strokeWidth={1.5} /> },
    { name: 'Collections', href: '/collections', icon: <FolderHeart size={20} strokeWidth={1.5} /> },
]

export function Sidebar() {
    const { isSidebarCollapsed, toggleSidebar } = useUIStore()
    const pathname = usePathname()
    const [isMounted, setIsMounted] = useState(false)

    // Handle hydration mismatch for persisted state
    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return null // or return a loading/default state to avoid mismatch

    return (
        <TooltipProvider delayDuration={0}>
            <motion.aside
                initial={false}
                animate={{ width: isSidebarCollapsed ? 72 : 240 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-white/5 bg-black/40 backdrop-blur-xl md:flex"
            >
                {/* Logo */}
                <div className="flex h-14 items-center border-b border-white/5 px-4">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                            <Play size={16} strokeWidth={1.5} className="text-white" fill="currentColor" />
                        </div>
                        <AnimatePresence mode="wait">
                            {!isSidebarCollapsed && (
                                <motion.span
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className="text-lg font-semibold tracking-tight text-white overflow-hidden whitespace-nowrap"
                                >
                                    Dracin
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 p-2 overflow-y-auto scrollbar-thin">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href

                        return (
                            <Tooltip key={item.name}>
                                <TooltipTrigger asChild>
                                    <Link
                                        href={item.href}
                                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                                            ? 'bg-white/10 text-white'
                                            : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        <span className="flex-shrink-0">{item.icon}</span>
                                        <AnimatePresence mode="wait">
                                            {!isSidebarCollapsed && (
                                                <motion.span
                                                    initial={{ opacity: 0, width: 0 }}
                                                    animate={{ opacity: 1, width: 'auto' }}
                                                    exit={{ opacity: 0, width: 0 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="overflow-hidden whitespace-nowrap"
                                                >
                                                    {item.name}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </Link>
                                </TooltipTrigger>
                                {isSidebarCollapsed && (
                                    <TooltipContent side="right" className="glass border-subtle">
                                        {item.name}
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        )
                    })}
                </nav>

                {/* Search hint */}
                <div className="border-t border-subtle p-3">
                    <AnimatePresence mode="wait">
                        {!isSidebarCollapsed ? (
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="flex w-full items-center gap-2 rounded-lg border border-subtle bg-white/5 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/10 hover:text-white"
                                onClick={() => {
                                    // Trigger command palette
                                    const event = new KeyboardEvent('keydown', {
                                        key: 'k',
                                        metaKey: true,
                                        bubbles: true
                                    })
                                    document.dispatchEvent(event)
                                }}
                            >
                                <Search size={16} strokeWidth={1.5} />
                                <span>Search...</span>
                                <kbd className="ml-auto flex h-5 items-center gap-0.5 rounded border border-subtle bg-white/5 px-1.5 text-[10px] font-medium">
                                    <span className="text-xs">⌘</span>K
                                </kbd>
                            </motion.button>
                        ) : (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <motion.button
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                        className="flex w-full items-center justify-center rounded-lg border border-subtle bg-white/5 p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-white"
                                        onClick={() => {
                                            const event = new KeyboardEvent('keydown', {
                                                key: 'k',
                                                metaKey: true,
                                                bubbles: true
                                            })
                                            document.dispatchEvent(event)
                                        }}
                                    >
                                        <Search size={16} strokeWidth={1.5} />
                                    </motion.button>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="glass border-subtle">
                                    Search (⌘K)
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </AnimatePresence>
                </div>

                {/* Collapse button */}
                <div className="border-t border-subtle p-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleSidebar}
                                className="w-full justify-center text-muted-foreground hover:bg-white/5 hover:text-white"
                            >
                                {isSidebarCollapsed ? (
                                    <ChevronRight size={16} strokeWidth={1.5} />
                                ) : (
                                    <ChevronLeft size={16} strokeWidth={1.5} />
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="glass border-subtle">
                            {isSidebarCollapsed ? 'Expand' : 'Collapse'}
                        </TooltipContent>
                    </Tooltip>
                </div>
            </motion.aside>
        </TooltipProvider>
    )
}
