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
    const { isSidebarCollapsed } = useUIStore()
    const [sidebarWidth, setSidebarWidth] = useState(260)
    const [isMounted, setIsMounted] = useState(false)
    const [isDesktop, setIsDesktop] = useState(false)

    useEffect(() => {
        setIsMounted(true)

        // Handle responsive sidebar
        const checkDesktop = () => {
            const desktop = window.innerWidth >= 768
            setIsDesktop(desktop)
        }

        checkDesktop()
        window.addEventListener('resize', checkDesktop)
        return () => window.removeEventListener('resize', checkDesktop)
    }, [])

    useEffect(() => {
        setSidebarWidth(isSidebarCollapsed ? 80 : 260)
    }, [isSidebarCollapsed])

    // Fix mobile viewport height (100vh issue on iOS)
    useEffect(() => {
        const setVH = () => {
            const vh = window.innerHeight * 0.01
            document.documentElement.style.setProperty('--vh', `${vh}px`)
        }

        setVH()
        window.addEventListener('resize', setVH)
        window.addEventListener('orientationchange', setVH)

        return () => {
            window.removeEventListener('resize', setVH)
            window.removeEventListener('orientationchange', setVH)
        }
    }, [])

    if (!isMounted) return (
        <div className="flex min-h-screen bg-black text-white items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </div>
    )

    return (
        <div className="flex min-h-screen min-h-[calc(var(--vh,1vh)*100)] bg-black relative overflow-hidden">
            {/* Desktop Sidebar */}
            <div className="z-40 h-full hidden md:block">
                <Sidebar />
            </div>

            {/* Mobile Bottom Nav */}
            <MobileNav />

            {/* Command Palette */}
            <CommandPalette />

            {/* Main content area */}
            <motion.main
                initial={false}
                animate={{ marginLeft: isDesktop ? sidebarWidth : 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 min-h-screen min-h-[calc(var(--vh,1vh)*100)] relative z-0"
            >
                <div className="h-screen h-[calc(var(--vh,1vh)*100)] overflow-y-auto scrollbar-thin pb-20 md:pb-0">
                    {children}
                </div>
            </motion.main>
        </div>
    )
}
