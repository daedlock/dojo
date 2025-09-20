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
    <div className="flex-1 p-4">
      {workspaceActive && workspaceData?.iframe_src ? (
        <iframe
          key={`iframe-${activeService}`}
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
  )
}