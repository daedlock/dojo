import { create } from 'zustand'

interface UIStore {
  // Header state
  isHeaderHidden: boolean
  headerScrolled: boolean

  // Workspace state
  workspaceState: {
    sidebarCollapsed: boolean
    sidebarWidth: number
    isFullScreen: boolean
    activeService: string
    commandPaletteOpen: boolean
  }

  // Modal state
  modals: {
    loginOpen: boolean
    registerOpen: boolean
    profileOpen: boolean
  }

  // Notifications
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
    duration?: number
  }>

  // Actions - Header
  setHeaderHidden: (hidden: boolean) => void
  setHeaderScrolled: (scrolled: boolean) => void

  // Actions - Workspace
  setSidebarCollapsed: (collapsed: boolean) => void
  setSidebarWidth: (width: number) => void
  setFullScreen: (fullScreen: boolean) => void
  setActiveService: (service: string) => void
  setCommandPaletteOpen: (open: boolean) => void

  // Actions - Modals
  openModal: (modal: keyof UIStore['modals']) => void
  closeModal: (modal: keyof UIStore['modals']) => void
  closeAllModals: () => void

  // Actions - Notifications
  addNotification: (notification: Omit<UIStore['notifications'][0], 'id'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void

  // Reset functions
  resetWorkspaceState: () => void
}

const defaultWorkspaceState = {
  sidebarCollapsed: false,
  sidebarWidth: 320,
  isFullScreen: false,
  activeService: 'terminal',
  commandPaletteOpen: false
}

export const useUIStore = create<UIStore>((set, get) => ({
  // Initial state
  isHeaderHidden: false,
  headerScrolled: false,
  workspaceState: defaultWorkspaceState,
  modals: {
    loginOpen: false,
    registerOpen: false,
    profileOpen: false
  },
  notifications: [],

  // Header actions
  setHeaderHidden: (hidden) => set({ isHeaderHidden: hidden }),
  setHeaderScrolled: (scrolled) => set({ headerScrolled: scrolled }),

  // Workspace actions
  setSidebarCollapsed: (collapsed) =>
    set(state => ({
      workspaceState: { ...state.workspaceState, sidebarCollapsed: collapsed }
    })),

  setSidebarWidth: (width) =>
    set(state => ({
      workspaceState: { ...state.workspaceState, sidebarWidth: width }
    })),

  setFullScreen: (fullScreen) =>
    set(state => ({
      workspaceState: { ...state.workspaceState, isFullScreen: fullScreen }
    })),

  setActiveService: (service) =>
    set(state => ({
      workspaceState: { ...state.workspaceState, activeService: service }
    })),

  setCommandPaletteOpen: (open) =>
    set(state => ({
      workspaceState: { ...state.workspaceState, commandPaletteOpen: open }
    })),

  // Modal actions
  openModal: (modal) =>
    set(state => ({
      modals: { ...state.modals, [modal]: true }
    })),

  closeModal: (modal) =>
    set(state => ({
      modals: { ...state.modals, [modal]: false }
    })),

  closeAllModals: () =>
    set({
      modals: {
        loginOpen: false,
        registerOpen: false,
        profileOpen: false
      }
    }),

  // Notification actions
  addNotification: (notification) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const newNotification = { ...notification, id }

    set(state => ({
      notifications: [...state.notifications, newNotification]
    }))

    // Auto-remove notification after duration
    const duration = notification.duration || 5000
    setTimeout(() => {
      get().removeNotification(id)
    }, duration)
  },

  removeNotification: (id) =>
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id)
    })),

  clearNotifications: () => set({ notifications: [] }),

  // Reset functions
  resetWorkspaceState: () =>
    set({ workspaceState: defaultWorkspaceState })
}))

// Selectors for common use cases
export const useHeaderState = () => {
  const isHeaderHidden = useUIStore(state => state.isHeaderHidden)
  const headerScrolled = useUIStore(state => state.headerScrolled)
  const setHeaderHidden = useUIStore(state => state.setHeaderHidden)
  const setHeaderScrolled = useUIStore(state => state.setHeaderScrolled)

  return {
    isHeaderHidden,
    headerScrolled,
    setHeaderHidden,
    setHeaderScrolled
  }
}

export const useWorkspaceState = () => useUIStore(state => ({
  ...state.workspaceState,
  setSidebarCollapsed: state.setSidebarCollapsed,
  setSidebarWidth: state.setSidebarWidth,
  setFullScreen: state.setFullScreen,
  setActiveService: state.setActiveService,
  setCommandPaletteOpen: state.setCommandPaletteOpen,
  resetWorkspaceState: state.resetWorkspaceState
}))

export const useNotifications = () => useUIStore(state => ({
  notifications: state.notifications,
  addNotification: state.addNotification,
  removeNotification: state.removeNotification,
  clearNotifications: state.clearNotifications
}))