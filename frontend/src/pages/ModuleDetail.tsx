import { Link, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Markdown } from '@/components/ui/markdown'
import { useDojoModules, useDojoSolves } from '@/hooks/useDojo'
import { ArrowLeft, CheckCircle, Circle, Loader2 } from 'lucide-react'

export default function ModuleDetail() {
  const { dojoId, moduleId } = useParams()
  
  const { 
    data: modulesData, 
    isLoading: isLoadingModules, 
    error: modulesError 
  } = useDojoModules(dojoId || '', !!dojoId && !!moduleId)
  
  const {
    data: solvesData
  } = useDojoSolves(dojoId || '', undefined, !!dojoId && !!moduleId)

  if (!dojoId || !moduleId) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Module not found</h1>
          <Link to="/">
            <Button variant="outline">Back to Dojos</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (isLoadingModules) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading module...</p>
        </div>
      </div>
    )
  }

  if (modulesError || !modulesData?.success) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Failed to load module</h1>
          <Link to={`/dojo/${dojoId}`}>
            <Button variant="outline">Back to Dojo</Button>
          </Link>
        </div>
      </div>
    )
  }

  const module = modulesData.modules.find(m => m.id === moduleId)
  
  if (!module) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Module not found</h1>
          <Link to={`/dojo/${dojoId}`}>
            <Button variant="outline">Back to Dojo</Button>
          </Link>
        </div>
      </div>
    )
  }

  const solves = solvesData?.solves || []
  const solvedChallengeIds = new Set(solves.map(solve => solve.challenge_id))
  const completedChallenges = module.challenges.filter(
    challenge => solvedChallengeIds.has(challenge.id)
  ).length

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link 
            to={`/dojo/${dojoId}`} 
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {dojoId}
          </Link>
          
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2">{module.name}</h1>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline">{dojoId}</Badge>
              <span className="text-sm text-muted-foreground">
                {completedChallenges}/{module.challenges.length} challenges completed
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {module.description && (
            <Card>
              <CardHeader>
                <CardTitle>Module Description</CardTitle>
              </CardHeader>
              <CardContent>
                <Markdown>{module.description}</Markdown>
              </CardContent>
            </Card>
          )}

          <div>
            <h2 className="text-2xl font-bold mb-6">Challenges</h2>
            <div className="space-y-4">
            {module.challenges.map((challenge) => {
              const isSolved = solvedChallengeIds.has(challenge.id)
              
              return (
                <Link key={challenge.id} to={`/dojo/${dojoId}/module/${moduleId}/challenge/${challenge.id}`}>
                  <Card className="hover:bg-accent/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {isSolved ? (
                            <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground mt-0.5" />
                          )}
                          <div>
                            <CardTitle className="text-xl">{challenge.name}</CardTitle>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {challenge.required && (
                            <Badge variant="secondary">Required</Badge>
                          )}
                          <span className="text-sm font-medium text-muted-foreground">
                            {isSolved ? 'Solved' : 'Unsolved'}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              )
            })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}