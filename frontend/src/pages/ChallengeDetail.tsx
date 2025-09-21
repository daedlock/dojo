import { Link, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StartChallengeButton } from '@/components/ui/start-challenge-button'
import { Markdown } from '@/components/ui/markdown'
import { useDojoModules, useDojoSolves, useChallengeDescription } from '@/hooks/useDojo'
import { useWorkspace } from '@/hooks/useWorkspace'
import { ArrowLeft, CheckCircle, Circle, Play, Terminal, Flag, Loader2, AlertCircle, Code, Monitor, AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useState } from 'react'

export default function ChallengeDetail() {
  const { dojoId, moduleId, challengeId } = useParams()
  const [challengeStarted, setChallengeStarted] = useState(false)
  const [startError, setStartError] = useState<string | null>(null)
  const [activeService, setActiveService] = useState<string>('terminal')
  
  const { 
    data: modulesData, 
    isLoading: isLoadingModules, 
    error: modulesError 
  } = useDojoModules(dojoId || '', !!dojoId && !!moduleId && !!challengeId)
  
  const { 
    data: solvesData 
  } = useDojoSolves(dojoId || '', undefined, !!dojoId && !!moduleId && !!challengeId)
  
  const {
    data: descriptionData,
    isLoading: isLoadingDescription
  } = useChallengeDescription(
    dojoId || '',
    moduleId || '',
    challengeId || '',
    !!dojoId && !!moduleId && !!challengeId
  )


  // Workspace queries
  const {
    data: workspaceStatus
  } = useWorkspace({}, challengeStarted)

  const {
    data: workspaceData,
    isLoading: isLoadingService
  } = useWorkspace({ service: activeService }, challengeStarted && workspaceStatus?.active)

  // Check if workspace challenge matches current challenge
  const isWorkspaceChallengeMismatch = workspaceStatus?.current_challenge && (
    workspaceStatus.current_challenge.dojo_id !== dojoId ||
    workspaceStatus.current_challenge.module_id !== moduleId ||
    workspaceStatus.current_challenge.challenge_id !== challengeId
  )


  if (!dojoId || !moduleId || !challengeId) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Challenge not found</h1>
          <Link to="/">
            <Button variant="outline">Back to Dojos</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (isLoadingModules) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading challenge...</p>
        </div>
      </div>
    )
  }

  if (modulesError || !modulesData?.success) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Failed to load challenge</h1>
          <Link to={`/dojo/${dojoId}/module/${moduleId}`}>
            <Button variant="outline">Back to Module</Button>
          </Link>
        </div>
      </div>
    )
  }

  const module = modulesData.modules.find(m => m.id === moduleId)
  const challenge = module?.challenges.find(c => c.id === challengeId)
  
  if (!module || !challenge) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Challenge not found</h1>
          <Link to={`/dojo/${dojoId}/module/${moduleId}`}>
            <Button variant="outline">Back to Module</Button>
          </Link>
        </div>
      </div>
    )
  }

  const solves = solvesData?.solves || []
  const isSolved = solves.some(solve => solve.challenge_id === challengeId)

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link 
            to={`/dojo/${dojoId}/module/${moduleId}`} 
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {module.name}
          </Link>
          
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-3">
              {isSolved ? (
                <CheckCircle className="h-6 w-6 text-primary mt-1" />
              ) : (
                <Circle className="h-6 w-6 text-muted-foreground mt-1" />
              )}
              <div>
                <h1 className="text-4xl font-bold mb-2">{challenge.name}</h1>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              {challenge.required && (
                <Badge variant="secondary">Required</Badge>
              )}
              <span className="text-lg font-bold text-muted-foreground">
                {isSolved ? 'Solved' : 'Unsolved'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="outline">{dojoId}</Badge>
            <Badge variant="outline">{module.name}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flag className="h-5 w-5" />
                  Challenge Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingDescription ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading description...</span>
                  </div>
                ) : descriptionData?.success && descriptionData.description ? (
                  <Markdown>{descriptionData.description}</Markdown>
                ) : (
                  <div className="text-muted-foreground">
                    <p>Challenge description will appear here when you start the challenge.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Challenge mismatch warning */}
            {isWorkspaceChallengeMismatch && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="pt-6">
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      <strong>Warning:</strong> Your workspace is currently running a different challenge:
                      <span className="font-mono ml-1">
                        {workspaceStatus?.current_challenge?.challenge_name}
                      </span>
                      <br />
                      <span className="text-sm mt-1 block">
                        Start this challenge to switch your workspace environment.
                      </span>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}

            {/* Workspace iframe */}
            {challengeStarted && workspaceStatus?.active && workspaceData?.iframe_src && !isWorkspaceChallengeMismatch && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {activeService === 'terminal' && <Terminal className="h-5 w-5" />}
                    {activeService === 'code' && <Code className="h-5 w-5" />}
                    {activeService === 'desktop' && <Monitor className="h-5 w-5" />}
                    Workspace - {activeService === 'terminal' ? 'Terminal' : activeService === 'code' ? 'Code Editor' : 'Desktop'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoadingService ? (
                    <div className="flex items-center justify-center h-96 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Loading {activeService}...
                    </div>
                  ) : (
                    <iframe
                      src={workspaceData.iframe_src.startsWith('/') ? `http://localhost${workspaceData.iframe_src}` : workspaceData.iframe_src}
                      className="w-full h-96 border-0 rounded-b-lg"
                      title={`Workspace ${activeService}`}
                    />
                  )}
                </CardContent>
              </Card>
            )}

            {/* Workspace iframe for different challenge */}
            {isWorkspaceChallengeMismatch && workspaceStatus?.active && workspaceData?.iframe_src && (
              <Card className="border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-700">
                    {activeService === 'terminal' && <Terminal className="h-5 w-5" />}
                    {activeService === 'code' && <Code className="h-5 w-5" />}
                    {activeService === 'desktop' && <Monitor className="h-5 w-5" />}
                    <span className="truncate">
                      Workspace - {workspaceStatus.current_challenge?.challenge_name}
                    </span>
                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                      Different Challenge
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoadingService ? (
                    <div className="flex items-center justify-center h-96 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Loading {activeService}...
                    </div>
                  ) : (
                    <iframe
                      src={workspaceData.iframe_src.startsWith('/') ? `http://localhost${workspaceData.iframe_src}` : workspaceData.iframe_src}
                      className="w-full h-96 border-0 rounded-b-lg opacity-80"
                      title={`Workspace ${activeService} (Different Challenge)`}
                    />
                  )}
                </CardContent>
              </Card>
            )}

            {challengeStarted && workspaceStatus?.active === false && (
              <Card>
                <CardContent className="text-center py-8">
                  <div className="text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p>Preparing your workspace...</p>
                    <p className="text-sm mt-2">This may take a few moments.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  Challenge Environment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-2">SSH Connection:</div>
                    <code className="text-sm">ssh user@pwn.college -p 22</code>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-2">Challenge Binary:</div>
                    <code className="text-sm">/challenge/{challenge.id}</code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {startError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{startError}</AlertDescription>
                  </Alert>
                )}

                {challengeStarted && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Challenge started successfully! Your workspace is being prepared.
                    </AlertDescription>
                  </Alert>
                )}

                <StartChallengeButton
                  dojoId={dojoId}
                  moduleId={moduleId}
                  challengeId={challengeId}
                  className="w-full"
                  size="lg"
                  onClick={() => setChallengeStarted(true)}
                >
                  Start Challenge
                </StartChallengeButton>
                {/* Workspace Service Buttons */}
                {challengeStarted && workspaceStatus?.active && !isWorkspaceChallengeMismatch && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Workspace</div>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={activeService === 'terminal' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveService('terminal')}
                      >
                        <Terminal className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={activeService === 'code' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveService('code')}
                      >
                        <Code className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={activeService === 'desktop' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveService('desktop')}
                      >
                        <Monitor className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Workspace Service Buttons for different challenge */}
                {isWorkspaceChallengeMismatch && workspaceStatus?.active && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-orange-600">
                      Workspace ({workspaceStatus.current_challenge?.challenge_name})
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={activeService === 'terminal' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveService('terminal')}
                        className="opacity-60"
                      >
                        <Terminal className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={activeService === 'code' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveService('code')}
                        className="opacity-60"
                      >
                        <Code className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={activeService === 'desktop' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveService('desktop')}
                        className="opacity-60"
                      >
                        <Monitor className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-xs text-orange-600 text-center">
                      Different challenge workspace
                    </div>
                  </div>
                )}

                {isSolved && (
                  <div className="text-center text-sm text-muted-foreground">
                    ✓ Challenge completed!
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Challenge Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Required:</span>
                  <span className={challenge.required ? 'text-primary' : 'text-muted-foreground'}>
                    {challenge.required ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={isSolved ? 'text-primary' : 'text-muted-foreground'}>
                    {isSolved ? 'Solved' : 'Unsolved'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start" size="sm">
                  📚 Documentation
                </Button>
                <Button variant="ghost" className="w-full justify-start" size="sm">
                  💡 Hints
                </Button>
                <Button variant="ghost" className="w-full justify-start" size="sm">
                  🔧 Tools
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}