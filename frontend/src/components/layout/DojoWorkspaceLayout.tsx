import { useState, useEffect } from 'react'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useStartChallenge } from '@/hooks/useDojo'
import { FullScreenWorkspace } from './FullScreenWorkspace'
import { useHeader } from '@/contexts/HeaderContext'
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
  const [activeService, setActiveService] = useState<string>('terminal')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(320)
  const [isResizing, setIsResizing] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const { headerHidden, setHeaderHidden } = useHeader()
  const startChallengeMutation = useStartChallenge()

  const { data: workspaceStatus } = useWorkspace({}, !!activeChallenge)
  const { data: workspaceData } = useWorkspace(
    { service: activeService },
    !!activeChallenge && workspaceStatus?.active
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
    headerHidden,
    workspaceStatus,
    setActiveService,
    setSidebarCollapsed,
    setIsFullScreen,
    setHeaderHidden,
    onChallengeStart: handleChallengeStart,
    onChallengeClose
  })

  // Setup hotkeys
  useHotkeys({
    [hotkey.ctrlShift('p')]: () => setCommandPaletteOpen(prev => !prev),
    [hotkey.cmdShift('p')]: () => setCommandPaletteOpen(prev => !prev),
    [hotkey.ctrl('b')]: () => setSidebarCollapsed(prev => !prev),
    [hotkey.cmd('b')]: () => setSidebarCollapsed(prev => !prev),
    [hotkey.ctrl('h')]: () => setHeaderHidden(prev => !prev),
    [hotkey.cmd('h')]: () => setHeaderHidden(prev => !prev),
    ['f11']: () => setIsFullScreen(prev => !prev),
    ['escape']: () => isFullScreen && setIsFullScreen(false),
    [hotkey.ctrl('1')]: () => workspaceStatus?.active && setActiveService('terminal'),
    [hotkey.ctrl('2')]: () => workspaceStatus?.active && setActiveService('code'),
    [hotkey.ctrl('3')]: () => workspaceStatus?.active && setActiveService('desktop'),
  }, [isFullScreen, workspaceStatus?.active])

  // Auto-expand module and reset service
  useEffect(() => {
    if (activeChallenge) {
      setActiveService('terminal')
      setHeaderHidden(true)
    }
  }, [activeChallenge.challengeId, setHeaderHidden])

  // Full screen mode
  if (isFullScreen) {
    return (
      <FullScreenWorkspace
        activeChallenge={activeChallenge}
        activeService={activeService}
        workspaceStatus={workspaceStatus}
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
        headerHidden={headerHidden}
        onSidebarCollapse={setSidebarCollapsed}
        onHeaderToggle={setHeaderHidden}
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
          workspaceActive={workspaceStatus?.active || false}
          isFullScreen={isFullScreen}
          headerHidden={headerHidden}
          onServiceChange={setActiveService}
          onFullScreenToggle={() => setIsFullScreen(!isFullScreen)}
        />

        <WorkspaceContent
          workspaceActive={workspaceStatus?.active || false}
          workspaceData={workspaceData}
          activeService={activeService}
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