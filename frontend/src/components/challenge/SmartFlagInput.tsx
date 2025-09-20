import { useState, useEffect, useRef } from 'react'
import { Flag, Check, X, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Flag pattern validation
  const flagPattern = /^pwn\.college\{[^}]+\}$/
  const isValidFlag = flagPattern.test(value)

  const submitFlag = async (flag: string) => {
    if (!flag.trim() || isSubmitting) return

    setIsSubmitting(true)
    setStatus('idle')

    try {
      // Mock submission - replace with actual API call
      const result = onFlagSubmit
        ? await onFlagSubmit(flag)
        : await mockFlagSubmission(flag)

      setStatus(result.success ? 'success' : 'error')
      setMessage(result.message)
      setShowFeedback(true)

      if (result.success) {
        setValue('')
        // Auto-hide success feedback after 3 seconds
        setTimeout(() => setShowFeedback(false), 3000)
      } else {
        // Auto-hide error feedback after 5 seconds
        setTimeout(() => setShowFeedback(false), 5000)
      }
    } catch (error) {
      setStatus('error')
      setMessage('Failed to submit flag. Please try again.')
      setShowFeedback(true)
      setTimeout(() => setShowFeedback(false), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Mock flag submission - replace with actual implementation
  const mockFlagSubmission = async (flag: string): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call

    // Mock validation
    if (flag === 'pwn.college{test_flag}') {
      return { success: true, message: 'Correct flag! +100 points' }
    } else {
      return { success: false, message: 'Incorrect flag. Try again!' }
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
      return <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
    }

    switch (status) {
      case 'success':
        return <Check className="h-3 w-3 text-green-500" />
      case 'error':
        return <X className="h-3 w-3 text-red-500" />
      default:
        if (isValidFlag) {
          return <Check className="h-3 w-3 text-green-500" />
        }
        return <Badge variant="outline" className="text-xs font-mono bg-muted/50">↵</Badge>
    }
  }

  const getInputClasses = () => {
    return cn(
      "h-9 w-64 px-3 py-2 pr-8 text-sm bg-background border rounded-md transition-all duration-200",
      "focus:outline-none focus:ring-2 focus:ring-offset-2 placeholder:text-muted-foreground",
      {
        'border-input focus:ring-ring': status === 'idle',
        'border-green-500 focus:ring-green-500 bg-green-50/50': status === 'success',
        'border-red-500 focus:ring-red-500 bg-red-50/50': status === 'error',
        'border-blue-500 focus:ring-blue-500': isValidFlag && status === 'idle',
        'animate-pulse': isSubmitting
      }
    )
  }

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <Flag className={cn(
        "h-4 w-4 transition-colors duration-200",
        {
          'text-primary': status === 'idle',
          'text-green-500': status === 'success',
          'text-red-500': status === 'error',
          'text-blue-500': isValidFlag && status === 'idle'
        }
      )} />

      <div className="relative">
        <Popover open={showFeedback && !!message} onOpenChange={setShowFeedback}>
          <PopoverTrigger asChild>
            <input
              ref={inputRef}
              type="text"
              placeholder="Enter flag..."
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className={getInputClasses()}
              disabled={isSubmitting}
            />
          </PopoverTrigger>
          {message && (
            <PopoverContent
              side="bottom"
              className={cn(
                "text-sm font-medium p-2 w-auto",
                {
                  'bg-green-500 text-white border-green-500': status === 'success',
                  'bg-red-500 text-white border-red-500': status === 'error'
                }
              )}
            >
              {message}
            </PopoverContent>
          )}
        </Popover>

        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          {getStatusIcon()}
        </div>
      </div>
    </div>
  )
}