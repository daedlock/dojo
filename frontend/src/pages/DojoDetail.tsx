import { Link, useParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { useDojoModules, useDojoSolves } from '@/hooks/useDojo'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function DojoDetail() {
  const { dojoId } = useParams()
  
  const { 
    data: modulesData, 
    isLoading: isLoadingModules, 
    error: modulesError 
  } = useDojoModules(dojoId || '', !!dojoId)
  
  const { 
    data: solvesData, 
    isLoading: isLoadingSolves 
  } = useDojoSolves(dojoId || '', undefined, !!dojoId)

  if (!dojoId) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Dojo not found</h1>
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
          <p>Loading dojo...</p>
        </div>
      </div>
    )
  }

  if (modulesError || !modulesData?.success) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Failed to load dojo</h1>
          <Link to="/">
            <Button variant="outline">Back to Dojos</Button>
          </Link>
        </div>
      </div>
    )
  }

  const modules = modulesData.modules || []
  const solves = solvesData?.solves || []
  
  // Calculate statistics
  const totalChallenges = modules.reduce((sum, module) => sum + module.challenges.length, 0)
  const completedChallenges = solves.length
  
  // Create a set of solved challenge IDs for quick lookup
  const solvedChallengeIds = new Set(solves.map(solve => solve.challenge_id))

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dojos
          </Link>
          
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{dojoId}</h1>
              <p className="text-muted-foreground text-lg mb-4">Cybersecurity challenges and learning modules</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary">Dojo</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{modules.length}</div>
                <div className="text-sm text-muted-foreground">Modules</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{totalChallenges}</div>
                <div className="text-sm text-muted-foreground">Total Challenges</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{completedChallenges}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </CardContent>
            </Card>
          </div>

          {totalChallenges > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Overall Progress</h3>
              <Progress 
                value={(completedChallenges / totalChallenges) * 100} 
                className="h-3"
              />
              <div className="text-right text-sm text-muted-foreground mt-1">
                {Math.round((completedChallenges / totalChallenges) * 100)}% complete
              </div>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6">Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modules.map((module) => {
              const moduleCompletedChallenges = module.challenges.filter(
                challenge => solvedChallengeIds.has(challenge.id)
              ).length
              
              return (
                <Link key={module.id} to={`/dojo/${dojoId}/module/${module.id}`}>
                  <Card className="h-full hover:bg-accent/50 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-xl">{module.name}</CardTitle>
                      <CardDescription>{module.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span>{moduleCompletedChallenges}/{module.challenges.length}</span>
                        </div>
                        <Progress 
                          value={module.challenges.length > 0 ? (moduleCompletedChallenges / module.challenges.length) * 100 : 0} 
                          className="h-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{module.challenges.length} challenges</span>
                          <span>
                            {module.challenges.length > 0 
                              ? Math.round((moduleCompletedChallenges / module.challenges.length) * 100)
                              : 0}% complete
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}