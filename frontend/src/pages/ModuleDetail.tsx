import { useState, useRef, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Markdown } from '@/components/ui/markdown'
import { useDojoModules, useDojoSolves, useDojos } from '@/hooks/useDojo'
import { DojoWorkspaceLayout } from '@/components/layout/DojoWorkspaceLayout'
import { useHeader } from '@/contexts/HeaderContext'
import { ArrowLeft, CheckCircle, Circle, Loader2, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ModuleDetail() {
  const { dojoId, moduleId } = useParams()
  const { isHeaderHidden } = useHeader()

  // State for active challenge
  const [activeChallenge, setActiveChallenge] = useState<{
    dojoId: string
    moduleId: string
    challengeId: string
    name: string
  } | undefined>(undefined)

  // State for challenge accordion (only one open at a time)
  const [openChallenge, setOpenChallenge] = useState<string | null>(null)


  const {
    data: dojosData,
    isLoading: isLoadingDojo,
    error: dojoError
  } = useDojos()

  const {
    data: modulesResponse,
    isLoading: isLoadingModules,
    error: modulesError
  } = useDojoModules(dojoId || '')

  const {
    data: solvesResponse,
    isLoading: isLoadingSolves,
    error: solvesError
  } = useDojoSolves(dojoId || '')

  // Find the specific dojo
  const dojo = Array.isArray(dojosData)
    ? dojosData.find(d => d.id === dojoId)
    : dojosData?.dojos?.find(d => d.id === dojoId)

  // Get modules array from response
  const modules = modulesResponse?.modules || []

  // Find the specific module
  const module = modules.find(m => m.id === moduleId)

  // Get solves array from response
  const solves = solvesResponse?.solves || []



  if (isLoadingDojo || isLoadingModules || isLoadingSolves) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (dojoError || modulesError || solvesError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Error loading module</h2>
          <p className="text-muted-foreground">
            {dojoError?.message || modulesError?.message || solvesError?.message}
          </p>
        </div>
      </div>
    )
  }

  if (!module) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Module not found</h2>
          <p className="text-muted-foreground">
            The requested module "{moduleId}" could not be found in dojo "{dojoId}".
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Available modules: {modules.length > 0 ? modules.map(m => m.id).join(', ') : 'None'}
          </p>
          <Link
            to={`/dojo/${dojoId}`}
            className="mt-4 inline-flex items-center text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {dojoId}
          </Link>
        </div>
      </div>
    )
  }

  // Get solved challenge IDs for this dojo/module
  const solvedChallengeIds = new Set(
    solves
      ?.filter(solve => solve.dojo_id === dojoId && solve.module_id === moduleId)
      .map(solve => solve.challenge_id) || []
  )

  const completedChallenges = module.challenges.filter(
    challenge => solvedChallengeIds.has(challenge.id)
  ).length

  const toggleChallenge = (challengeId: string) => {
    setOpenChallenge(openChallenge === challengeId ? null : challengeId)
  }

  const handleChallengeStart = (dojoId: string, moduleId: string, challengeId: string) => {
    const challenge = module.challenges.find(c => c.id === challengeId)
    if (challenge) {
      setActiveChallenge({
        dojoId,
        moduleId,
        challengeId,
        name: challenge.name
      })
    }
  }

  const handleChallengeClose = () => {
    setActiveChallenge(undefined)
  }

  // Transform module data for DojoWorkspaceLayout
  const layoutModules = [{
    id: module.id,
    name: module.name,
    description: module.description,
    challenges: (module.challenges || []).map(challenge => ({
      id: challenge.id,
      name: challenge.name,
      description: challenge.description || '',
      points: challenge.points || 0,
      solves: challenge.solves || 0,
      required: challenge.required || false,
      status: solvedChallengeIds.has(challenge.id) ? 'solved' as const : 'unsolved' as const,
      resources: challenge.resources || [],
      module_id: module.id,
      notebook: challenge.notebook || '',
      requirements: challenge.requirements || []
    }))
  }]

  // If there's an active challenge, show the workspace layout
  if (activeChallenge) {
    return (
      <DojoWorkspaceLayout
        dojo={{
          id: dojoId,
          name: dojo?.name || dojoId,
          description: dojo?.description
        }}
        modules={layoutModules}
        activeChallenge={activeChallenge}
        onChallengeStart={handleChallengeStart}
        onChallengeClose={handleChallengeClose}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link
            to={`/dojo/${dojoId}`}
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {dojoId}
          </Link>

          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2">{module.name}</h1>

            <div className="flex items-center gap-4">
              <Badge variant="outline">{dojoId}</Badge>
              <span className="text-sm text-muted-foreground">
                {completedChallenges}/{module.challenges.length} challenges completed
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {module.description && (
                <Markdown>{module.description}</Markdown>
          )}

          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Challenges</h2>
            <div className="space-y-3">
              {module.challenges.map((challenge, index) => {
                const isSolved = solvedChallengeIds.has(challenge.id)
                const isOpen = openChallenge === challenge.id

                return (
                  <Card key={challenge.id} className="hover:border-primary/50 transition-all duration-200 relative">
                    <Collapsible open={isOpen} onOpenChange={() => setOpenChallenge(isOpen ? null : challenge.id)}>
                      <CollapsibleTrigger asChild>
                        <CardHeader
                          className={cn(
                            "pb-3 pt-4 cursor-pointer group",
                            isOpen && "sticky z-40 bg-card rounded-t-xl border-b shadow-sm transition-all duration-300",
                            isOpen && (isHeaderHidden ? "top-0" : "top-16")
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary flex-shrink-0">
                                {index + 1}
                              </div>
                              <div className="flex items-center gap-2">
                                {isSolved ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Circle className="h-4 w-4 text-muted-foreground" />
                                )}
                                <CardTitle className="text-lg group-hover:text-primary transition-colors">{challenge.name}</CardTitle>
                                {challenge.required && (
                                  <Badge variant="secondary" className="text-xs ml-2">Required</Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleChallengeStart(dojoId, moduleId, challenge.id)
                                }}
                                size="sm"
                                variant={isSolved ? "outline" : "default"}
                                className={cn(
                                  "transition-opacity",
                                  isOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                )}
                              >
                                {isSolved ? "Review" : "Start"}
                                <Play className="h-3 w-3 ml-1" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>


                      <CollapsibleContent>
                        <CardContent className=" border-t">
                          {challenge.description && (
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <Markdown>{challenge.description}</Markdown>
                            </div>
                          )}
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
