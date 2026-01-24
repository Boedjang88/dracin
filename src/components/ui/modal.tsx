"use client"

import {
    Dialog,
    DialogContent,
    DialogOverlay,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

export default function Modal({ children }: { children: React.ReactNode }) {
    const router = useRouter()

    function onDismiss() {
        router.back()
    }

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onDismiss()}>
            <DialogOverlay className="bg-black/60 backdrop-blur-sm" />
            <DialogContent className="fixed right-0 top-0 h-screen w-full max-w-2xl overflow-y-auto border-l border-white/10 bg-sidebar p-0 shadow-2xl duration-300 sm:max-w-3xl md:max-w-4xl lg:max-w-5xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right">
                {children}
            </DialogContent>
        </Dialog>
    )
}
