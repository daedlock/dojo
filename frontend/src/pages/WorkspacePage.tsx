import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useDojoStore, useUIStore } from '@/stores'
import { DojoWorkspaceLayout } from '@/components/layout/DojoWorkspaceLayout'
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'

export default function WorkspacePage() {
  const { dojoId, moduleId, challengeId, resourceId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [isExiting, setIsExiting] = useState(false)
  const previousPathRef = useRef<string>('')

  // Extract resource from query params if using /workspace/ route
  const searchParams = new URLSearchParams(location.search)
  const queryResourceId = searchParams.get('resource')

  // Determine the final resource ID (from URL params or query params)
  const finalResourceId = resourceId || queryResourceId

  // Determine if we're in challenge or resource mode
  const isResourceMode = !!finalResourceId
  const isChallenge = !!challengeId

  // Basic state access without complex selectors
  const dojos = useDojoStore(state => state.dojos)
  const modulesMap = useDojoStore(state => state.modules)
  const solvesMap = useDojoStore(state => state.solves)
  const isLoading = useDojoStore(state => state.loadingDojos || state.loadingModules[dojoId || ''] || state.loadingSolves[`${dojoId}-all`])
  const error = useDojoStore(state => state.dojoError || state.moduleError[dojoId || ''] || state.solveError[`${dojoId}-all`])

  // Set active challenge in UI store - MUST be before any conditional returns
  const setActiveChallenge = useUIStore(state => state.setActiveChallenge)

  // Simple data lookup
  const dojo = dojos.find(d => d.id === dojoId)
  const modules = modulesMap[dojoId || ''] || []
  const solves = solvesMap[`${dojoId}-all`] || []

  // Get solved challenge IDs
  const solvedChallengeIds = new Set(
    solves
      ?.filter(solve => solve.module_id === moduleId)
      .map(solve => solve.challenge_id) || []
  )


  // Enrich module with solved status
  const module = modules.find(m => m.id === moduleId)
  const enrichedModule = module ? {
    ...module,
    challenges: module.challenges.map(challenge => ({
      ...challenge,
      solved: solvedChallengeIds.has(challenge.id)
    }))
  } : undefined

  const challenge = enrichedModule?.challenges?.find(c => c.id === challengeId)
  const resource = enrichedModule?.resources?.find(r => r.id === finalResourceId)

  useEffect(() => {
    if (dojoId) {
      useDojoStore.getState().fetchModules(dojoId)
      useDojoStore.getState().fetchSolves(dojoId)
    }
  }, [dojoId])

  // Check if we're already in workspace (navigating between challenges)
  const isAlreadyInWorkspace = useRef(false)

  useEffect(() => {
    // Check if previous path was also a workspace page
    const wasInWorkspace = previousPathRef.current.includes('/challenge/') || previousPathRef.current.includes('/resource/')
    isAlreadyInWorkspace.current = wasInWorkspace

    // Update previous path for next navigation
    previousPathRef.current = location.pathname
  }, [location.pathname])

  useEffect(() => {
    if (dojo && enrichedModule && challenge) {
      const challengeData = {
        dojoId: dojo.id,
        moduleId: enrichedModule.id,
        challengeId: challenge.id,
        challengeName: challenge.name,
        dojoName: dojo.name,
        moduleName: enrichedModule.name
      }
      console.log('Setting active challenge:', challengeData)
      setActiveChallenge(challengeData)
    }
    // Don't clear on cleanup - let the widget persist until user terminates
  }, [dojo, enrichedModule, challenge, setActiveChallenge])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading workspace...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Failed to load workspace</h1>
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dojos
          </Button>
        </div>
      </div>
    )
  }

  // Check if we have the required data based on the mode
  const hasRequiredData = enrichedModule && (
    (isChallenge && challenge) ||
    (isResourceMode && resource)
  )

  if (!hasRequiredData) {
    const notFoundText = isResourceMode ? 'Learning material not found' : 'Challenge not found'

    return (
      <div className="min-h-screen bg-background text-foreground p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">{notFoundText}</h1>
          <Button variant="outline" onClick={() => navigate(`/dojo/${dojoId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dojo
          </Button>
        </div>
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`workspace-${dojoId}-${moduleId}`}  // Don't include challengeId - keep same component instance
        initial={isAlreadyInWorkspace.current ? false : { opacity: 0, scale: 0.98, y: 20 }}
        animate={{
          opacity: isExiting ? 0 : 1,
          scale: isExiting ? 0.98 : 1,
          y: isExiting ? 20 : 0
        }}
        exit={{ opacity: 0, scale: 0.98, y: 20 }}
        transition={{
          duration: isExiting ? 0.2 : (isAlreadyInWorkspace.current ? 0 : 0.2),
          ease: [0.25, 0.46, 0.45, 0.94] // Custom ease for smooth feel
        }}
        className="h-screen w-full"
      >
        <DojoWorkspaceLayout
          dojo={dojo!}
          modules={[enrichedModule]}
          activeChallenge={isChallenge ? {
            dojoId: dojoId!,
            moduleId: moduleId!,
            challengeId: challengeId!,
            name: challenge!.name
          } : {
            dojoId: dojoId!,
            moduleId: moduleId!,
            challengeId: 'resource',
            name: resource!.name
          }}
          activeResource={isResourceMode ? resource : undefined}
          onChallengeStart={(dojoId, moduleId, challengeId) => {
            navigate(`/dojo/${dojoId}/module/${moduleId}/challenge/${challengeId}`)
          }}
          onResourceSelect={(resourceId) => {
            if (resourceId) {
              navigate(`/dojo/${dojoId}/module/${moduleId}/resource/${resourceId}`)
            } else {
              navigate(`/dojo/${dojoId}/module/${moduleId}`)
            }
          }}
          onChallengeClose={() => {
            // Start exit animation, then navigate
            setIsExiting(true)
            setTimeout(() => {
              navigate(`/dojo/${dojoId}/module/${moduleId}`)
            }, 200) // Duration should match the exit animation
          }}
        />
      </motion.div>
    </AnimatePresence>
  )
}