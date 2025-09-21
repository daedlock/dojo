// Main stores
export { useDojoStore } from './dojoStore'
export { useAuthStore } from './authStore'
export { useUIStore, useHeaderState, useActiveChallenge } from './uiStore'

// Store initialization
import { useAuthStore } from './authStore'
import { useDojoStore } from './dojoStore'
import { useUIStore } from './uiStore'

// Initialize stores on app start
let isInitializing = false
export const initializeStores = async () => {
  if (isInitializing) {
    console.log('Store initialization already in progress, skipping...')
    return
  }

  isInitializing = true
  console.log('Initializing stores...')

  try {
    // 1. Initialize auth store first
    console.log('1. Fetching current user...')
    await useAuthStore.getState().fetchCurrentUser()

    // 2. Initialize dojo store with basic data
    console.log('2. Fetching dojos...')
    await useDojoStore.getState().fetchDojos()

    // 3. Pre-fetch modules for all dojos (or at least check workspace first)
    console.log('3. Checking workspace status first...')
    const { workspaceService } = await import('@/services/workspace')
    const workspaceResponse = await workspaceService.getCurrentChallenge()

    if (workspaceResponse.current_challenge) {
      const challenge = workspaceResponse.current_challenge
      console.log('4. Active challenge found, pre-fetching modules for dojo:', challenge.dojo_id)

      // 4. Fetch modules for the active challenge's dojo BEFORE processing workspace
      await useDojoStore.getState().fetchModules(challenge.dojo_id)
      console.log('5. Modules loaded, now processing active challenge...')
    }

    // 5. Process workspace with all required data already loaded
    console.log('6. Processing workspace response...')
    await useUIStore.getState().fetchActiveChallenge()

    console.log('Store initialization complete')
  } catch (error) {
    console.error('Store initialization failed:', error)
  } finally {
    isInitializing = false
  }
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

