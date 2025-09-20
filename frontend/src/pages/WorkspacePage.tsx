import { useParams, useNavigate } from 'react-router-dom'
import { useDojoStore, useUIStore } from '@/stores'
import { DojoWorkspaceLayout } from '@/components/layout/DojoWorkspaceLayout'
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function WorkspacePage() {
  const { dojoId, moduleId, challengeId } = useParams()
  const navigate = useNavigate()
  const [isExiting, setIsExiting] = useState(false)

  // Direct state access to avoid selector issues
  const dojos = useDojoStore(state => state.dojos)
  const modulesMap = useDojoStore(state => state.modules)
  const loadingDojos = useDojoStore(state => state.loadingDojos)
  const loadingModules = useDojoStore(state => state.loadingModules)
  const dojoError = useDojoStore(state => state.dojoError)
  const moduleError = useDojoStore(state => state.moduleError)

  // Find data directly
  const dojo = dojos.find(d => d.id === dojoId)
  const modules = modulesMap[dojoId || ''] || []

  // Loading and error states
  const isLoading = loadingDojos || loadingModules[dojoId || '']
  const error = dojoError || moduleError[dojoId || '']

  useEffect(() => {
    if (dojoId) {
      useDojoStore.getState().fetchModules(dojoId)
    }
  }, [dojoId])

  // Cleanup effect to restore header state when leaving workspace
  useEffect(() => {
    return () => {
      // Reset header state when component unmounts
      useUIStore.getState().setHeaderHidden(false)
    }
  }, [])

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

  // Find the specific challenge
  const module = modules.find(m => m.id === moduleId)
  const challenge = module?.challenges?.find(c => c.id === challengeId)

  if (!module || !challenge) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Challenge not found</h1>
          <Button variant="outline" onClick={() => navigate(`/dojo/${dojoId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dojo
          </Button>
        </div>
      </div>
    )
  }

  // Transform ONLY the current module for the layout component
  const layoutModules = [{
    id: module.id,
    name: module.name,
    description: module.description,
    challenges: (module.challenges || []).map(challenge => ({
      id: challenge.id,
      name: challenge.name,
      solved: false, // TODO: Get solved status
      required: challenge.required || false,
      description: challenge.description
    }))
  }]

  const handleChallengeStart = (dojoId: string, moduleId: string, challengeId: string) => {
    // Navigate to the new challenge workspace
    navigate(`/dojo/${dojoId}/module/${moduleId}/challenge/${challengeId}`)
  }

  const handleChallengeClose = () => {
    // Restore header state before exiting
    useUIStore.getState().setHeaderHidden(false)

    // Start exit animation, then navigate
    setIsExiting(true)
    setTimeout(() => {
      navigate(`/dojo/${dojoId}/module/${moduleId}`)
    }, 200) // Duration should match the exit animation
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`workspace-${dojoId}-${moduleId}-${challengeId}`}
        initial={{ opacity: 0, scale: 0.98, y: 20 }}
        animate={{
          opacity: isExiting ? 0 : 1,
          scale: isExiting ? 0.98 : 1,
          y: isExiting ? 20 : 0
        }}
        exit={{ opacity: 0, scale: 0.98, y: 20 }}
        transition={{
          duration: 0.2,
          ease: [0.25, 0.46, 0.45, 0.94] // Custom ease for smooth feel
        }}
        className="h-screen w-full"
      >
        <DojoWorkspaceLayout
          dojo={{
            id: dojoId!,
            name: dojo?.name || dojoId!,
            description: dojo?.description
          }}
          modules={layoutModules}
          activeChallenge={{
            dojoId: dojoId!,
            moduleId: moduleId!,
            challengeId: challengeId!,
            name: challenge.name
          }}
          onChallengeStart={handleChallengeStart}
          onChallengeClose={handleChallengeClose}
        />
      </motion.div>
    </AnimatePresence>
  )
}