import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
    isSidebarCollapsed: boolean
    activeThemeColor: string | null
    toggleSidebar: () => void
    setSidebarCollapsed: (collapsed: boolean) => void
    setThemeColor: (color: string | null) => void
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            isSidebarCollapsed: false,
            activeThemeColor: null,
            toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
            setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
            setThemeColor: (color) => set({ activeThemeColor: color }),
        }),
        {
            name: 'ui-storage',
        }
    )
)
