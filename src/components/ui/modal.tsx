"use client"

import {
    Dialog,
    DialogContent,
    DialogOverlay,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

export default function Modal({ children }: { children: React.ReactNode }) {
    const router = useRouter()

    function onDismiss() {
        router.back()
    }

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onDismiss()}>
            <DialogOverlay className="bg-black/80 backdrop-blur-md fixed inset-0 z-50 animate-in fade-in-0 duration-300" />
            <DialogContent
                className="fixed left-[50%] top-[50%] z-50 w-full max-w-5xl translate-x-[-50%] translate-y-[-50%] border-none bg-transparent p-0 shadow-2xl duration-200"
                showCloseButton={false}
            >
                <DialogTitle className="sr-only">Drama Details</DialogTitle>
                <DialogDescription className="sr-only">
                    Details and episodes for the selected drama
                </DialogDescription>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="relative w-full h-[85vh] bg-[#141414] overflow-hidden rounded-2xl border border-white/10 shadow-2xl flex flex-col"
                >
                    {/* Header/Close Button */}
                    <div className="absolute top-4 right-4 z-50">
                        <button
                            onClick={onDismiss}
                            className="p-2 rounded-full bg-black/50 hover:bg-white/20 text-white/70 hover:text-white transition-colors backdrop-blur-md"
                        >
                            <X size={20} />
                            <span className="sr-only">Close</span>
                        </button>
                    </div>

                    {/* Content Container */}
                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                        {children}
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    )
}
