import { useState, useEffect, useRef } from 'react'
import { Flag, Check, X, Loader2, Send } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useSubmitChallengeSolution } from '@/hooks/useDojo'
import { useDojoStore } from '@/stores'
import { motion, AnimatePresence } from 'framer-motion'

interface SmartFlagInputProps {
  dojoId: string
  moduleId: string
  challengeId: string
  onFlagSubmit?: (flag: string) => Promise<{ success: boolean; message: string }>
}

export function SmartFlagInput({
  dojoId,
  moduleId,
  challengeId,
  onFlagSubmit
}: SmartFlagInputProps) {
  const [value, setValue] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const submitSolution = useSubmitChallengeSolution()
  const isSubmitting = submitSolution.isPending
  const addSolve = useDojoStore(state => state.addSolve)

  // Flag pattern validation
  const flagPattern = /^pwn\.college\{[^}]+\}$/
  const isValidFlag = flagPattern.test(value)

  const submitFlag = async (flag: string) => {
    if (!flag.trim() || isSubmitting) return

    setStatus('idle')

    try {
      // Use custom onFlagSubmit if provided, otherwise use real API
      if (onFlagSubmit) {
        const result = await onFlagSubmit(flag)
        setStatus(result.success ? 'success' : 'error')
        setMessage(result.message)
        setShowFeedback(true)

        // Add solve to store if successful
        if (result.success) {
          addSolve(dojoId, moduleId, challengeId)
        }

        setValue('')
        setTimeout(() => {
          setShowFeedback(false)
          setStatus('idle')
          setMessage('')
        }, 3000)
      } else {
        // Use real flag submission API
        const submissionData = {
          dojoId,
          moduleId,
          challengeId,
          submission: { submission: flag.trim() }
        }

        const result = await submitSolution.mutateAsync(submissionData)

        if (result.success) {
          if (result.status === 'authentication_required') {
            setStatus('error')
            setMessage('Authentication required. Please log in.')
          } else if (result.status === 'already_solved') {
            setStatus('success')
            setMessage('Challenge already solved!')
          } else {
            setStatus('success')
            setMessage('Correct flag! Well done!')
            // Add solve to store for immediate UI update
            addSolve(dojoId, moduleId, challengeId)
          }
          setValue('')
          setTimeout(() => {
            setShowFeedback(false)
            setStatus('idle')
            setMessage('')
          }, 3000)
        } else {
          setStatus('error')
          setMessage('Incorrect flag. Try again!')
          setValue('')
          setTimeout(() => {
            setShowFeedback(false)
            setStatus('idle')
            setMessage('')
          }, 3000)
        }
        setShowFeedback(true)
      }
    } catch (error: any) {
      setStatus('error')

      let errorMessage = 'Failed to submit flag. Please try again.'
      if (error?.status === 401 || error?.status === 403) {
        errorMessage = 'Authentication required. Please log in.'
      } else if (error?.response?.message) {
        errorMessage = error.response.message
      }

      setMessage(errorMessage)
      setShowFeedback(true)
      setValue('')
      setTimeout(() => {
        setShowFeedback(false)
        setStatus('idle')
        setMessage('')
      }, 3000)
    }
  }


  // Auto-submit when valid flag pattern is detected
  useEffect(() => {
    if (isValidFlag && value !== '') {
      const timeoutId = setTimeout(() => {
        submitFlag(value)
      }, 500) // Small delay to prevent rapid submissions

      return () => clearTimeout(timeoutId)
    }
  }, [value, isValidFlag])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation()

    if (e.key === 'Enter') {
      e.preventDefault()
      submitFlag(value)
    }

    if (e.key === 'Escape') {
      setValue('')
      setShowFeedback(false)
    }
  }

  const getStatusIcon = () => {
    if (isSubmitting) {
      return <Loader2 className="h-4 w-4 animate-spin text-primary" />
    }

    switch (status) {
      case 'success':
        return <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      case 'error':
        return <X className="h-4 w-4 text-destructive" />
      default:
        if (isValidFlag) {
          return <Send className="h-4 w-4 text-primary" />
        }
        return null
    }
  }

  const getInputVariant = () => {
    if (status === 'success') return 'success'
    if (status === 'error') return 'destructive'
    if (isValidFlag && status === 'idle') return 'valid'
    return 'default'
  }

  return (
    <div className="relative">
      <Popover open={showFeedback && !!message} onOpenChange={setShowFeedback}>
        <PopoverTrigger asChild>
          <div className={cn(
            "relative flex items-center rounded-lg border h-9 px-3 gap-2 transition-all duration-200",
            {
              'border-muted-foreground/20 bg-muted/30 hover:bg-muted/50': status === 'idle' && !isValidFlag,
              'border-primary/50 bg-primary/5 hover:bg-primary/10': isValidFlag && status === 'idle',
              'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/30': status === 'success',
              'border-destructive/50 bg-destructive/5': status === 'error',
            }
          )}>
            <Flag className={cn(
              "h-4 w-4 flex-shrink-0 transition-colors duration-200",
              {
                'text-muted-foreground': status === 'idle' && !isValidFlag,
                'text-primary': isValidFlag && status === 'idle',
                'text-emerald-600 dark:text-emerald-400': status === 'success',
                'text-destructive': status === 'error',
              }
            )} />

            <input
              ref={inputRef}
              type="text"
              placeholder="Enter flag..."
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSubmitting}
              className={cn(
                "flex-1 bg-transparent border-0 outline-none text-sm",
                "placeholder:text-muted-foreground/60",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                {
                  'text-foreground': status === 'idle',
                  'text-primary font-medium': isValidFlag && status === 'idle',
                  'text-emerald-700 dark:text-emerald-400 font-medium': status === 'success',
                  'text-destructive font-medium': status === 'error',
                }
              )}
            />

            {getStatusIcon() && (
              <div className="flex-shrink-0">
                {getStatusIcon()}
              </div>
            )}
          </div>
        </PopoverTrigger>

        {message && (
          <PopoverContent
            side="bottom"
            align="start"
            className={cn(
              "text-sm font-medium p-3 max-w-xs border shadow-lg animate-in fade-in-0 zoom-in-95",
              {
                'bg-emerald-50/80 backdrop-blur-sm text-emerald-800 border-emerald-200/50 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-800/50': status === 'success',
                'bg-destructive/5 backdrop-blur-sm text-destructive border-destructive/20': status === 'error'
              }
            )}
          >
            {message}
          </PopoverContent>
        )}
      </Popover>
    </div>
  )
}