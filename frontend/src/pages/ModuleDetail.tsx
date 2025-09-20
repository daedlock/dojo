import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Markdown } from '@/components/ui/markdown'
import { useDojoModules, useDojoSolves, useDojos } from '@/hooks/useDojo'
import { DojoWorkspaceLayout } from '@/components/layout/DojoWorkspaceLayout'
import { ArrowLeft, CheckCircle, Circle, Loader2, Play, ChevronDown, ChevronRight } from 'lucide-react'

export default function ModuleDetail() {
  const { dojoId, moduleId } = useParams()

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
    data: modulesData,
    isLoading: isLoadingModules,
    error: modulesError
  } = useDojoModules(dojoId || '', !!dojoId && !!moduleId)

  const {
    data: solvesData
  } = useDojoSolves(dojoId || '', undefined, !!dojoId && !!moduleId)

  // Handle challenge start
  const handleChallengeStart = (dojoId: string, moduleId: string, challengeId: string) => {
    const modules = modulesData?.modules || []
    const module = modules.find(m => m.id === moduleId)
    const challenge = module?.challenges?.find(c => c.id === challengeId)

    if (challenge) {
      setActiveChallenge({
        dojoId,
        moduleId,
        challengeId,
        name: challenge.name
      })
    }
  }

  // Handle challenge close
  const handleChallengeClose = () => {
    setActiveChallenge(undefined)
  }

  // Handle challenge accordion toggle (only one open at a time)
  const toggleChallenge = (challengeId: string) => {
    setOpenChallenge(prev => prev === challengeId ? null : challengeId)
  }

  if (!dojoId || !moduleId) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Module not found</h1>
          <Link to="/">
            <Button variant="outline">Back to Dojos</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (isLoadingDojo || isLoadingModules) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading module...</p>
        </div>
      </div>
    )
  }

  if (dojoError || modulesError || !modulesData?.success) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Failed to load module</h1>
          <Link to={`/dojo/${dojoId}`}>
            <Button variant="outline">Back to Dojo</Button>
          </Link>
        </div>
      </div>
    )
  }

  const modules = modulesData.modules || []
  const module = modules.find(m => m.id === moduleId)
  const solves = solvesData?.solves || []
  const dojo = dojosData?.dojos?.find(d => d.id === dojoId)

  if (!module) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Module not found</h1>
          <Link to={`/dojo/${dojoId}`}>
            <Button variant="outline">Back to Dojo</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Create a set of solved challenge IDs for quick lookup
  const solvedChallengeIds = new Set(solves.map(solve => solve.challenge_id))
  const completedChallenges = module.challenges.filter(
    challenge => solvedChallengeIds.has(challenge.id)
  ).length

  // Transform modules data for the layout component - only include current module
  const layoutModules = [{
    id: module.id,
    name: module.name,
    description: module.description,
    challenges: (module.challenges || []).map(challenge => ({
      id: challenge.id,
      name: challenge.name,
      solved: solvedChallengeIds.has(challenge.id),
      required: challenge.required || false,
      description: challenge.description
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
            <Card>
              <CardHeader>
                <CardTitle>Module Description</CardTitle>
              </CardHeader>
              <CardContent>
                <Markdown>{module.description}</Markdown>
              </CardContent>
            </Card>
          )}

          <div>
            <h2 className="text-2xl font-bold mb-6">Challenges</h2>
            <div className="space-y-3">
            {module.challenges.map((challenge, index) => {
              const isSolved = solvedChallengeIds.has(challenge.id)
              const isOpen = openChallenge === challenge.id

              return (
                <Card key={challenge.id} className="overflow-hidden hover:border-primary/50 transition-all duration-200">
                  <Collapsible open={isOpen} onOpenChange={() => toggleChallenge(challenge.id)}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="pb-3 pt-4 cursor-pointer hover:bg-primary/5 transition-colors group">
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
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              {isSolved ? "Review" : "Start"}
                              <Play className="h-3 w-3 ml-1" />
                            </Button>
                            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <CardContent className="pt-0 border-t">
                        {challenge.description && (
                          <div className="mb-4">
                            <Markdown className="prose-sm">{challenge.description}</Markdown>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4">
                          <div className="text-sm text-muted-foreground">
                            {isSolved ? 'Challenge completed' : 'Ready to start'}
                          </div>
                          <Button
                            onClick={() => handleChallengeStart(dojoId, moduleId, challenge.id)}
                            variant={isSolved ? "outline" : "default"}
                          >
                            {isSolved ? "Review Challenge" : "Start Challenge"}
                            <Play className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
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