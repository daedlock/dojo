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

  // Basic state access without complex selectors
  const dojos = useDojoStore(state => state.dojos)
  const modulesMap = useDojoStore(state => state.modules)
  const isLoading = useDojoStore(state => state.loadingDojos || state.loadingModules[dojoId || ''])
  const error = useDojoStore(state => state.dojoError || state.moduleError[dojoId || ''])

  // Set active challenge in UI store - MUST be before any conditional returns
  const setActiveChallenge = useUIStore(state => state.setActiveChallenge)

  // Simple data lookup
  const dojo = dojos.find(d => d.id === dojoId)
  const modules = modulesMap[dojoId || ''] || []
  const module = modules.find(m => m.id === moduleId)
  const challenge = module?.challenges?.find(c => c.id === challengeId)

  useEffect(() => {
    if (dojoId) {
      useDojoStore.getState().fetchModules(dojoId)
    }
  }, [dojoId])

  useEffect(() => {
    if (dojo && module && challenge) {
      const challengeData = {
        dojoId: dojo.id,
        moduleId: module.id,
        challengeId: challenge.id,
        challengeName: challenge.name,
        dojoName: dojo.name,
        moduleName: module.name
      }
      console.log('Setting active challenge:', challengeData)
      setActiveChallenge(challengeData)
    }
    // Don't clear on cleanup - let the widget persist until user terminates
  }, [dojo, module, challenge, setActiveChallenge])

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
          dojo={dojo!}
          modules={[module]}
          activeChallenge={{
            dojoId: dojoId!,
            moduleId: moduleId!,
            challengeId: challengeId!,
            name: challenge.name
          }}
          onChallengeStart={(dojoId, moduleId, challengeId) => {
            navigate(`/dojo/${dojoId}/module/${moduleId}/challenge/${challengeId}`)
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