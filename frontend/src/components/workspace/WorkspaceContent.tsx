import { motion, AnimatePresence } from 'framer-motion'

interface WorkspaceContentProps {
  workspaceActive: boolean
  workspaceData: any
  activeService: string
}

export function WorkspaceContent({
  workspaceActive,
  workspaceData,
  activeService
}: WorkspaceContentProps) {
  return (
    <div className="flex-1 p-4 animate-in fade-in slide-in-from-bottom-4 duration-400 ease-out delay-100">
      <AnimatePresence mode="wait">
        {workspaceActive && workspaceData?.iframe_src ? (
          <motion.iframe
            key={`iframe-${activeService}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            src={workspaceData.iframe_src.startsWith('/')
              ? `http://localhost${workspaceData.iframe_src}`
              : workspaceData.iframe_src}
            className="w-full h-full border-0 rounded-lg"
            title={`Workspace ${activeService}`}
          />
        ) : (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center h-full text-muted-foreground"
          >
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Preparing your workspace...
              </motion.p>
              <motion.p
                className="text-sm mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                This may take a few moments.
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}