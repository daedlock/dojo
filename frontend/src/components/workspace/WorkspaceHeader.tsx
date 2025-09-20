import { Button } from '@/components/ui/button'
import { SmartFlagInput } from '@/components/challenge/SmartFlagInput'
import {
  Terminal,
  Code,
  Monitor,
  Maximize,
  Minimize
} from 'lucide-react'

interface WorkspaceHeaderProps {
  activeChallenge: {
    dojoId: string
    moduleId: string
    challengeId: string
    name: string
  }
  dojoName: string
  moduleName: string
  activeService: string
  workspaceActive: boolean
  isFullScreen: boolean
  headerHidden: boolean
  onServiceChange: (service: string) => void
  onFullScreenToggle: () => void
}

export function WorkspaceHeader({
  activeChallenge,
  dojoName,
  moduleName,
  activeService,
  workspaceActive,
  isFullScreen,
  headerHidden,
  onServiceChange,
  onFullScreenToggle
}: WorkspaceHeaderProps) {
  if (headerHidden) {
    return null
  }

  return (
    <div className="sticky top-0 z-40 bg-background border-b p-4 animate-in slide-in-from-top-4 duration-300 ease-out">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold">{activeChallenge.name}</h1>
          <p className="text-sm text-muted-foreground">
            {dojoName} → {moduleName}
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
            onClick={onFullScreenToggle}
            title={isFullScreen ? "Exit fullscreen (Esc)" : "Full screen mode (F11)"}
          >
            {isFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>

          <div className="w-px h-6 bg-border" />

          {workspaceActive && (
            <>
              <Button
                variant={activeService === 'terminal' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onServiceChange('terminal')}
              >
                <Terminal className="h-4 w-4 mr-2" />
                Terminal
              </Button>
              <Button
                variant={activeService === 'code' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onServiceChange('code')}
              >
                <Code className="h-4 w-4 mr-2" />
                Editor
              </Button>
              <Button
                variant={activeService === 'desktop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onServiceChange('desktop')}
              >
                <Monitor className="h-4 w-4 mr-2" />
                Desktop
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}