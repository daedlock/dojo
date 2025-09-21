import { motion } from 'framer-motion'
import { useCallback } from 'react'
import { WorkspaceService } from './WorkspaceService'

interface WorkspaceContentProps {
  workspaceActive: boolean
  workspaceData: any
  activeService: string
  isStarting?: boolean
}

export function WorkspaceContent({
  workspaceActive,
  workspaceData,
  activeService,
  isStarting = false
}: WorkspaceContentProps) {
  const iframeSrc = workspaceData?.iframe_src

  const handleReady = useCallback(() => {
    console.log(`${activeService} service ready`)
  }, [activeService])
  return (
    <motion.div
      className="flex-1 p-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: 0.2, // Delay to start after workspace page animation
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      {isStarting ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p>Starting challenge...</p>
            <p className="text-sm mt-2">Setting up your workspace environment.</p>
          </div>
        </div>
      ) : workspaceActive && iframeSrc ? (
        <WorkspaceService
          iframeSrc={iframeSrc}
          activeService={activeService}
          onReady={handleReady}
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
    </motion.div>
  )
}