import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Monitor, Maximize2, Minimize2, RefreshCw, ExternalLink } from 'lucide-react'

interface DesktopServiceProps {
  isActive: boolean
  className?: string
}

export function DesktopService({ isActive, className }: DesktopServiceProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const desktopUrl = `http://localhost:5173/workspace-proxy.html?service=desktop`

  useEffect(() => {
    if (isActive && iframeRef.current) {
      setIsLoading(true)
      setError(null)
    }
  }, [isActive])

  const handleIframeLoad = () => {
    setIsLoading(false)
    setError(null)
  }

  const handleIframeError = () => {
    setIsLoading(false)
    setError('Failed to load desktop. Make sure you have started a challenge.')
  }

  const handleRefresh = () => {
    if (iframeRef.current) {
      setIsLoading(true)
      setError(null)
      iframeRef.current.src = iframeRef.current.src
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const openInNewTab = () => {
    window.open(desktopUrl, '_blank')
  }

  if (!isActive) {
    return null
  }

  return (
    <div className={`h-full flex flex-col ${className}`}>
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              <CardTitle className="text-lg">Desktop</CardTitle>
              <Badge variant="outline" className="text-xs">
                VNC
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={openInNewTab}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <div className={`relative h-full ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
            {isFullscreen && (
              <div className="absolute top-4 right-4 z-10">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={toggleFullscreen}
                >
                  <Minimize2 className="h-4 w-4 mr-2" />
                  Exit Fullscreen
                </Button>
              </div>
            )}
            
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Loading desktop...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <div className="text-center space-y-2">
                  <div className="text-destructive font-medium">{error}</div>
                  <Button onClick={handleRefresh} size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              </div>
            )}

            <iframe
              ref={iframeRef}
              src={desktopUrl}
              className="w-full h-full border-0 rounded-b-lg"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              title="Desktop"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}