import { create } from 'zustand'

interface AppState {
  sidebarOpen: boolean
  searchQuery: string
  activeTab: string
  theme: string
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setSearchQuery: (query: string) => void
  setActiveTab: (tab: string) => void
  setTheme: (theme: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  searchQuery: '',
  activeTab: 'upcoming',
  theme: 'system',
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setTheme: (theme) => set({ theme }),
}))
