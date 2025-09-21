import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface WorkspaceServiceProps {
  iframeSrc: string
  activeService: string
  onReady?: () => void
}

export function WorkspaceService({ iframeSrc, activeService, onReady }: WorkspaceServiceProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout>()
  const retryCount = useRef(0)

  const maxRetries = 30 // 30 seconds with 1s delay
  const retryDelay = 1000

  const resetState = () => {
    setIsLoading(true)
    setError(null)
    setIsReady(false)
    retryCount.current = 0
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
    }
  }

  const loadIframe = () => {
    if (retryCount.current >= maxRetries) {
      setError(`${activeService} service timed out after ${maxRetries} seconds`)
      setIsLoading(false)
      return
    }

    retryCount.current++
    console.log(`Loading ${activeService} service... (${retryCount.current}/${maxRetries})`)

    // Construct full URL using environment variable
    const baseUrl = import.meta.env.VITE_DOJO_BASE_URL || window.location.origin
    const fullUrl = iframeSrc.startsWith('/') ? `${baseUrl}${iframeSrc}` : iframeSrc

    // Load iframe directly - let iframe events handle success/failure
    if (iframeRef.current) {
      iframeRef.current.src = fullUrl
    }
  }

  useEffect(() => {
    resetState()
    loadIframe()
  }, [iframeSrc, activeService])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const handleLoad = () => {
      try {
        // Check if iframe content contains 502 error (only works for same-origin)
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
        if (iframeDoc && iframeDoc.body) {
          const bodyText = iframeDoc.body.textContent || iframeDoc.body.innerText || ''
          const titleText = iframeDoc.title || ''

          // Check for various 502 error indicators
          if (bodyText.includes('502 Bad Gateway') ||
              bodyText.includes('Bad Gateway') ||
              titleText.includes('502') ||
              bodyText.includes('nginx/') && bodyText.includes('error')) {
            console.log(`${activeService} iframe loaded with 502 error, retrying...`)
            retryTimeoutRef.current = setTimeout(loadIframe, retryDelay)
            return
          }

          console.log(`${activeService} iframe content accessible and valid`)
        } else {
          console.log(`${activeService} iframe loaded but content not accessible (cross-origin or loading)`)
        }
      } catch (error) {
        // Security error accessing iframe content - this is normal for cross-origin
        console.log(`${activeService} iframe loaded (cross-origin, cannot inspect content)`)
      }

      // If we get here, either content is good or we can't check it (assume good)
      console.log(`${activeService} iframe loaded successfully`)
      setIsLoading(false)
      setIsReady(true)
      setError(null)
      onReady?.()
    }

    const handleError = () => {
      console.log(`${activeService} iframe failed to load, retrying...`)
      retryTimeoutRef.current = setTimeout(loadIframe, retryDelay)
    }

    iframe.addEventListener('load', handleLoad)
    iframe.addEventListener('error', handleError)

    return () => {
      iframe.removeEventListener('load', handleLoad)
      iframe.removeEventListener('error', handleError)
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [activeService, onReady])

  return (
    <div className="relative w-full h-full">
      {/* Always show iframe, but hide it when not ready */}
      <iframe
        ref={iframeRef}
        src=""
        className={`w-full h-full border-0 rounded-lg transition-opacity duration-300 ${
          isReady ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        title={`Workspace ${activeService}`}
        allow="clipboard-write"
      />

      {/* Loading overlay when not ready */}
      {!isReady && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-background"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="text-center">
            {isLoading ? (
              <>
                <div className="w-16 h-16 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4" />
                <p className="text-lg font-medium">Loading {activeService}...</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {activeService === 'code' && 'Starting VS Code environment'}
                  {activeService === 'terminal' && 'Initializing terminal session'}
                  {activeService === 'desktop' && 'Setting up desktop environment'}
                </p>
              </>
            ) : error ? (
              <>
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-destructive text-2xl">⚠</span>
                </div>
                <p className="text-lg font-medium text-destructive">Failed to load {activeService}</p>
                <p className="text-sm text-muted-foreground mt-2">{error}</p>
              </>
            ) : null}
          </div>
        </motion.div>
      )}
    </div>
  )
}