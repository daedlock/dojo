import { useState, useEffect } from 'react'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useStartChallenge } from '@/hooks/useDojo'
import { FullScreenWorkspace } from './FullScreenWorkspace'
import { useUIStore } from '@/stores'
import { CommandPalette } from '@/components/ui/command-palette'
import { useCommands } from '@/hooks/useCommands'
import { useHotkeys, hotkey } from '@/hooks/useHotkeys'
import { WorkspaceSidebar } from '@/components/workspace/WorkspaceSidebar'
import { AnimatedWorkspaceHeader } from '@/components/workspace/AnimatedWorkspaceHeader'
import { WorkspaceContent } from '@/components/workspace/WorkspaceContent'
import type { Dojo, DojoModule } from '@/types/api'
import { useTheme } from '@/components/theme/ThemeProvider'

interface DojoWorkspaceLayoutProps {
  dojo: Dojo
  modules: DojoModule[]
  activeChallenge: {
    dojoId: string
    moduleId: string
    challengeId: string
    name: string
  }
  activeResource?: {
    id: string
    name: string
    type: 'markdown' | 'lecture' | 'header'
    content?: string
    video?: string
    playlist?: string
    slides?: string
  }
  onChallengeStart: (dojoId: string, moduleId: string, challengeId: string) => void
  onChallengeClose: () => void
  onResourceSelect?: (resourceId: string | null) => void
}

