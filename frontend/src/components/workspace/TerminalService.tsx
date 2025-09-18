import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Terminal, Maximize2, Minimize2, RefreshCw, ExternalLink } from 'lucide-react'

interface TerminalServiceProps {
  isActive: boolean
  className?: string
}

export function TerminalService({ isActive, className }: TerminalServiceProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Use proxy HTML page to bypass CTFd CORS restrictions
  const terminalUrl = `http://localhost:5173/workspace-proxy.html?service=terminal`

  useEffect(() => {
    if (isActive && iframeRef.current) {
      setIsLoading(true)
      setError(null)
    }
  }, [isActive])

  const handleIframeLoad = () => {
    setIsLoading(false)
    setError(null)
    
    // Debug: Try to access iframe content to see what's loaded
    try {
      const iframe = iframeRef.current
      if (iframe && iframe.contentDocument) {
        const title = iframe.contentDocument.title
        console.log('Terminal iframe loaded:', title)
        
        // Check if it's an error page
        const body = iframe.contentDocument.body?.textContent || ''
        if (body.includes('Forbidden') || body.includes('No active challenge')) {
          setError('No active challenge session. Start a challenge at http://localhost first.')
        }
      }
    } catch (e) {
      console.log('Cannot access iframe content (normal for cross-origin):', e)
    }
  }

  const handleIframeError = () => {
    setIsLoading(false)
    setError('Failed to load terminal. Please start a challenge first at http://localhost')
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
    window.open(terminalUrl, '_blank')
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
              <Terminal className="h-5 w-5" />
              <CardTitle className="text-lg">Terminal</CardTitle>
              <Badge variant="outline" className="text-xs">
                ttyd
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
                  <span>Loading terminal...</span>
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
              src={terminalUrl}
              className="w-full h-full border-0 rounded-b-lg"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              title="Terminal"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}