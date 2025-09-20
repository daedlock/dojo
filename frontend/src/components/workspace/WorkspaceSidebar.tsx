import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  CheckCircle,
  Circle,
  Play,
  Info,
  PanelLeftClose,
  PanelLeftOpen,
  Eye,
  EyeOff,
  X,
  GripVertical
} from 'lucide-react'
import { ChallengePopoverContent } from '@/components/challenge/ChallengePopover'
import { cn } from '@/lib/utils'

interface Challenge {
  id: string
  name: string
  solved?: boolean
  required?: boolean
  description?: string
}

interface Module {
  id: string
  name: string
  challenges: Challenge[]
}

interface WorkspaceSidebarProps {
  module: Module
  activeChallenge: {
    challengeId: string
  }
  sidebarCollapsed: boolean
  sidebarWidth: number
  isResizing: boolean
  headerHidden: boolean
  onSidebarCollapse: (collapsed: boolean) => void
  onHeaderToggle: (hidden: boolean) => void
  onChallengeStart: (moduleId: string, challengeId: string) => void
  onChallengeClose: () => void
  onResizeStart: (e: React.MouseEvent) => void
  isPending?: boolean
}

export function WorkspaceSidebar({
  module,
  activeChallenge,
  sidebarCollapsed,
  sidebarWidth,
  isResizing,
  headerHidden,
  onSidebarCollapse,
  onHeaderToggle,
  onChallengeStart,
  onChallengeClose,
  onResizeStart,
  isPending = false
}: WorkspaceSidebarProps) {
  return (
    <div
      className={cn(
        "border-r bg-background flex flex-col h-full relative transition-all duration-300",
        sidebarCollapsed ? "w-12" : "",
        !isResizing ? "transition-all duration-300" : ""
      )}
      style={{ width: sidebarCollapsed ? '48px' : `${sidebarWidth}px` }}
    >
      {/* Resize Handle */}
      {!sidebarCollapsed && (
        <div
          className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors group"
          onMouseDown={onResizeStart}
        >
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-muted-foreground/20 rounded-sm px-0.5 py-8">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b p-4 animate-in fade-in slide-in-from-top-2 duration-300 delay-100">
        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!sidebarCollapsed ? (
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold truncate">{module.name}</h2>
              <p className="text-xs text-muted-foreground">{module.challenges.length} Challenges</p>
            </div>
          ) : null}

          <div className={`flex items-center gap-1 ${sidebarCollapsed ? 'flex-col' : 'flex-shrink-0'}`}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onHeaderToggle(!headerHidden)}
              title={headerHidden ? "Show header (Ctrl+H)" : "Hide header (Ctrl+H)"}
            >
              {headerHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSidebarCollapse(!sidebarCollapsed)}
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

      {/* Challenge List */}
      {!sidebarCollapsed ? (
        <ScrollArea className="flex-1 h-full">
          <div className="p-3 space-y-1">
            {module.challenges.map((challenge) => {
              const isActive = activeChallenge.challengeId === challenge.id

              return (
                <div
                  key={challenge.id}
                  className={cn(
                    "flex items-center justify-between gap-2 p-2.5 rounded-md text-sm transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-muted/70 cursor-pointer"
                  )}
                  onClick={() => !isActive && onChallengeStart(module.id, challenge.id)}
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
                          onStartChallenge={() => onChallengeStart(module.id, challenge.id)}
                          isPending={isPending}
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
                          onChallengeStart(module.id, challenge.id)
                        }}
                        disabled={isPending}
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
        /* Collapsed Sidebar - Show challenge numbers */
        <ScrollArea className="flex-1">
          <div className="flex flex-col items-center py-4 gap-2">
            {module.challenges.map((challenge, index) => {
              const challengeNumber = index + 1
              const isActive = activeChallenge.challengeId === challenge.id

              return (
                <Popover key={challenge.id}>
                  <PopoverTrigger asChild>
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors cursor-pointer border-2",
                        isActive
                          ? "bg-primary text-primary-foreground border-primary"
                          : challenge.solved
                            ? "bg-green-500 text-white border-green-500"
                            : "bg-background text-muted-foreground border-border hover:border-primary hover:text-foreground"
                      )}
                      title={`${challengeNumber}. ${challenge.name}`}
                    >
                      {challenge.solved ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        challengeNumber
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
                      onStartChallenge={() => onChallengeStart(module.id, challenge.id)}
                      isPending={isPending}
                    />
                  </PopoverContent>
                </Popover>
              )
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}