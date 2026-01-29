'use client'

import { ReactNode, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TopNav } from './top-nav'
import { MobileNav } from './mobile-nav'
import dynamic from 'next/dynamic'
import { PreviewOverlay } from '@/components/ui/preview-card/preview-overlay'

const CommandPalette = dynamic(() => import('./command-palette').then(mod => mod.CommandPalette), {
    ssr: false
})

interface AppShellProps {
    children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)

        // Fix mobile viewport height
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
        <div className="min-h-screen min-h-[calc(var(--vh,1vh)*100)] bg-black relative">
            {/* Top Navigation (Desktop & Tablet) */}
            <div className="hidden md:block">
                <TopNav />
            </div>

            {/* Mobile Bottom Nav */}
            <div className="md:hidden">
                <TopNav /> {/* Reuse TopNav for mobile top bar (logo/search) too? Or keep it specific */}
            </div>
            <MobileNav />

            {/* Command Palette (Still available via shortcut) */}
            <CommandPalette />

            {/* Global Preview Overlay (Portal-like) */}
            <PreviewOverlay />

            {/* Main content area */}
            <main className="min-h-screen w-full relative z-0">
                {children}
            </main>
        </div>
    )
}
