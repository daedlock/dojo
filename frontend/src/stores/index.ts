// Main stores
export { useDojoStore } from './dojoStore'
export { useAuthStore } from './authStore'
export { useUIStore, useHeaderState, useWorkspaceState, useNotifications } from './uiStore'

// Store initialization
import { useAuthStore } from './authStore'
import { useDojoStore } from './dojoStore'

// Initialize stores on app start
export const initializeStores = async () => {
  // Initialize auth store
  await useAuthStore.getState().fetchCurrentUser()

  // Initialize dojo store with basic data
  await useDojoStore.getState().fetchDojos()
}

// Helper hooks for common patterns
export const useAuthenticatedUser = () => {
  const user = useAuthStore(state => state.user)
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  const isAdmin = useAuthStore(state => state.user?.type === 'admin')
  const displayName = useAuthStore(state => state.user?.username || 'Unknown User')

  return {
    user,
    isAuthenticated,
    isAdmin,
    displayName,
    // Derived properties that match the old hook interface
    name: user?.username,
    email: user?.email,
    admin: user?.type === 'admin'
  }
}

// Hook that matches the old useIsAuthenticated interface
export const useIsAuthenticated = () => {
  const user = useAuthStore(state => state.user)
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  const isLoading = useAuthStore(state => state.isLoading)

  return {
    isAuthenticated,
    isLoading,
    user: user ? {
      name: user.username,
      email: user.email,
      admin: user.type === 'admin'
    } : null
  }
}