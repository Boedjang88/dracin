'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, Bookmark, FolderHeart } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function MobileNav() {
    const pathname = usePathname()

    const navItems = [
        { name: 'Home', href: '/', icon: <Home size={24} strokeWidth={1.5} /> },
        { name: 'Browse', href: '/browse', icon: <Compass size={24} strokeWidth={1.5} /> },
        { name: 'Collections', href: '/collections', icon: <FolderHeart size={24} strokeWidth={1.5} /> },
        { name: 'Watchlist', href: '/watchlist', icon: <Bookmark size={24} strokeWidth={1.5} /> },
    ]

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/80 backdrop-blur-xl md:hidden">
            <nav className="flex h-16 items-center justify-around px-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="relative flex flex-1 flex-col items-center justify-center gap-1 py-1"
                        >
                            <span className={cn(
                                "transition-colors",
                                isActive ? "text-white" : "text-zinc-500"
                            )}>
                                {item.icon}
                            </span>
                            <span className={cn(
                                "text-[10px] font-medium transition-colors",
                                isActive ? "text-white" : "text-zinc-500"
                            )}>
                                {item.name}
                            </span>

                            {isActive && (
                                <motion.div
                                    layoutId="mobile-nav-indicator"
                                    className="absolute -top-[1px] h-[2px] w-8 bg-white"
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                        </Link>
                    )
                })}
            </nav>
            {/* Safe area for iPhone home indicator */}
            <div className="h-safe-bottom bg-black/80 backdrop-blur-xl" />
        </div>
    )
}
