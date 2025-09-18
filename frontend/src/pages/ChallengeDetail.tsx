import { Link, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Markdown } from '@/components/ui/markdown'
import { useDojoModules, useDojoSolves, useChallengeDescription } from '@/hooks/useDojo'
import { ArrowLeft, CheckCircle, Circle, Play, Terminal, Flag, Loader2 } from 'lucide-react'

export default function ChallengeDetail() {
  const { dojoId, moduleId, challengeId } = useParams()
  
  const { 
    data: modulesData, 
    isLoading: isLoadingModules, 
    error: modulesError 
  } = useDojoModules(dojoId || '', !!dojoId && !!moduleId && !!challengeId)
  
  const { 
    data: solvesData 
  } = useDojoSolves(dojoId || '', undefined, !!dojoId && !!moduleId && !!challengeId)
  
  const { 
    data: descriptionData, 
    isLoading: isLoadingDescription 
  } = useChallengeDescription(
    dojoId || '', 
    moduleId || '', 
    challengeId || '',
    !!dojoId && !!moduleId && !!challengeId
  )

  if (!dojoId || !moduleId || !challengeId) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Challenge not found</h1>
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
          <p>Loading challenge...</p>
        </div>
      </div>
    )
  }

  if (modulesError || !modulesData?.success) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Failed to load challenge</h1>
          <Link to={`/dojo/${dojoId}/module/${moduleId}`}>
            <Button variant="outline">Back to Module</Button>
          </Link>
        </div>
      </div>
    )
  }

  const module = modulesData.modules.find(m => m.id === moduleId)
  const challenge = module?.challenges.find(c => c.id === challengeId)
  
  if (!module || !challenge) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Challenge not found</h1>
          <Link to={`/dojo/${dojoId}/module/${moduleId}`}>
            <Button variant="outline">Back to Module</Button>
          </Link>
        </div>
      </div>
    )
  }

  const solves = solvesData?.solves || []
  const isSolved = solves.some(solve => solve.challenge_id === challengeId)

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link 
            to={`/dojo/${dojoId}/module/${moduleId}`} 
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {module.name}
          </Link>
          
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-3">
              {isSolved ? (
                <CheckCircle className="h-6 w-6 text-primary mt-1" />
              ) : (
                <Circle className="h-6 w-6 text-muted-foreground mt-1" />
              )}
              <div>
                <h1 className="text-4xl font-bold mb-2">{challenge.name}</h1>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              {challenge.required && (
                <Badge variant="secondary">Required</Badge>
              )}
              <span className="text-lg font-bold text-muted-foreground">
                {isSolved ? 'Solved' : 'Unsolved'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="outline">{dojoId}</Badge>
            <Badge variant="outline">{module.name}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flag className="h-5 w-5" />
                  Challenge Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingDescription ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading description...</span>
                  </div>
                ) : descriptionData?.success && descriptionData.description ? (
                  <Markdown>{descriptionData.description}</Markdown>
                ) : (
                  <div className="text-muted-foreground">
                    <p>Challenge description will appear here when you start the challenge.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  Challenge Environment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-2">SSH Connection:</div>
                    <code className="text-sm">ssh user@pwn.college -p 22</code>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-2">Challenge Binary:</div>
                    <code className="text-sm">/challenge/{challenge.id}</code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" size="lg">
                  <Play className="h-4 w-4 mr-2" />
                  Start Challenge
                </Button>
                <Button variant="outline" className="w-full">
                  <Terminal className="h-4 w-4 mr-2" />
                  Open Terminal
                </Button>
                {isSolved && (
                  <div className="text-center text-sm text-muted-foreground">
                    ✓ Challenge completed!
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Challenge Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Required:</span>
                  <span className={challenge.required ? 'text-primary' : 'text-muted-foreground'}>
                    {challenge.required ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={isSolved ? 'text-primary' : 'text-muted-foreground'}>
                    {isSolved ? 'Solved' : 'Unsolved'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start" size="sm">
                  📚 Documentation
                </Button>
                <Button variant="ghost" className="w-full justify-start" size="sm">
                  💡 Hints
                </Button>
                <Button variant="ghost" className="w-full justify-start" size="sm">
                  🔧 Tools
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}