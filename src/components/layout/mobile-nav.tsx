'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, Bookmark, History, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function MobileNav() {
    const pathname = usePathname()

    const navItems = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Browse', href: '/browse', icon: Compass },
        { name: 'Search', href: '#search', icon: Search, action: 'search' },
        { name: 'History', href: '/history', icon: History },
        { name: 'Watchlist', href: '/watchlist', icon: Bookmark },
    ]

    const handleSearchClick = (e: React.MouseEvent) => {
        e.preventDefault()
        // Trigger command palette
        const event = new KeyboardEvent('keydown', {
            key: 'k',
            metaKey: true,
            bubbles: true
        })
        document.dispatchEvent(event)
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden pointer-events-none">
            {/* Nav Container */}
            <div className="pointer-events-auto relative">
                {/* Blur Background */}
                <div className="absolute inset-0 glass-heavy border-t border-white/5" />

                {/* Gradient Top Fade */}
                <div className="absolute -top-12 left-0 right-0 h-12 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

                {/* Nav Items */}
                <div className="relative flex items-center justify-around px-2 pb-safe-area-bottom">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon
                        const isSearch = item.action === 'search'

                        const content = (
                            <>
                                <div className="relative p-1.5 mb-1 group-active:scale-95 transition-transform duration-200">
                                    {isActive && (
                                        <motion.div
                                            layoutId="mobile-nav-pill"
                                            className="absolute inset-0 bg-white/10 rounded-xl"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <Icon
                                        size={24}
                                        strokeWidth={isActive ? 2.5 : 2}
                                        className={cn(
                                            "relative z-10 transition-colors duration-200",
                                            isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
                                        )}
                                    />
                                </div>
                                <span className={cn(
                                    "text-[10px] font-medium transition-colors duration-200",
                                    isActive ? "text-white" : "text-zinc-500"
                                )}>
                                    {item.name}
                                </span>
                            </>
                        )

                        if (isSearch) {
                            return (
                                <button
                                    key={item.name}
                                    onClick={handleSearchClick}
                                    className="group flex flex-1 flex-col items-center justify-center py-3 touch-manipulation focus:outline-none"
                                >
                                    {content}
                                </button>
                            )
                        }

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="group flex flex-1 flex-col items-center justify-center py-3 touch-manipulation focus:outline-none"
                            >
                                {content}
                            </Link>
                        )
                    })}
                </div>

                {/* iOS Home Indicator Spacer (handled by pb-safe-area-bottom in utilities but extra pad here if needed) */}
                <div className="h-safe-area-bottom bg-black" />
            </div>
        </nav>
    )
}