export function DojoWorkspaceLayout({
  dojo,
  modules,
  activeChallenge,
  activeResource,
  onChallengeStart,
  onChallengeClose,
  onResourceSelect
}: DojoWorkspaceLayoutProps) {
  // Use workspace state from Zustand store with individual selectors to avoid infinite loops
  const activeService = useUIStore(state => state.workspaceState.activeService)
  const preferredService = useUIStore(state => state.workspaceState.preferredService)
  const sidebarCollapsed = useUIStore(state => state.workspaceState.sidebarCollapsed)
  const isFullScreen = useUIStore(state => state.workspaceState.isFullScreen)
  const sidebarWidth = useUIStore(state => state.workspaceState.sidebarWidth)
  const commandPaletteOpen = useUIStore(state => state.workspaceState.commandPaletteOpen)
  const workspaceHeaderHidden = useUIStore(state => state.workspaceState.workspaceHeaderHidden)

  const setActiveService = useUIStore(state => state.setActiveService)
  const setSidebarCollapsed = useUIStore(state => state.setSidebarCollapsed)
  const setFullScreen = useUIStore(state => state.setFullScreen)
  const setSidebarWidth = useUIStore(state => state.setSidebarWidth)
  const setCommandPaletteOpen = useUIStore(state => state.setCommandPaletteOpen)
  const setWorkspaceHeaderHidden = useUIStore(state => state.setWorkspaceHeaderHidden)

  const [isResizing, setIsResizing] = useState(false)
  const [activeResourceTab, setActiveResourceTab] = useState<string>("video")
  const startChallengeMutation = useStartChallenge()
  const { palette } = useTheme()

  // Pass theme name for terminal and code services
  const serviceTheme = (activeService === 'terminal' || activeService === 'code') ? palette : undefined

  // Single workspace call that gets status and data in one request
  // Only enable when we have an active challenge AND it's not currently starting
  // Include challenge info in query key so it refetches when challenge changes
  const { data: workspaceData } = useWorkspace(
    {
      service: activeService,
      challenge: `${activeChallenge.dojoId}-${activeChallenge.moduleId}-${activeChallenge.challengeId}`,
      theme: serviceTheme
    },
    !!activeChallenge
  )

  // Get the current module (we only have one in workspace view)
  const currentModule = modules[0]

  const handleChallengeStart = async (moduleId: string, challengeId: string) => {
    // 1. Navigate immediately for instant UX
    onChallengeStart(dojo.id, moduleId, challengeId)

    // 2. Start challenge on server in background
    try {
      await startChallengeMutation.mutateAsync({
        dojoId: dojo.id,
        moduleId,
        challengeId,
        practice: false
      })
      console.log('Challenge started successfully')
    } catch (error) {
      console.error('Failed to start challenge:', error)
    }
  }

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)

    const containerRect = e.currentTarget.parentElement?.getBoundingClientRect()
    const sidebarElement = e.currentTarget.parentElement as HTMLDivElement

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRect) return
      const newWidth = Math.max(320, Math.min(600, e.clientX - containerRect.left))
      sidebarElement.style.width = `${newWidth}px`
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (!containerRect) return
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''

      const finalWidth = Math.max(320, Math.min(600, e.clientX - containerRect.left))
      setSidebarWidth(finalWidth)
      setIsResizing(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  const commands = useCommands({
    activeChallenge,
    modules: modules.map(m => ({ ...m, challenges: m.challenges.map(c => ({ ...c, id: c.id.toString() })) })),
    activeService,
    sidebarCollapsed,
    isFullScreen,
    headerHidden: workspaceHeaderHidden,
    setActiveService,
    setSidebarCollapsed,
    setIsFullScreen: setFullScreen,
    setHeaderHidden: setWorkspaceHeaderHidden,
    onChallengeStart: handleChallengeStart,
    onChallengeClose
  })

  // Setup hotkeys
  useHotkeys({
    [hotkey.ctrlShift('p')]: () => setCommandPaletteOpen(!commandPaletteOpen),
    [hotkey.cmdShift('p')]: () => setCommandPaletteOpen(!commandPaletteOpen),
    [hotkey.ctrl('b')]: () => setSidebarCollapsed(!sidebarCollapsed),
    [hotkey.cmd('b')]: () => setSidebarCollapsed(!sidebarCollapsed),
    [hotkey.ctrl('h')]: () => setWorkspaceHeaderHidden(!workspaceHeaderHidden),
    [hotkey.cmd('h')]: () => setWorkspaceHeaderHidden(!workspaceHeaderHidden),
    ['f11']: () => setFullScreen(!isFullScreen),
    ['escape']: () => isFullScreen && setFullScreen(false),
    [hotkey.ctrl('1')]: () => workspaceData?.active && setActiveService('terminal'),
    [hotkey.ctrl('2')]: () => workspaceData?.active && setActiveService('code'),
    [hotkey.ctrl('3')]: () => workspaceData?.active && setActiveService('desktop'),
  }, [isFullScreen, workspaceData?.active])

  // Auto-expand module and use preferred service
  useEffect(() => {
    if (activeChallenge) {
      setActiveService(preferredService)
      // Don't auto-hide workspace header anymore since we want it visible by default
    }
  }, [activeChallenge.challengeId, preferredService, setActiveService])

  // Full screen mode
  if (isFullScreen) {
    return (
      <FullScreenWorkspace
        activeChallenge={activeChallenge}
        activeService={activeService}
        workspaceStatus={workspaceData}
        workspaceData={workspaceData}
      />
    )
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <WorkspaceSidebar
        module={currentModule ? { ...currentModule, challenges: currentModule.challenges.map(c => ({ ...c, id: c.id.toString() })) } : { id: '', name: 'Module', challenges: [] }}
        dojoName={dojo.name}
        activeChallenge={activeChallenge}
        activeResource={activeResource?.id}
        sidebarCollapsed={sidebarCollapsed}
        sidebarWidth={sidebarWidth}
        isResizing={isResizing}
        headerHidden={workspaceHeaderHidden}
        onSidebarCollapse={setSidebarCollapsed}
        onHeaderToggle={setWorkspaceHeaderHidden}
        onChallengeStart={handleChallengeStart}
        onChallengeClose={onChallengeClose}
        onResizeStart={handleResizeStart}
        onResourceSelect={onResourceSelect}
        isPending={startChallengeMutation.isPending}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Unified animated header for both challenges and resources */}
        <AnimatedWorkspaceHeader
          activeChallenge={activeChallenge}
          dojoName={dojo.name}
          moduleName={currentModule?.name || 'Module'}
          activeService={activeService}
          workspaceActive={workspaceData?.active || false}
          activeResource={activeResource}
          activeResourceTab={activeResourceTab}
          onResourceTabChange={setActiveResourceTab}
          isFullScreen={isFullScreen}
          headerHidden={workspaceHeaderHidden}
          onServiceChange={setActiveService}
          onFullScreenToggle={() => setFullScreen(!isFullScreen)}
          onClose={onChallengeClose}
          onResourceClose={() => {
            if (onResourceSelect) {
              onResourceSelect(null)
            }
          }}
        />

        <WorkspaceContent
          workspaceActive={workspaceData?.active || false}
          workspaceData={workspaceData}
          activeService={activeService}
          activeResource={activeResource}
          activeResourceTab={activeResourceTab}
          activeChallenge={activeChallenge}
          dojoName={dojo.name}
          moduleName={currentModule?.name || 'Module'}
          isStarting={false}
          onResourceClose={() => {
            if (onResourceSelect) {
              onResourceSelect(null)
            }
          }}
          onChallengeClose={onChallengeClose}
          onServiceChange={setActiveService}
          onResourceTabChange={setActiveResourceTab}
        />
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