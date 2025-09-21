import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { dojoService } from '@/services/dojo'

// Cache for memoized selectors
const selectorCache = new Map()

interface Dojo {
  id: string
  name: string
  description?: string
  official: boolean
  award?: {
    belt?: string
    emoji?: string
  }
}

interface Module {
  id: string
  name: string
  description?: string
  challenges: Challenge[]
}

interface Challenge {
  id: string
  name: string
  description?: string
  required: boolean
  solved?: boolean
}

interface Solve {
  user_id: string
  dojo_id: string
  module_id: string
  challenge_id: string
  timestamp: string
}

interface DojoStore {
  // Data
  dojos: Dojo[]
  modules: Record<string, Module[]>
  solves: Record<string, Solve[]>

  // Loading states
  loadingDojos: boolean
  loadingModules: Record<string, boolean>
  loadingSolves: Record<string, boolean>

  // Error states
  dojoError: string | null
  moduleError: Record<string, string | null>
  solveError: Record<string, string | null>

  // Actions
  fetchDojos: () => Promise<void>
  fetchModules: (dojoId: string) => Promise<void>
  fetchSolves: (dojoId: string, username?: string) => Promise<void>
  addSolve: (dojoId: string, moduleId: string, challengeId: string, userId?: string) => void

  // Selectors
  getDojoById: (dojoId: string) => Dojo | undefined
  getModulesByDojo: (dojoId: string) => Module[]
  getSolvesByDojo: (dojoId: string) => Solve[]
  getChallengeStats: (dojoId: string) => {
    totalChallenges: number
    totalSolves: number
    uniqueHackers: number
    hackingNow: number
  }
}

export const useDojoStore = create<DojoStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    dojos: [],
    modules: {},
    solves: {},
    loadingDojos: false,
    loadingModules: {},
    loadingSolves: {},
    dojoError: null,
    moduleError: {},
    solveError: {},

    // Actions
    fetchDojos: async () => {
      const state = get()
      // Prevent duplicate fetches if already loading or have data
      if (state.loadingDojos || state.dojos.length > 0) {
        return
      }

      set({ loadingDojos: true, dojoError: null })
      try {
        const response = await dojoService.getDojos()
        set({
          dojos: response.dojos || [],
          loadingDojos: false
        })
      } catch (error) {
        set({
          dojoError: error instanceof Error ? error.message : 'Failed to fetch dojos',
          loadingDojos: false
        })
      }
    },

    fetchModules: async (dojoId: string) => {
      const state = get()
      // Prevent duplicate fetches if already loading or have data
      if (state.loadingModules[dojoId] || state.modules[dojoId]) {
        return
      }

      set(state => ({
        loadingModules: { ...state.loadingModules, [dojoId]: true },
        moduleError: { ...state.moduleError, [dojoId]: null }
      }))
      try {
        const response = await dojoService.getDojoModules(dojoId)
        set(state => ({
          modules: { ...state.modules, [dojoId]: response.modules || [] },
          loadingModules: { ...state.loadingModules, [dojoId]: false }
        }))
        // Clear stats cache when modules change
        selectorCache.delete(`stats-${dojoId}`)
      } catch (error) {
        set(state => ({
          moduleError: {
            ...state.moduleError,
            [dojoId]: error instanceof Error ? error.message : 'Failed to fetch modules'
          },
          loadingModules: { ...state.loadingModules, [dojoId]: false }
        }))
      }
    },

    fetchSolves: async (dojoId: string, username?: string) => {
      const key = `${dojoId}-${username || 'all'}`
      const state = get()
      // Prevent duplicate fetches if already loading or have data
      if (state.loadingSolves[key] || state.solves[key]) {
        return
      }

      set(state => ({
        loadingSolves: { ...state.loadingSolves, [key]: true },
        solveError: { ...state.solveError, [key]: null }
      }))
      try {
        const response = await dojoService.getDojoSolves(dojoId, username)
        set(state => ({
          solves: { ...state.solves, [key]: response.solves || [] },
          loadingSolves: { ...state.loadingSolves, [key]: false }
        }))
        // Clear stats cache when solves change
        selectorCache.delete(`stats-${dojoId}`)
      } catch (error) {
        set(state => ({
          solveError: {
            ...state.solveError,
            [key]: error instanceof Error ? error.message : 'Failed to fetch solves'
          },
          loadingSolves: { ...state.loadingSolves, [key]: false }
        }))
      }
    },

    addSolve: (dojoId: string, moduleId: string, challengeId: string, userId?: string) => {
      const key = `${dojoId}-${userId || 'all'}`
      const newSolve: Solve = {
        user_id: userId || 'current-user',
        dojo_id: dojoId,
        module_id: moduleId,
        challenge_id: challengeId,
        timestamp: new Date().toISOString()
      }

      set(state => {
        const existingSolves = state.solves[key] || []
        // Check if solve already exists to avoid duplicates
        const alreadyExists = existingSolves.some(solve =>
          solve.module_id === moduleId && solve.challenge_id === challengeId
        )

        if (alreadyExists) {
          return state // No change if already solved
        }

        return {
          solves: {
            ...state.solves,
            [key]: [...existingSolves, newSolve]
          }
        }
      })

      // Clear stats cache when solves change
      selectorCache.delete(`stats-${dojoId}`)
    },


    // Selectors
    getDojoById: (dojoId: string) => {
      return get().dojos.find(dojo => dojo.id === dojoId)
    },

    getModulesByDojo: (dojoId: string) => {
      return get().modules[dojoId] || []
    },

    getSolvesByDojo: (dojoId: string) => {
      return get().solves[`${dojoId}-all`] || []
    },

    getChallengeStats: (dojoId: string) => {
      const cacheKey = `stats-${dojoId}`

      // Check if we have cached stats
      if (selectorCache.has(cacheKey)) {
        return selectorCache.get(cacheKey)
      }

      const state = get()
      const modules = state.modules[dojoId] || []
      const solves = state.solves[`${dojoId}-all`] || []

      const totalChallenges = modules.reduce((acc, mod) => acc + (mod.challenges?.length || 0), 0)
      const totalSolves = solves.length
      const uniqueHackers = new Set(solves.map(solve => solve.user_id)).size

      // Calculate "hacking now" based on recent activity (solves in last 24 hours)
      const now = new Date()
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const recentSolves = solves.filter(solve => {
        if (!solve.timestamp) return false
        const solveDate = new Date(solve.timestamp)
        return solveDate >= yesterday
      })
      const hackingNow = new Set(recentSolves.map(solve => solve.user_id)).size

      const stats = {
        totalChallenges,
        totalSolves,
        uniqueHackers,
        hackingNow
      }

      // Cache the result
      selectorCache.set(cacheKey, stats)
      return stats
    }
  }))
)