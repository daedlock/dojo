import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play } from 'lucide-react'
import { Markdown } from '@/components/ui/markdown'

interface Challenge {
  id: string
  name: string
  required?: boolean
  description?: string
  solved?: boolean
  difficulty?: string
  points?: number
}

interface ChallengePopoverContentProps {
  challenge: Challenge
  isActive: boolean
  onStartChallenge: () => void
  isPending: boolean
}

export function ChallengePopoverContent({
  challenge,
  isActive,
  onStartChallenge,
  isPending
}: ChallengePopoverContentProps) {
  return (
    <div className="flex flex-col" style={{ maxHeight: '70vh' }}>
      <div className="p-4 border-b flex-shrink-0">
        <h4 className="font-semibold">{challenge.name}</h4>
        <div className="flex flex-wrap gap-2 mt-1">
          {challenge.required && (
            <Badge variant="secondary" className="text-xs">
              Required
            </Badge>
          )}
          {challenge.difficulty && (
            <Badge variant="outline" className="text-xs">
              {challenge.difficulty}
            </Badge>
          )}
          {challenge.points && (
            <Badge variant="outline" className="text-xs">
              {challenge.points} pts
            </Badge>
          )}
          {challenge.solved && (
            <Badge variant="default" className="text-xs bg-green-500">
              Solved
            </Badge>
          )}
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto max-h-96 p-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent hover:scrollbar-thumb-border/80"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'hsl(var(--border)) transparent'
        }}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        {challenge.description ? (
          <div className="text-sm text-muted-foreground prose prose-sm max-w-none">
            <Markdown className="text-sm">{challenge.description}</Markdown>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground italic">
            No description available for this challenge.
          </div>
        )}
      </div>

      {!isActive && (
        <div className="p-4 border-t flex-shrink-0">
          <Button
            onClick={onStartChallenge}
            disabled={isPending}
            size="sm"
            className="w-full"
          >
            <Play className="h-3 w-3 mr-2" />
            Start Challenge
          </Button>
        </div>
      )}
    </div>
  )
}