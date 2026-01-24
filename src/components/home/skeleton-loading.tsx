'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface DramaCardSkeletonProps {
    className?: string
}

export function DramaCardSkeleton({ className }: DramaCardSkeletonProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
                "relative overflow-hidden rounded-lg border border-subtle bg-card",
                className
            )}
        >
            {/* Poster skeleton */}
            <div className="relative aspect-[2/3] w-full overflow-hidden">
                <motion.div
                    className="absolute inset-0 bg-white/5"
                    animate={{
                        background: [
                            'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 100%)',
                            'linear-gradient(90deg, rgba(255,255,255,0.05) 100%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 0%)',
                        ]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    }}
                    style={{ backgroundSize: '200% 100%' }}
                />
            </div>

            {/* Content skeleton */}
            <div className="p-3 space-y-2">
                {/* Title */}
                <motion.div
                    className="h-4 w-3/4 rounded bg-white/5"
                    animate={{
                        opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    }}
                />

                {/* Subtitle */}
                <motion.div
                    className="h-3 w-1/2 rounded bg-white/5"
                    animate={{
                        opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 0.2
                    }}
                />
            </div>
        </motion.div>
    )
}

interface DramaGridSkeletonProps {
    count?: number
    className?: string
}

export function DramaGridSkeleton({ count = 6, className }: DramaGridSkeletonProps) {
    return (
        <div className={cn(
            "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4",
            className
        )}>
            {Array.from({ length: count }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.3,
                        delay: i * 0.05,
                        ease: 'easeOut'
                    }}
                >
                    <DramaCardSkeleton />
                </motion.div>
            ))}
        </div>
    )
}

export function HeroSkeleton() {
    return (
        <div className="relative h-[400px] w-full overflow-hidden rounded-xl border border-subtle">
            <motion.div
                className="absolute inset-0 bg-white/5"
                animate={{
                    background: [
                        'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 100%)',
                        'linear-gradient(90deg, rgba(255,255,255,0.03) 100%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 0%)',
                    ]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                }}
                style={{ backgroundSize: '200% 100%' }}
            />

            {/* Content overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
                <motion.div
                    className="h-8 w-1/3 rounded bg-white/10"
                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                />
                <motion.div
                    className="h-4 w-2/3 rounded bg-white/5"
                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
                />
                <motion.div
                    className="h-4 w-1/2 rounded bg-white/5"
                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                />
            </div>
        </div>
    )
}
