import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Play, Loader2 } from 'lucide-react'
import { useStartChallenge } from '@/hooks/useDojo'
import { useUIStore, useDojoStore } from '@/stores'
import { cn } from '@/lib/utils'

interface StartChallengeButtonProps {
  dojoId: string
  moduleId: string
  challengeId: string
  isSolved?: boolean
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  practice?: boolean
  children?: React.ReactNode
  onClick?: (e: React.MouseEvent) => void
}

export function StartChallengeButton({
  dojoId,
  moduleId,
  challengeId,
  isSolved = false,
  variant = 'default',
  size = 'default',
  className,
  practice = false,
  children,
  onClick
}: StartChallengeButtonProps) {
  const navigate = useNavigate()
  const startChallengeMutation = useStartChallenge()
  const setActiveChallenge = useUIStore(state => state.setActiveChallenge)
  const dojos = useDojoStore(state => state.dojos)
  const modulesMap = useDojoStore(state => state.modules)

  const handleStart = async (e: React.MouseEvent) => {
    e.stopPropagation()

    // Call custom onClick if provided
    if (onClick) {
      onClick(e)
    }

    // Check if we had an active challenge before starting (for delay logic)
    const hadActiveChallenge = !!useUIStore.getState().activeChallenge

    // 1. Navigate immediately for instant UX
    navigate(`/dojo/${dojoId}/module/${moduleId}/challenge/${challengeId}`)

    // 2. Set active challenge state immediately (optimistic update with proper names)
    const dojo = dojos.find(d => d.id === dojoId)
    const modules = modulesMap[dojoId] || []
    const module = modules.find(m => m.id === moduleId)
    const challenge = module?.challenges?.find(c => c.id === challengeId)

    setActiveChallenge({
      dojoId,
      moduleId,
      challengeId,
      challengeName: challenge?.name || challengeId,
      dojoName: dojo?.name || dojoId,
      moduleName: module?.name || moduleId,
      isStarting: true
    })

    // 3. Start the challenge on the server in background
    // The workspace will show loading until this completes
    startChallengeMutation.mutateAsync({
      dojoId,
      moduleId,
      challengeId,
      practice
    }).then(async () => {
      console.log('Challenge started successfully')

      // If we didn't have an active challenge before, wait 500ms for backend setup
      if (!hadActiveChallenge) {
        console.log('Waiting 500ms for workspace setup...')
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Update the active challenge to remove isStarting flag
      setActiveChallenge({
        dojoId,
        moduleId,
        challengeId,
        challengeName: challenge?.name || challengeId,
        dojoName: dojo?.name || dojoId,
        moduleName: module?.name || moduleId,
        isStarting: false
      })
    }).catch((error) => {
      console.error('Failed to start challenge:', error)
      // Still remove isStarting flag on error
      setActiveChallenge({
        dojoId,
        moduleId,
        challengeId,
        challengeName: challenge?.name || challengeId,
        dojoName: dojo?.name || dojoId,
        moduleName: module?.name || moduleId,
        isStarting: false
      })
    })
  }

  const isLoading = false // No loading state - navigate immediately

  return (
    <Button
      onClick={handleStart}
      size={size}
      variant={isSolved ? 'outline' : variant}
      disabled={isLoading}
      className={cn(className)}
    >
      {isLoading ? (
        <Loader2 className="h-3 w-3 animate-spin mr-1" />
      ) : (
        <Play className="h-3 w-3 mr-1" />
      )}
      {children || (isSolved ? 'Review' : 'Start')}
    </Button>
  )
}