import { useState, useEffect } from 'react'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useStartChallenge } from '@/hooks/useDojo'
import { FullScreenWorkspace } from './FullScreenWorkspace'
import { useUIStore } from '@/stores'
import { CommandPalette } from '@/components/ui/command-palette'
import { useCommands } from '@/hooks/useCommands'
import { useHotkeys, hotkey } from '@/hooks/useHotkeys'
import { WorkspaceSidebar } from '@/components/workspace/WorkspaceSidebar'
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader'
import { WorkspaceContent } from '@/components/workspace/WorkspaceContent'

interface Challenge {
  id: string
  name: string
  required: boolean
  description?: string
  solved?: boolean
}

interface Module {
  id: string
  name: string
  challenges: Challenge[]
  description?: string
}

interface Dojo {
  id: string
  name: string
  description?: string
}

interface DojoWorkspaceLayoutProps {
  dojo: Dojo
  modules: Module[]
  activeChallenge: {
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
  // Use workspace state from Zustand store with individual selectors to avoid infinite loops
  const activeService = useUIStore(state => state.workspaceState.activeService)
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
  const isHeaderHidden = useUIStore(state => state.isHeaderHidden)
  const setHeaderHidden = useUIStore(state => state.setHeaderHidden)
  const startChallengeMutation = useStartChallenge()

  // Single workspace call that gets status and data in one request
  // Only enable when we have an active challenge AND it's not currently starting
  const { data: workspaceData } = useWorkspace(
    { service: activeService },
    !!activeChallenge && !activeChallenge.isStarting
  )

  // Get the current module (we only have one in workspace view)
  const currentModule = modules[0]

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

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)

    const containerRect = e.currentTarget.parentElement?.getBoundingClientRect()
    const sidebarElement = e.currentTarget.parentElement as HTMLDivElement

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRect) return
      const newWidth = Math.max(200, Math.min(600, e.clientX - containerRect.left))
      sidebarElement.style.width = `${newWidth}px`
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (!containerRect) return
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''

      const finalWidth = Math.max(200, Math.min(600, e.clientX - containerRect.left))
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
    modules,
    activeService,
    sidebarCollapsed,
    isFullScreen,
    headerHidden: workspaceHeaderHidden,
    workspaceData,
    setActiveService,
    setSidebarCollapsed,
    setIsFullScreen: setFullScreen,
    setHeaderHidden: setWorkspaceHeaderHidden,
    onChallengeStart: handleChallengeStart,
    onChallengeClose
  })

  // Setup hotkeys
  useHotkeys({
    [hotkey.ctrlShift('p')]: () => setCommandPaletteOpen(prev => !prev),
    [hotkey.cmdShift('p')]: () => setCommandPaletteOpen(prev => !prev),
    [hotkey.ctrl('b')]: () => setSidebarCollapsed(prev => !prev),
    [hotkey.cmd('b')]: () => setSidebarCollapsed(prev => !prev),
    [hotkey.ctrl('h')]: () => setWorkspaceHeaderHidden(prev => !prev),
    [hotkey.cmd('h')]: () => setWorkspaceHeaderHidden(prev => !prev),
    ['f11']: () => setIsFullScreen(prev => !prev),
    ['escape']: () => isFullScreen && setIsFullScreen(false),
    [hotkey.ctrl('1')]: () => workspaceData?.active && setActiveService('terminal'),
    [hotkey.ctrl('2')]: () => workspaceData?.active && setActiveService('code'),
    [hotkey.ctrl('3')]: () => workspaceData?.active && setActiveService('desktop'),
  }, [isFullScreen, workspaceData?.active])

  // Auto-expand module and reset service
  useEffect(() => {
    if (activeChallenge) {
      setActiveService('terminal')
      // Don't auto-hide workspace header anymore since we want it visible by default
    }
  }, [activeChallenge.challengeId])

  // Full screen mode
  if (isFullScreen) {
    return (
      <FullScreenWorkspace
        activeChallenge={activeChallenge}
        activeService={activeService}
        workspaceStatus={workspaceData}
        workspaceData={workspaceData}
        onExitFullScreen={() => setIsFullScreen(false)}
      />
    )
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <WorkspaceSidebar
        module={currentModule}
        activeChallenge={activeChallenge}
        sidebarCollapsed={sidebarCollapsed}
        sidebarWidth={sidebarWidth}
        isResizing={isResizing}
        headerHidden={workspaceHeaderHidden}
        onSidebarCollapse={setSidebarCollapsed}
        onHeaderToggle={setWorkspaceHeaderHidden}
        onChallengeStart={handleChallengeStart}
        onChallengeClose={onChallengeClose}
        onResizeStart={handleResizeStart}
        isPending={startChallengeMutation.isPending}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col bg-background">
        <WorkspaceHeader
          activeChallenge={activeChallenge}
          dojoName={dojo.name}
          moduleName={currentModule?.name || 'Module'}
          activeService={activeService}
          workspaceActive={workspaceData?.active || false}
          isFullScreen={isFullScreen}
          headerHidden={workspaceHeaderHidden}
          onServiceChange={setActiveService}
          onFullScreenToggle={() => setIsFullScreen(!isFullScreen)}
        />

        <WorkspaceContent
          workspaceActive={workspaceData?.active || false}
          workspaceData={workspaceData}
          activeService={activeService}
          isStarting={activeChallenge?.isStarting || false}
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