import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  ChevronDown,
  ChevronRight,
  Play,
  CheckCircle,
  Circle,
  X,
  Terminal,
  Code,
  Monitor,
  Flag,
  Info
} from 'lucide-react'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useStartChallenge } from '@/hooks/useDojo'
import { FlagSubmission } from '@/components/challenge/FlagSubmission'
import { Markdown } from '@/components/ui/markdown'

interface Challenge {
  id: string
  name: string
  required: boolean
  description?: string
  solved?: boolean
  difficulty?: string
  points?: number
}

interface Module {
  id: string
  name: string
  description?: string
  challenges: Challenge[]
}

interface DojoWorkspaceLayoutProps {
  dojo: {
    id: string
    name: string
    description?: string
  }
  modules: Module[]
  activeChallenge?: {
    dojoId: string
    moduleId: string
    challengeId: string
    name: string
  }
  onChallengeStart: (dojoId: string, moduleId: string, challengeId: string) => void
  onChallengeClose: () => void
}

export function DojoWorkspaceLayout({
  dojo,
  modules,
  activeChallenge,
  onChallengeStart,
  onChallengeClose
}: DojoWorkspaceLayoutProps) {
  const [openModule, setOpenModule] = useState<string | null>(null)
  const [activeService, setActiveService] = useState<string>('flag')

  const startChallengeMutation = useStartChallenge()

  const {
    data: workspaceStatus
  } = useWorkspace({}, !!activeChallenge)

  const {
    data: workspaceData
  } = useWorkspace({ service: activeService }, !!activeChallenge && workspaceStatus?.active)

  const toggleModule = (moduleId: string) => {
    setOpenModule(openModule === moduleId ? null : moduleId)
  }

  const handleChallengeStart = async (moduleId: string, challengeId: string) => {
    try {
      await startChallengeMutation.mutateAsync({
        dojoId: dojo.id,
        moduleId,
        challengeId,
        practice: false
      })
      onChallengeStart(dojo.id, moduleId, challengeId)
    } catch (error) {
      console.error('Failed to start challenge:', error)
    }
  }

  // Auto-expand module containing active challenge and reset to flag tab
  useEffect(() => {
    if (activeChallenge) {
      setOpenModule(activeChallenge.moduleId)
      setActiveService('flag')
    }
  }, [activeChallenge])

  if (!activeChallenge) {
    // Main course view - full width accordions
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{dojo.name}</h1>
          {dojo.description && (
            <div className="mb-4">
              <Markdown className="text-lg">{dojo.description}</Markdown>
            </div>
          )}
          <p className="text-muted-foreground">
            Select a challenge to begin
          </p>
        </div>

        <div className="space-y-4">
          {modules.map((module) => (
            <Card key={module.id}>
              <Collapsible
                open={openModule === module.id}
                onOpenChange={() => toggleModule(module.id)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardTitle className="flex items-center gap-3">
                      {openModule === module.id ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          {module.name}
                          <Badge variant="outline">
                            {module.challenges.filter(c => c.solved).length}/{module.challenges.length}
                          </Badge>
                        </div>
                        {module.description && (
                          <div className="text-sm font-normal text-muted-foreground mt-1">
                            <Markdown className="text-sm">{module.description}</Markdown>
                          </div>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {module.challenges.map((challenge) => (
                        <Collapsible
                          key={challenge.id}
                          open={openChallenge === challenge.id}
                          onOpenChange={() => toggleChallenge(challenge.id)}
                        >
                          <div className="border rounded-lg overflow-hidden">
                            <CollapsibleTrigger asChild>
                              <div className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                                <div className="flex items-center gap-3">
                                  {challenge.solved ? (
                                    <CheckCircle className="h-4 w-4 text-primary" />
                                  ) : (
                                    <Circle className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  <span className="font-medium">{challenge.name}</span>
                                  {challenge.required && (
                                    <Badge variant="secondary" className="text-xs">
                                      Required
                                    </Badge>
                                  )}
                                  {challenge.difficulty && (
                                    <Badge variant="outline" className="text-xs">
                                      {challenge.difficulty}
                                    </Badge>
                                  )}
                                  {challenge.points && (
                                    <Badge variant="outline" className="text-xs">
                                      {challenge.points} pts
                                    </Badge>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  {openChallenge === challenge.id ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </div>
                              </div>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                              <div className="px-3 pb-3 border-t bg-muted/20">
                                <div className="pt-3">
                                  <div className="text-sm text-muted-foreground mb-3">
                                    <Markdown className="text-sm">
                                      {challenge.description || "No description available for this challenge."}
                                    </Markdown>
                                  </div>
                                </div>
                                <div className="flex justify-end">
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleChallengeStart(module.id, challenge.id)
                                    }}
                                    disabled={startChallengeMutation.isPending}
                                    size="sm"
                                  >
                                    <Play className="h-4 w-4 mr-2" />
                                    Start Challenge
                                  </Button>
                                </div>
                              </div>
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Challenge active view - sidebar + workspace
  return (
    <div className="flex h-screen">
      {/* Sidebar - Challenge List */}
      <div className="w-80 border-r bg-background flex flex-col h-full">
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{dojo.name}</h2>
              <p className="text-sm text-muted-foreground">Challenge List</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onChallengeClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 h-full">
          <div className="p-4 pr-6 h-full">
            {modules.map((module) => (
              <Collapsible
                key={module.id}
                open={openModule === module.id}
                onOpenChange={() => toggleModule(module.id)}
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer">
                    {openModule === module.id ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <span className="font-medium text-sm">{module.name}</span>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="ml-6 mt-2 space-y-1">
                    {module.challenges.map((challenge) => {
                      const isActive = activeChallenge.moduleId === module.id &&
                                     activeChallenge.challengeId === challenge.id

                      return (
                        <div
                          key={challenge.id}
                          className={`flex items-center justify-between gap-2 p-2 rounded text-sm transition-colors ${
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {challenge.solved ? (
                              <CheckCircle className="h-3 w-3 flex-shrink-0" />
                            ) : (
                              <Circle className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                            )}
                            <span className="truncate">{challenge.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                >
                                  <Info className="h-3 w-3" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80" align="end">
                                <div className="space-y-3">
                                  <div>
                                    <h4 className="font-semibold">{challenge.name}</h4>
                                    <div className="flex gap-2 mt-1">
                                      {challenge.required && (
                                        <Badge variant="secondary" className="text-xs">
                                          Required
                                        </Badge>
                                      )}
                                      {challenge.difficulty && (
                                        <Badge variant="outline" className="text-xs">
                                          {challenge.difficulty}
                                        </Badge>
                                      )}
                                      {challenge.points && (
                                        <Badge variant="outline" className="text-xs">
                                          {challenge.points} pts
                                        </Badge>
                                      )}
                                    </div>
                                  </div>

                                  {challenge.description && (
                                    <div className="text-sm text-muted-foreground">
                                      <Markdown className="text-sm">{challenge.description}</Markdown>
                                    </div>
                                  )}

                                  {!isActive && (
                                    <Button
                                      onClick={() => handleChallengeStart(module.id, challenge.id)}
                                      disabled={startChallengeMutation.isPending}
                                      size="sm"
                                      className="w-full"
                                    >
                                      <Play className="h-3 w-3 mr-2" />
                                      Start Challenge
                                    </Button>
                                  )}
                                </div>
                              </PopoverContent>
                            </Popover>

                            {!isActive && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => handleChallengeStart(module.id, challenge.id)}
                                disabled={startChallengeMutation.isPending}
                              >
                                <Play className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col">
        {/* Workspace Header */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">{activeChallenge.name}</h1>
              <p className="text-sm text-muted-foreground">
                {dojo.name} → Module {activeChallenge.moduleId}
              </p>
            </div>

            {/* Service Tabs */}
            <div className="flex items-center gap-2">
              <Button
                variant={activeService === 'flag' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveService('flag')}
              >
                <Flag className="h-4 w-4 mr-2" />
                Flag
              </Button>
              {workspaceStatus?.active && (
                <>
                  <Button
                    variant={activeService === 'terminal' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveService('terminal')}
                  >
                    <Terminal className="h-4 w-4 mr-2" />
                    Terminal
                  </Button>
                  <Button
                    variant={activeService === 'code' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveService('code')}
                  >
                    <Code className="h-4 w-4 mr-2" />
                    Editor
                  </Button>
                  <Button
                    variant={activeService === 'desktop' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveService('desktop')}
                  >
                    <Monitor className="h-4 w-4 mr-2" />
                    Desktop
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Workspace Content */}
        <div className="flex-1 p-4">
          {activeService === 'flag' ? (
            <div className="flex items-center justify-center h-full">
              <FlagSubmission
                dojoId={activeChallenge.dojoId}
                moduleId={activeChallenge.moduleId}
                challengeId={activeChallenge.challengeId}
                challengeName={activeChallenge.name}
              />
            </div>
          ) : workspaceStatus?.active && workspaceData?.iframe_src ? (
            <iframe
              src={workspaceData.iframe_src.startsWith('/')
                ? `http://localhost${workspaceData.iframe_src}`
                : workspaceData.iframe_src}
              className="w-full h-full border-0 rounded-lg"
              title={`Workspace ${activeService}`}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4" />
                <p>Preparing your workspace...</p>
                <p className="text-sm mt-2">This may take a few moments.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}