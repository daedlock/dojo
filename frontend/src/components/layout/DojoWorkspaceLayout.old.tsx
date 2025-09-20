import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { motion, AnimatePresence } from 'framer-motion'
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
  Info,
  PanelLeftClose,
  PanelLeftOpen,
  Maximize,
  Minimize,
  GripVertical,
  Eye,
  EyeOff
} from 'lucide-react'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useStartChallenge } from '@/hooks/useDojo'
import { FlagSubmission } from '@/components/challenge/FlagSubmission'
import { Markdown } from '@/components/ui/markdown'
import { FullScreenWorkspace } from './FullScreenWorkspace'
import { useHeader } from '@/contexts/HeaderContext'
import { CommandPalette } from '@/components/ui/command-palette'
import { useCommands } from '@/hooks/useCommands'
import { useHotkeys, hotkey } from '@/hooks/useHotkeys'
import { ChallengePopoverContent } from '@/components/challenge/ChallengePopover'
import { SmartFlagInput } from '@/components/challenge/SmartFlagInput'

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
  const [activeService, setActiveService] = useState<string>('terminal')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(320)
  const [isResizing, setIsResizing] = useState(false)
  const [showFloatingChallengePicker, setShowFloatingChallengePicker] = useState(false)
  const [showFloatingActions, setShowFloatingActions] = useState(false)
  const [headerHidden, setHeaderHidden] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [openChallenge, setOpenChallenge] = useState<string | null>(null)

  const { setHeaderHidden: setMainHeaderHidden } = useHeader()
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

  const toggleChallenge = (challengeId: string) => {
    setOpenChallenge(openChallenge === challengeId ? null : challengeId)
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

  const commands = useCommands({
    activeChallenge,
    modules,
    activeService,
    sidebarCollapsed,
    isFullScreen,
    headerHidden,
    workspaceStatus,
    setActiveService,
    setSidebarCollapsed,
    setIsFullScreen,
    setHeaderHidden,
    onChallengeStart: handleChallengeStart,
    onChallengeClose
  })

  // Auto-expand module containing active challenge and reset to terminal tab
  useEffect(() => {
    if (activeChallenge) {
      setOpenModule(activeChallenge.moduleId)
      setActiveService('terminal')
      // Hide main header when entering workspace
      setMainHeaderHidden(true)
    } else {
      // Show main header when exiting workspace
      setMainHeaderHidden(false)
    }
  }, [activeChallenge, setMainHeaderHidden])

  // Modern hotkey system
  useHotkeys({
    [hotkey.ctrlShift('p')]: () => setCommandPaletteOpen(prev => !prev),
    [hotkey.cmdShift('p')]: () => setCommandPaletteOpen(prev => !prev),
    [hotkey.ctrl('b')]: () => setSidebarCollapsed(prev => !prev),
    [hotkey.cmd('b')]: () => setSidebarCollapsed(prev => !prev),
    [hotkey.ctrl('h')]: () => setHeaderHidden(prev => !prev),
    [hotkey.cmd('h')]: () => setHeaderHidden(prev => !prev),
    ['f11']: () => setIsFullScreen(prev => !prev),
    [hotkey.ctrlShift('f')]: () => setIsFullScreen(prev => !prev),
    [hotkey.cmdShift('f')]: () => setIsFullScreen(prev => !prev),
    // Service switching (only when in workspace)
    ...(activeChallenge ? {
      [hotkey.ctrl('1')]: () => workspaceStatus?.active && setActiveService('terminal'),
      [hotkey.cmd('1')]: () => workspaceStatus?.active && setActiveService('terminal'),
      [hotkey.ctrl('2')]: () => workspaceStatus?.active && setActiveService('code'),
      [hotkey.cmd('2')]: () => workspaceStatus?.active && setActiveService('code'),
      [hotkey.ctrl('3')]: () => workspaceStatus?.active && setActiveService('desktop'),
      [hotkey.cmd('3')]: () => workspaceStatus?.active && setActiveService('desktop'),
      [hotkey.ctrl('w')]: () => onChallengeClose(),
      [hotkey.cmd('w')]: () => onChallengeClose(),
    } : {})
  }, [
    commandPaletteOpen,
    sidebarCollapsed,
    isFullScreen,
    headerHidden,
    activeChallenge,
    workspaceStatus,
    activeService,
    onChallengeClose
  ])

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

        {/* Command Palette */}
        <CommandPalette
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
          commands={commands}
        />
      </div>
    )
  }

  // Challenge active view - sidebar + workspace
  if (isFullScreen) {
    return (
      <FullScreenWorkspace
        dojo={dojo}
        modules={modules}
        activeChallenge={activeChallenge}
        activeService={activeService}
        setActiveService={setActiveService}
        workspaceStatus={workspaceStatus}
        workspaceData={workspaceData}
        onChallengeStart={handleChallengeStart}
        onExitFullScreen={() => setIsFullScreen(false)}
      />
    )
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar - Challenge List */}
      {(
        <div
          className={`border-r bg-background flex flex-col h-full relative ${
            sidebarCollapsed ? 'w-12' : ''
          } ${!isResizing ? 'transition-all duration-300' : ''}`}
          style={{ width: sidebarCollapsed ? '48px' : `${sidebarWidth}px` }}
        >
          {/* Resize Handle */}
          {!sidebarCollapsed && (
            <div
              className="absolute top-0 right-0 w-2 h-full cursor-col-resize hover:bg-primary/10 transition-colors group flex items-center justify-center"
              onMouseDown={(e) => {
                e.preventDefault()
                setIsResizing(true)
                const sidebarElement = e.currentTarget.parentElement!
                const containerRect = sidebarElement.parentElement!.getBoundingClientRect()

                const handleMouseMove = (e: MouseEvent) => {
                  // Calculate width based on mouse position relative to container
                  const newWidth = Math.max(200, Math.min(600, e.clientX - containerRect.left))
                  sidebarElement.style.width = `${newWidth}px`
                }

                const handleMouseUp = (e: MouseEvent) => {
                  document.removeEventListener('mousemove', handleMouseMove)
                  document.removeEventListener('mouseup', handleMouseUp)
                  document.body.style.cursor = ''
                  document.body.style.userSelect = ''

                  // Update React state once at the end
                  const finalWidth = Math.max(200, Math.min(600, e.clientX - containerRect.left))
                  setSidebarWidth(finalWidth)
                  setIsResizing(false)
                }

                document.addEventListener('mousemove', handleMouseMove)
                document.addEventListener('mouseup', handleMouseUp)
                document.body.style.cursor = 'col-resize'
                document.body.style.userSelect = 'none'
              }}
            >
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-muted-foreground/20 rounded-sm px-0.5 py-8">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          )}

          <div className="border-b p-4">
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
              {!sidebarCollapsed ? (
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold truncate">{modules[0]?.name || 'Module'}</h2>
                  <p className="text-xs text-muted-foreground">{modules[0]?.challenges?.length || 0} Challenges</p>
                </div>
              ) : null}

              <div className={`flex items-center gap-1 ${sidebarCollapsed ? 'flex-col' : 'flex-shrink-0'}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setHeaderHidden(!headerHidden)}
                  title={headerHidden ? "Show header (Ctrl+H)" : "Hide header (Ctrl+H)"}
                >
                  {headerHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  title={sidebarCollapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
                >
                  {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                </Button>

                {!sidebarCollapsed && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onChallengeClose}
                    title="Close workspace"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {!sidebarCollapsed ? (
            <ScrollArea className="flex-1 h-full">
              <div className="p-3 space-y-1">
                {/* Flat list of challenges from the single module */}
                {modules[0]?.challenges.map((challenge) => {
                  const isActive = activeChallenge.challengeId === challenge.id

                  return (
                    <div
                      key={challenge.id}
                      className={`flex items-center justify-between gap-2 p-2.5 rounded-md text-sm transition-all ${
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'hover:bg-muted/70 cursor-pointer'
                      }`}
                      onClick={() => !isActive && handleChallengeStart(modules[0].id, challenge.id)}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {challenge.solved ? (
                          <CheckCircle className="h-4 w-4 flex-shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        )}
                        <span className="truncate font-medium">{challenge.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Info className="h-3 w-3" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent side="right" className="w-80 sm:w-96 lg:w-[28rem] p-0" align="center">
                            <ChallengePopoverContent
                              challenge={challenge}
                              isActive={isActive}
                              onStartChallenge={() => handleChallengeStart(modules[0].id, challenge.id)}
                              isPending={startChallengeMutation.isPending}
                            />
                          </PopoverContent>
                        </Popover>

                        {!isActive && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleChallengeStart(modules[0].id, challenge.id)
                            }}
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
            </ScrollArea>
          ) : (
            /* Collapsed Sidebar - Show challenge numbers in column */
            <ScrollArea className="flex-1">
              <div className="flex flex-col items-center py-4 gap-2">
                {modules[0]?.challenges.map((challenge, index) => {
                  const challengeNumber = index + 1
                  const isActive = activeChallenge.challengeId === challenge.id

                    return (
                      <Popover key={challenge.id}>
                        <PopoverTrigger asChild>
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors cursor-pointer border-2 ${
                              isActive
                                ? 'bg-primary text-primary-foreground border-primary'
                                : challenge.solved
                                  ? 'bg-green-500 text-white border-green-500'
                                  : 'bg-background text-muted-foreground border-border hover:border-primary hover:text-foreground'
                            }`}
                            title={`${challengeCounter}. ${challenge.name}`}
                          >
                            {challenge.solved ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              challengeCounter
                            )}
                          </div>
                        </PopoverTrigger>
                        <PopoverContent
                          side="right"
                          className="w-80 sm:w-96 lg:w-[28rem] p-0"
                          align="center"
                        >
                          <ChallengePopoverContent
                            challenge={challenge}
                            isActive={isActive}
                            onStartChallenge={() => handleChallengeStart(module.id, challenge.id)}
                            isPending={startChallengeMutation.isPending}
                          />
                        </PopoverContent>
                      </Popover>
                    )
                  })
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      )}

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col">
        {/* Workspace Header */}
        {!headerHidden && (
          <div className="sticky top-0 z-40 bg-background border-b p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-semibold">{activeChallenge.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {dojo.name} → Module {activeChallenge.moduleId}
                </p>
              </div>

              {/* Smart Flag Input */}
              <SmartFlagInput
                dojoId={activeChallenge.dojoId}
                moduleId={activeChallenge.moduleId}
                challengeId={activeChallenge.challengeId}
              />

              {/* Service Tabs */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Full Screen Controls */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFullScreen(true)}
                  title="Full screen mode (F11)"
                >
                  <Maximize className="h-4 w-4" />
                </Button>

                <div className="w-px h-6 bg-border" />
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
        )}

        {/* Workspace Content */}
        <div className="flex-1 p-4">
          {workspaceStatus?.active && workspaceData?.iframe_src ? (
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

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        commands={commands}
      />
    </div>
  )
}