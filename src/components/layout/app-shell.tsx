'use client'

import { ReactNode, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sidebar } from './sidebar'
import { useUIStore } from '@/store/ui-store'
import dynamic from 'next/dynamic'
import { MobileNav } from './mobile-nav'

const CommandPalette = dynamic(() => import('./command-palette').then(mod => mod.CommandPalette), {
    ssr: false
})

interface AppShellProps {
    children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
    const { isSidebarCollapsed, activeThemeColor } = useUIStore()
    const [sidebarWidth, setSidebarWidth] = useState(240)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    useEffect(() => {
        setSidebarWidth(isSidebarCollapsed ? 72 : 240)
    }, [isSidebarCollapsed])

    if (!isMounted) return (
        <div className="flex min-h-screen bg-background text-white items-center justify-center">
            {/* Loading shell to prevent hydration mismatch */}
        </div>
    )

    return (
        <div className="flex min-h-screen bg-background relative overflow-hidden">
            {/* Ambient Background */}
            <motion.div
                className="fixed inset-0 pointer-events-none z-0 opacity-30"
                animate={{
                    background: activeThemeColor
                        ? `radial-gradient(circle at 50% 30%, ${activeThemeColor}, transparent 70%)`
                        : `radial-gradient(circle at 50% 30%, transparent, transparent 100%)`
                }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
            />

            <div className="z-10 h-full hidden md:block">
                <Sidebar />
            </div>

            <MobileNav />
            <CommandPalette />

            {/* Main content area */}
            <motion.main
                initial={false}
                animate={{ marginLeft: isMounted && window.innerWidth >= 768 ? sidebarWidth : 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="flex-1 min-h-screen pb-16 md:pb-0"
            >
                <div className="h-screen overflow-y-auto scrollbar-thin">
                    {children}
                </div>
            </motion.main>
        </div>
    )
}
